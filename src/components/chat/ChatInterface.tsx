
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePresence } from "@/hooks/usePresence";
import { conversationsService } from "@/services/conversationsService";
import { 
  Message,
  Conversation,
  MessageStatus,
  UserProfile
} from "@/types"; 
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
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { Send, Phone, Video, MoreHorizontal, ArrowLeft, Smile, Paperclip, Check, CheckCheck, Download } from "lucide-react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import Image from "next/image";

interface ChatInterfaceProps {
  conversationId: string;
  otherParticipant: UserProfile | null;
  onBack?: () => void;
}

export default function ChatInterface({
  conversationId,
  otherParticipant,
  onBack
}: ChatInterfaceProps) {
  const { user } = useUser();
  const { useUserPresence } = usePresence();
  const { presence } = useUserPresence(otherParticipant?.id || null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const otherUserName = otherParticipant ? `${otherParticipant.firstName || ""} ${otherParticipant.lastName || ""}`.trim() || otherParticipant.email || "User" : "User";
  const otherUserPhotoURL = otherParticipant?.photoURL;

  useEffect(() => {
    if (!user || !conversationId) return;

    const unsubscribeMessages = conversationsService.subscribeToMessages(
      conversationId,
      (newMessages) => {
        setMessages(newMessages);
        // Mark messages as read
        newMessages.forEach(msg => {
          if (msg.senderId !== user.uid && msg.status !== MessageStatus.READ) {
            conversationsService.updateMessageStatus(msg.id, MessageStatus.READ);
          }
        });
      }
    );

    const unsubscribeTyping = conversationsService.subscribeToConversationTypingStatus(
      conversationId,
      (typingUserIds) => {
        setTypingUsers(typingUserIds.filter(id => id !== user.uid));
      }
    );
    
    conversationsService.markConversationAsRead(conversationId, user.uid)
      .catch(err => console.error("Error marking conversation as read:", err));

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (user?.uid) conversationsService.setTypingStatus(conversationId, user.uid, false);
    };
  }, [conversationId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!user || !conversationId) return;

    conversationsService.setTypingStatus(conversationId, user.uid, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (user?.uid) conversationsService.setTypingStatus(conversationId, user.uid, false);
    }, 3000);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prevMessage => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || (!newMessage.trim() && !selectedFile) || !conversationId || !otherParticipant) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const contentToSend = newMessage.trim();
      const fileToSend = selectedFile;
      
      let contentType: Message["contentType"] = "text";
      if (fileToSend) {
        contentType = fileToSend.type.startsWith("image/") ? "image" : "file";
      } else if (isEmojiOnly(contentToSend)) {
        contentType = "emoji";
      }

      await conversationsService.sendMessage(
        conversationId,
        user.uid,
        contentToSend,
        contentType,
        fileToSend || undefined
      );
      
      setNewMessage("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (user?.uid) conversationsService.setTypingStatus(conversationId, user.uid, false);

    } catch (error: any) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isEmojiOnly = (text: string) => {
    const emojiRegex = /^\p{Emoji_Presentation}+(\s+\p{Emoji_Presentation}+)*$/u;
    return emojiRegex.test(text);
  };

  const formatMessageTime = (timestamp: Date | undefined | string | null) => {
    if (!timestamp) return "";
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusBadge = () => {
    if (!presence) return <Badge variant="outline">Offline</Badge>;
    switch (presence.status) {
      case "online": return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>;
      case "away": return <Badge className="bg-yellow-500 hover:bg-yellow-600">Away</Badge>;
      default: return <Badge variant="outline">Offline</Badge>;
    }
  };

  const renderMessageStatus = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.READ:
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      case MessageStatus.DELIVERED:
        return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
      case MessageStatus.SENT:
        return <Check className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-200px)] lg:h-[700px] w-full">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <Avatar>
              <AvatarImage src={otherUserPhotoURL} alt={otherUserName} />
              <AvatarFallback>{getUserInitials(otherUserName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{otherUserName}</CardTitle>
              <div className="flex items-center gap-2 text-xs">
                {getStatusBadge()}
                {typingUsers.length > 0 && <span className="text-muted-foreground italic">typing...</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-5 w-5" /></Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          {messages.length === 0 && !isLoading ? (
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
                    className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-end gap-2 max-w-[75%]">
                      {!isOwnMessage && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={message.senderPhotoURL} />
                          <AvatarFallback>{getUserInitials(message.senderName || "U")}</AvatarFallback>
                        </Avatar>
                      )}
                       <div 
                        className={`rounded-lg p-3 ${
                          isOwnMessage 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        }`}
                      >
                        {message.contentType === "image" && message.fileURL && (
                          <div className="relative w-full max-w-xs max-h-64 my-1 rounded overflow-hidden">
                            <Image 
                              src={message.fileURL} 
                              alt={message.fileName || "Shared image"} 
                              width={300}
                              height={200}
                              className="object-contain"
                              unoptimized={message.fileURL.startsWith("")}
                            />
                          </div>
                        )}
                        {message.contentType === "file" && message.fileURL && (
                          <a 
                            href={message.fileURL} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 p-2 my-1 bg-background/10 rounded hover:bg-background/20"
                          >
                            <Paperclip className="h-4 w-4" />
                            <span>{message.fileName || "Shared file"}</span>
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                        {message.content && <p className={`text-sm ${message.contentType === "emoji" && "text-3xl"}`}>{message.content}</p>}
                      </div>
                    </div>
                    <p className={`text-xs mt-1 ${isOwnMessage ? "text-right" : "text-left ml-8"} text-muted-foreground flex items-center gap-1`}>
                      {formatMessageTime(message.timestamp)}
                      {isOwnMessage && renderMessageStatus(message.status)}
                    </p>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
          {isLoading && messages.length === 0 && (
             <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
             </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-2 md:p-4 border-t">
        {selectedFile && (
          <div className="mb-2 p-2 border rounded-md flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground truncate">
              <Paperclip className="h-4 w-4 inline mr-1" /> {selectedFile.name}
            </span>
            <Button variant="ghost" size="sm" onClick={() => {setSelectedFile(null); if(fileInputRef.current) fileInputRef.current.value = "";}}>
              Clear
            </Button>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" type="button">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto">
              <EmojiPicker onEmojiClick={handleEmojiClick} height={350} width={300} />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" size="icon" type="button" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-5 w-5" />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
            />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || (!newMessage.trim() && !selectedFile)}>
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
