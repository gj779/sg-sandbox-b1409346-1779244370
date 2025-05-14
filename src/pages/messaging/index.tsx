
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useUser } from "@/contexts/UserContext";
import ConversationsList from "@/components/chat/ConversationsList";
import ChatInterface from "@/components/chat/ChatInterface";
import { UserProfile } from "@/types"; // Import UserProfile
import { conversationsService } // Import conversationsService
from "@/services/conversationsService"; 
import { profilesService } from "@/services/profilesService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

export default function MessagingPage() {
  const { user, isAuthenticated, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<UserProfile | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [searchUserTerm, setSearchUserTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState<UserProfile[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/messaging");
    }
  }, [isAuthenticated, userLoading, router]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectConversation = (conversationId: string, participant: UserProfile | null) => {
    setSelectedConversationId(conversationId);
    setOtherParticipant(participant);
  };

  const handleBackToList = () => {
    setSelectedConversationId(null);
    setOtherParticipant(null);
  };
  
  const handleSearchUsers = async () => {
    if (!searchUserTerm.trim()) {
      setSearchedUsers([]);
      return;
    }
    setIsSearchingUsers(true);
    try {
      // This is a simplified search. In a real app, you'd have a dedicated user search endpoint/service.
      // For now, let's assume profilesService can search or we fetch a few users.
      // This might need a backend function for efficient searching if user base is large.
      const allProfiles = await profilesService.getAllUserProfiles(); // Potentially inefficient
      const filtered = allProfiles.filter(p => 
        (p.id !== user?.uid) &&
        ((p.firstName?.toLowerCase().includes(searchUserTerm.toLowerCase())) ||
         (p.lastName?.toLowerCase().includes(searchUserTerm.toLowerCase())) ||
         (p.email?.toLowerCase().includes(searchUserTerm.toLowerCase())))
      );
      setSearchedUsers(filtered.slice(0, 10)); // Limit results
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchedUsers([]);
    }
    setIsSearchingUsers(false);
  };

  const handleStartNewConversation = async (selectedUser: UserProfile) => {
    if (!user || !selectedUser.id) return;
    try {
      const conversation = await conversationsService.createConversation([user.uid, selectedUser.id]);
      setSelectedConversationId(conversation.id);
      setOtherParticipant(selectedUser);
      setShowNewConversationDialog(false);
      setSearchUserTerm("");
      setSearchedUsers([]);
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };


  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // This will be handled by the useEffect redirect, but good to have a fallback UI
    return (
      <div className="container py-12 text-center">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const showChatInterface = selectedConversationId && otherParticipant;
  const showConversationList = !isMobileView || !showChatInterface;

  return (
    <>
      <Head>
        <title>Messages | StaffSpace</title>
        <meta name="description" content="Communicate with restaurants and job applicants on StaffSpace." />
      </Head>

      <div className="flex h-screen antialiased text-gray-800">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          {showConversationList && (
            <ConversationsList
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
              onCreateConversation={() => setShowNewConversationDialog(true)}
            />
          )}

          <div className="flex flex-col flex-auto h-full">
            {showChatInterface ? (
              <ChatInterface
                conversationId={selectedConversationId!}
                otherParticipant={otherParticipant}
                onBack={isMobileView ? handleBackToList : undefined}
              />
            ) : (
              !isMobileView && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <div className="mb-4 p-6 rounded-full bg-muted">
                    <MessageSquare className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-medium mb-2">Your Messages</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select a conversation to start chatting or create a new one.
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start a new conversation</DialogTitle>
            <DialogDescription>Search for a user to start chatting with.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Search by name or email" 
                value={searchUserTerm}
                onChange={(e) => setSearchUserTerm(e.target.value)}
              />
              <Button onClick={handleSearchUsers} disabled={isSearchingUsers || !searchUserTerm.trim()}>
                {isSearchingUsers ? "Searching..." : <Search className="h-4 w-4"/>}
              </Button>
            </div>
            <ScrollArea className="h-[200px] w-full">
              {searchedUsers.length > 0 ? (
                searchedUsers.map(sUser => (
                  <div 
                    key={sUser.id} 
                    className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                    onClick={() => handleStartNewConversation(sUser)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={sUser.photoURL} />
                        <AvatarFallback>{sUser.firstName?.[0] || sUser.email?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <span>{`${sUser.firstName || ""} ${sUser.lastName || ""}`.trim() || sUser.email}</span>
                    </div>
                  </div>
                ))
              ) : (
                !isSearchingUsers && searchUserTerm && <p className="text-sm text-muted-foreground text-center">No users found.</p>
              )}
              {isSearchingUsers && <p className="text-sm text-muted-foreground text-center">Searching...</p>}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
