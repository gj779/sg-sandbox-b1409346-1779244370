import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
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
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Send, Phone, Video, MoreHorizontal, ArrowLeft } from "lucide-react";

interface ChatInterfaceProps {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhotoURL?: string;
  onBack?: () => void;
}

export default function ChatInterface({
  conversationId,
  otherUserId,
  otherUserName,
  otherUserPhotoURL,
  onBack
}: ChatInterfaceProps) {
  const { user, userProfile } = useUser();
  const router = useRouter();
  const { useUserPresence } = usePresence();
  const { presence } = useUserPresence(otherUserId);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to messages in the conversation
  useEffect(() => {
    if (!user || !conversationId) return;

    const unsubscribe = conversationsService.subscribeToMessages(
      conversationId,
      (messages) => {
        setMessages(messages);
      }
    );

    // Mark messages as read when the conversation is opened
    conversationsService.markMessagesAsRead(conversationId, user.uid)
      .catch(error => {
        console.error("Error marking messages as read:", error);
      });

    return () => {
      unsubscribe();
    };
  }, [conversationId, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newMessage.trim() || !conversationId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await conversationsService.sendMessage({
        conversationId,
        senderId: user.uid,
        receiverId: otherUserId,
        text: newMessage.trim(),
        isRead: false
      });
      
      setNewMessage("");
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Format message timestamp
  const formatMessageTime = (timestamp: Date | undefined | null) => {
    if (!timestamp) return "";
    return formatDistanceToNow(timestamp, { addSuffix: true });
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Get online status badge
  const getStatusBadge = () => {
    if (!presence) return null;
    
    switch (presence.status) {
      case "online":
        return <Badge className="bg-green-500">Online</Badge>;
      case "away":
        return <Badge className="bg-yellow-500">Away</Badge>;
      case "offline":
        return <Badge className="bg-gray-500">Offline</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Avatar>
              <AvatarImage src={otherUserPhotoURL} alt={otherUserName} />
              <AvatarFallback>{getUserInitials(otherUserName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUserName}</CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                {presence?.lastActive && (
                  <span className="text-xs text-muted-foreground">
                    {presence.status !== "online" && 
                      `Last seen ${formatDistanceToNow(presence.lastActive, { addSuffix: true })}`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === user?.uid;
                
                return (
                  <div 
                    key={message.id} 
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwnMessage 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage 
                          ? "text-primary-foreground/70" 
                          : "text-muted-foreground"
                      }`}>
                        {formatMessageTime(message.createdAt)}
                        {isOwnMessage && message.isRead && " • Read"}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
      
      {error && (
        <div className="p-2 bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}
    </Card>
  );
}
