
import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePresence } from "@/hooks/usePresence";
import { 
  conversationsService, 
  Conversation,
  Message
} from "@/services/conversationsService";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Search, Plus, MessageSquare, UserPlus } from "lucide-react";
import { UserProfile } from "@/types"; // Import UserProfile

interface ConversationsListProps {
  onSelectConversation: (conversationId: string, otherParticipant: UserProfile | null) => void;
  selectedConversationId?: string;
  onCreateConversation: () => void; // Callback to handle new conversation creation
}

export default function ConversationsList({
  onSelectConversation,
  selectedConversationId,
  onCreateConversation
}: ConversationsListProps) {
  const { user } = useUser();
  const { useMultipleUsersPresence } = usePresence();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const allParticipantIds = conversations
    .flatMap(conv => conv.participants)
    .filter(id => id !== user?.uid);
  
  const { presenceMap } = useMultipleUsersPresence(allParticipantIds);

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    const unsubscribe = conversationsService.subscribeToUserConversations(
      user.uid,
      (fetchedConversations) => {
        setConversations(fetchedConversations);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error subscribing to conversations:", err);
        setError("Failed to load conversations");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const getOtherParticipant = (conversation: Conversation): UserProfile | null => {
    if (!user) return null;
    const otherParticipantId = conversation.participants.find(id => id !== user.uid);
    if (!otherParticipantId) return null;
    return conversation.participantProfiles?.find(p => p.id === otherParticipantId) || null;
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    const searchTermLower = searchTerm.toLowerCase();
    const otherParticipant = getOtherParticipant(conversation);
    const participantName = otherParticipant ? `${otherParticipant.firstName || ""} ${otherParticipant.lastName || ""}`.trim() || otherParticipant.email : "";
    
    return (
      (conversation.lastMessage?.content.toLowerCase().includes(searchTermLower)) ||
      (participantName.toLowerCase().includes(searchTermLower))
    );
  });

  const getUserInitials = (participant: UserProfile | null) => {
    if (!participant) return "U";
    const name = `${participant.firstName || ""} ${participant.lastName || ""}`.trim();
    if (!name && participant.email) return participant.email.substring(0, 2).toUpperCase();
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatLastMessageTime = (timestamp: Date | undefined | string | null) => {
    if (!timestamp) return "";
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getUnreadCount = (conversation: Conversation) => {
    if (!user || !conversation.unreadCounts) return 0;
    return conversation.unreadCounts[user.uid] || 0;
  };

  const getOnlineStatusIndicator = (userId: string | undefined) => {
    if (!userId) return null;
    const presence = presenceMap[userId];
    if (!presence || presence.status === "offline") return null;
    
    const color = presence.status === "online" ? "bg-green-500" : "bg-yellow-500";
    return <div className={`absolute bottom-0 right-0 w-3 h-3 ${color} rounded-full border-2 border-background`} />;
  };

  return (
    <Card className="h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] lg:h-[700px] flex flex-col w-full md:w-[350px] lg:w-[400px]">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Messages</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCreateConversation} title="Start new conversation">
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-4">
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No conversations match your search" : "No conversations yet"}
              </p>
              {!searchTerm && (
                <p className="text-sm text-muted-foreground mt-1">
                  Click <UserPlus className="inline h-4 w-4 mx-1" /> to start a new chat.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const unreadCount = getUnreadCount(conversation);
                const isSelected = selectedConversationId === conversation.id;
                const participantName = otherParticipant ? `${otherParticipant.firstName || ""} ${otherParticipant.lastName || ""}`.trim() || otherParticipant.email || "Unknown User" : "Unknown User";

                return (
                  <div
                    key={conversation.id}
                    className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      isSelected ? "bg-muted" : ""
                    }`}
                    onClick={() => onSelectConversation(conversation.id, otherParticipant)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherParticipant?.photoURL} alt={participantName} />
                          <AvatarFallback>{getUserInitials(otherParticipant)}</AvatarFallback>
                        </Avatar>
                        {getOnlineStatusIndicator(otherParticipant?.id)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`font-medium truncate ${unreadCount > 0 ? "font-semibold" : ""}`}>
                            {participantName}
                          </p>
                          {conversation.lastMessage?.timestamp && (
                            <p className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatLastMessageTime(conversation.lastMessage.timestamp)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-sm text-muted-foreground truncate ${unreadCount > 0 ? "font-semibold text-primary" : ""}`}>
                            {conversation.lastMessage?.senderId === user?.uid && "You: "}
                            {conversation.lastMessage?.contentType === "image" ? "📷 Image" : 
                             conversation.lastMessage?.contentType === "file" ? `📄 ${conversation.lastMessage.fileName || "File"}` :
                             conversation.lastMessage?.content || "No messages yet"}
                          </p>
                          {unreadCount > 0 && (
                            <Badge className="ml-2 px-2 py-0.5 text-xs">{unreadCount}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
