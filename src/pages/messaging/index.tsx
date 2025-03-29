
import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { Send, Search, Clock, ChevronLeft, MoreHorizontal, Phone, Video } from "lucide-react";

// Mock conversation data
const mockConversations = [
  {
    id: "conv1",
    participantId: "rest1",
    participantName: "La Bistro Restaurant",
    participantAvatar: null,
    lastMessage: "Thanks for your application! Are you available for an interview next week?",
    timestamp: new Date("2025-03-28T14:30:00"),
    unread: true,
    messages: [
      {
        id: "msg1",
        senderId: "rest1",
        text: "Hello! Thank you for applying to our Head Chef position.",
        timestamp: new Date("2025-03-27T10:15:00"),
      },
      {
        id: "msg2",
        senderId: "user",
        text: "Thank you for considering my application. I'm very interested in the position.",
        timestamp: new Date("2025-03-27T10:30:00"),
      },
      {
        id: "msg3",
        senderId: "rest1",
        text: "Your experience looks great. We'd like to schedule an interview.",
        timestamp: new Date("2025-03-28T09:45:00"),
      },
      {
        id: "msg4",
        senderId: "rest1",
        text: "Thanks for your application! Are you available for an interview next week?",
        timestamp: new Date("2025-03-28T14:30:00"),
      },
    ]
  },
  {
    id: "conv2",
    participantId: "rest2",
    participantName: "Coastal Kitchen",
    participantAvatar: null,
    lastMessage: "We've reviewed your application and would like to invite you for a trial shift.",
    timestamp: new Date("2025-03-26T16:45:00"),
    unread: false,
    messages: [
      {
        id: "msg5",
        senderId: "rest2",
        text: "Hi there! We received your application for the Server position.",
        timestamp: new Date("2025-03-25T11:20:00"),
      },
      {
        id: "msg6",
        senderId: "user",
        text: "Hello! Yes, I'm very interested in joining your team.",
        timestamp: new Date("2025-03-25T13:10:00"),
      },
      {
        id: "msg7",
        senderId: "rest2",
        text: "Great! We've reviewed your application and would like to invite you for a trial shift.",
        timestamp: new Date("2025-03-26T16:45:00"),
      },
    ]
  },
  {
    id: "conv3",
    participantId: "rest3",
    participantName: "The Speakeasy",
    participantAvatar: null,
    lastMessage: "Your bartending skills look impressive. When can you come in for a demonstration?",
    timestamp: new Date("2025-03-24T18:20:00"),
    unread: false,
    messages: [
      {
        id: "msg8",
        senderId: "rest3",
        text: "Hello! We're interested in your application for the Bartender position.",
        timestamp: new Date("2025-03-24T15:30:00"),
      },
      {
        id: "msg9",
        senderId: "user",
        text: "Hi! I'm excited about the opportunity to work at The Speakeasy.",
        timestamp: new Date("2025-03-24T16:45:00"),
      },
      {
        id: "msg10",
        senderId: "rest3",
        text: "Your bartending skills look impressive. When can you come in for a demonstration?",
        timestamp: new Date("2025-03-24T18:20:00"),
      },
    ]
  }
];

export default function MessagingPage() {
  const { user, isAuthenticated } = useUser();
  const router = useRouter();
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/messaging");
    }
  }, [isAuthenticated, router]);

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format timestamp for display
  const formatMessageTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date for conversation list
  const formatConversationDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // If today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return formatMessageTime(date);
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;
    
    const newMessage = {
      id: `msg${Date.now()}`,
      senderId: "user",
      text: messageText,
      timestamp: new Date()
    };
    
    // Update the active conversation with the new message
    const updatedConversation = {
      ...activeConversation,
      lastMessage: messageText,
      timestamp: new Date(),
      messages: [...activeConversation.messages, newMessage]
    };
    
    // Update the conversations list
    const updatedConversations = conversations.map(conv => 
      conv.id === activeConversation.id ? updatedConversation : conv
    );
    
    setActiveConversation(updatedConversation);
    setConversations(updatedConversations);
    setMessageText("");
  };

  // Handle selecting a conversation
  const handleSelectConversation = (conversation: any) => {
    // Mark as read
    const updatedConversation = { ...conversation, unread: false };
    const updatedConversations = conversations.map(conv => 
      conv.id === conversation.id ? updatedConversation : conv
    );
    
    setActiveConversation(updatedConversation);
    setConversations(updatedConversations);
    
    // On mobile, hide the conversation list
    if (isMobileView) {
      setShowConversationList(false);
    }
  };

  // Handle back button on mobile
  const handleBackToList = () => {
    setShowConversationList(true);
    setActiveConversation(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-12 text-center">
        <p>Please log in to access your messages.</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Messages | StaffSpace</title>
        <meta name="description" content="Communicate with restaurants and job applicants on StaffSpace." />
      </Head>

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <Card className="h-[calc(100vh-220px)] min-h-[500px]">
          <div className="grid h-full" style={{ gridTemplateColumns: isMobileView ? "1fr" : "350px 1fr" }}>
            {/* Conversation List - hide on mobile when viewing a conversation */}
            {(!isMobileView || showConversationList) && (
              <div className="border-r">
                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations"
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <Tabs defaultValue="all">
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                      <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="mt-0">
                      <div className="space-y-1 max-h-[calc(100vh-340px)] overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No conversations found
                          </div>
                        ) : (
                          filteredConversations.map((conversation) => (
                            <div
                              key={conversation.id}
                              className={`p-3 flex items-start gap-3 cursor-pointer hover:bg-muted rounded-md transition-colors ${
                                activeConversation?.id === conversation.id ? "bg-muted" : ""
                              }`}
                              onClick={() => handleSelectConversation(conversation)}
                            >
                              <Avatar>
                                <AvatarFallback>
                                  {conversation.participantName.charAt(0)}
                                </AvatarFallback>
                                {conversation.participantAvatar && (
                                  <AvatarImage src={conversation.participantAvatar} />
                                )}
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                  <h3 className="font-medium truncate">{conversation.participantName}</h3>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                    {formatConversationDate(conversation.timestamp)}
                                  </span>
                                </div>
                                <p className={`text-sm truncate ${conversation.unread ? "font-medium" : "text-muted-foreground"}`}>
                                  {conversation.lastMessage}
                                </p>
                              </div>
                              {conversation.unread && (
                                <Badge className="ml-2 h-2 w-2 rounded-full p-0" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="unread" className="mt-0">
                      <div className="space-y-1 max-h-[calc(100vh-340px)] overflow-y-auto">
                        {filteredConversations.filter(c => c.unread).length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No unread messages
                          </div>
                        ) : (
                          filteredConversations
                            .filter(c => c.unread)
                            .map((conversation) => (
                              <div
                                key={conversation.id}
                                className={`p-3 flex items-start gap-3 cursor-pointer hover:bg-muted rounded-md transition-colors ${
                                  activeConversation?.id === conversation.id ? "bg-muted" : ""
                                }`}
                                onClick={() => handleSelectConversation(conversation)}
                              >
                                <Avatar>
                                  <AvatarFallback>
                                    {conversation.participantName.charAt(0)}
                                  </AvatarFallback>
                                  {conversation.participantAvatar && (
                                    <AvatarImage src={conversation.participantAvatar} />
                                  )}
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline">
                                    <h3 className="font-medium truncate">{conversation.participantName}</h3>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                      {formatConversationDate(conversation.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-sm font-medium truncate">
                                    {conversation.lastMessage}
                                  </p>
                                </div>
                                <Badge className="ml-2 h-2 w-2 rounded-full p-0" />
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
            
            {/* Conversation View */}
            {(!isMobileView || !showConversationList) && (
              <div className="flex flex-col h-full">
                {activeConversation ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isMobileView && (
                          <Button variant="ghost" size="icon" onClick={handleBackToList}>
                            <ChevronLeft className="h-5 w-5" />
                          </Button>
                        )}
                        <Avatar>
                          <AvatarFallback>
                            {activeConversation.participantName.charAt(0)}
                          </AvatarFallback>
                          {activeConversation.participantAvatar && (
                            <AvatarImage src={activeConversation.participantAvatar} />
                          )}
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{activeConversation.participantName}</h3>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse">
                      <div className="space-y-4">
                        {[...activeConversation.messages].reverse().map((message: any) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                message.senderId === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p>{message.text}</p>
                              <div
                                className={`text-xs mt-1 ${
                                  message.senderId === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}
                              >
                                {formatMessageTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Message Input */}
                    <div className="p-4 border-t">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <div className="mb-4 p-4 rounded-full bg-muted">
                      <Send className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                    <p className="text-muted-foreground max-w-md">
                      Select a conversation to view messages or start a new conversation with a restaurant or applicant.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
