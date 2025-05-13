import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePresence } from "@/hooks/usePresence";
import { 
  conversationsService, 
  Conversation 
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
import { Search, Plus, MessageSquare } from "lucide-react";

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation, otherUserId: string, otherUserName: string) => void;
  selectedConversationId?: string;
}

export default function ConversationsList({
  onSelectConversation,
  selectedConversationId
}: ConversationsListProps) {
  const { user, userProfile } = useUser();
  const { useMultipleUsersPresence } = usePresence();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get all participant IDs for presence tracking
  const allParticipantIds = conversations
    .flatMap(conv => conv.participants)
    .filter(id => id !== user?.uid);
  
  // Subscribe to presence for all participants
  const { presenceMap } = useMultipleUsersPresence(allParticipantIds);

  // Subscribe to conversations for the current user
  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const unsubscribe = conversationsService.subscribeToUserConversations(
        user.uid,
        (conversations) => {
          setConversations(conversations);
          setIsLoading(false);
        }
      );

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error("Error subscribing to conversations:", error);
      setError("Failed to load conversations");
      setIsLoading(false);
      return () => {};
    }
  }, [user]);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation => {
    // For now, we're just filtering by the last message text
    // In a real app, you would also filter by participant names
    if (!searchTerm) return true;
    
    const searchTermLower = searchTerm.toLowerCase();
    
    return conversation.lastMessage?.text.toLowerCase().includes(searchTermLower);
  });

  // Get the other user's ID from a conversation
  const getOtherUserId = (conversation: Conversation) => {
    return conversation.participants.find(id => id !== user?.uid) || "";
  };

  // Get user initials for avatar fallback
  const getUserInitials = (userId: string) => {
    // In a real app, you would get the user's name from a users collection
    // For now, we'll just use the first 2 characters of the user ID
    return userId.substring(0, 2).toUpperCase();
  };

  // Format the last message timestamp
  const formatLastMessageTime = (timestamp: Date | undefined | null) => {
    if (!timestamp) return "";
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  // Get the unread count for a conversation
  const getUnreadCount = (conversation: Conversation) => {
    if (!user || !conversation.unreadCount) return 0;
    return conversation.unreadCount[user.uid] || 0;
  };

  // Get the online status indicator for a user
  const getOnlineStatus = (userId: string) => {
    const presence = presenceMap[userId];
    if (!presence) return null;
    
    switch (presence.status) {
      case "online":
        return <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />;
      case "away":
        return <div className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-background" />;
      default:
        return null;
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Messages</CardTitle>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-destructive">{error}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              {searchTerm ? (
                <p className="text-muted-foreground">No conversations match your search</p>
              ) : (
                <>
                  <p className="text-muted-foreground mb-2">No conversations yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a new conversation by clicking the + button
                  </p>
                </>
              )}
            </div>
          ) : (
            <div>
              {filteredConversations.map((conversation) => {
                const otherUserId = getOtherUserId(conversation);
                const unreadCount = getUnreadCount(conversation);
                const isSelected = selectedConversationId === conversation.id;
                
                return (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted ${
                      isSelected ? "bg-muted" : ""
                    }`}
                    onClick={() => onSelectConversation(
                      conversation, 
                      otherUserId, 
                      // In a real app, you would get the user's name from a users collection
                      `User ${otherUserId.substring(0, 6)}`
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src="" alt="" />
                          <AvatarFallback>{getUserInitials(otherUserId)}</AvatarFallback>
                        </Avatar>
                        {getOnlineStatus(otherUserId)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {/* In a real app, you would get the user's name from a users collection */}
                            User {otherUserId.substring(0, 6)}
                          </p>
                          {conversation.lastMessage?.timestamp && (
                            <p className="text-xs text-muted-foreground">
                              {formatLastMessageTime(conversation.lastMessage.timestamp)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage?.text || "No messages yet"}
                          </p>
                          {unreadCount > 0 && (
                            <Badge className="ml-2">{unreadCount}</Badge>
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
