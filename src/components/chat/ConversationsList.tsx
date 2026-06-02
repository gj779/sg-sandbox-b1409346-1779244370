import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus } from "lucide-react";
import { conversationsService } from "@/services/conversationsService";
import { Conversation } from "@/types";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
  onCreateConversation?: () => void;
}

export default function ConversationsList({
  onSelectConversation,
  selectedConversationId,
  onCreateConversation
}: ConversationsListProps) {
  const { user } = useFirebaseAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = conversationsService.subscribeToConversations(
      user.uid,
      (fetchedConversations) => {
        setConversations(fetchedConversations);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4">
        {onCreateConversation && (
          <Button 
            onClick={onCreateConversation}
            className="w-full mb-4"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        )}
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedConversationId === conversation.id
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  {conversation.participantProfiles &&
                    Object.values(conversation.participantProfiles)
                      .filter((profile) => profile.id !== user?.uid)
                      .map((profile) => (
                        <div key={profile.id}>
                          <p className="font-medium">{profile.displayName}</p>
                          {conversation.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.content || "Sent an attachment"}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
