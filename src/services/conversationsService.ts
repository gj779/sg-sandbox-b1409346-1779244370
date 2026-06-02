import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, addDoc, serverTimestamp, onSnapshot, DocumentData } from "firebase/firestore";
import { Conversation, Message, UserProfile, MessageStatus } from "@/types";

class ConversationsService {
  private async fetchParticipantProfiles(participantIds: string[]): Promise<Record<string, UserProfile>> {
    const profiles: Record<string, UserProfile> = {};
    
    // Batch fetch all user profiles in a single query instead of N+1 queries
    if (participantIds.length === 0) {
      return profiles;
    }
    
    try {
      // Firestore has a limit of 10 items for 'in' queries, so batch them if needed
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < participantIds.length; i += batchSize) {
        const batchIds = participantIds.slice(i, i + batchSize);
        const q = query(
          collection(db, "users"),
          where("__name__", "in", batchIds)
        );
        batches.push(getDocs(q));
      }
      
      // Execute all batches in parallel
      const batchResults = await Promise.all(batches);
      
      // Process results from all batches
      for (const querySnapshot of batchResults) {
        querySnapshot.docs.forEach(doc => {
          if (doc.exists()) {
            profiles[doc.id] = doc.data() as UserProfile;
          }
        });
      }
    } catch (error) {
      console.error("Error fetching participant profiles:", error);
      // Fallback to individual queries if batch query fails
      for (const userId of participantIds) {
        try {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            profiles[userId] = userDoc.data() as UserProfile;
          }
        } catch (individualError) {
          console.error(`Error fetching profile for user ${userId}:`, individualError);
        }
      }
    }
    
    return profiles;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const docSnap = await getDoc(doc(db, "conversations", conversationId));
      
      if (!docSnap.exists()) {
        return null;
      }

      const conversationData = docSnap.data();
      const participantProfiles = await this.fetchParticipantProfiles(conversationData.participants);

      return {
        id: docSnap.id,
        ...conversationData,
        participantProfiles,
        createdAt: conversationData.createdAt.toDate(),
        updatedAt: conversationData.updatedAt.toDate(),
      } as Conversation;
    } catch (error) {
      console.error("Error fetching conversation:", error);
      return null;
    }
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, "conversations"),
        where("participants", "array-contains", userId),
        orderBy("updatedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const conversations: Conversation[] = [];

      for (const doc of querySnapshot.docs) {
        const conversationData = doc.data();
        const participantProfiles = await this.fetchParticipantProfiles(conversationData.participants);

        conversations.push({
          id: doc.id,
          ...conversationData,
          participantProfiles,
          createdAt: conversationData.createdAt.toDate(),
          updatedAt: conversationData.updatedAt.toDate(),
        } as Conversation);
      }

      return conversations;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      return [];
    }
  }

  async createConversation(participants: string[]): Promise<string | null> {
    try {
      const conversationRef = await addDoc(collection(db, "conversations"), {
        participants,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null,
        unreadCounts: participants.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
        typingUserIds: [],
      });

      return conversationRef.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  }

  async sendMessage(
    conversationId: string, 
    senderId: string, 
    content: string,
    contentType: "text" | "image" | "file" | "video" = "text",
    file?: File
  ): Promise<boolean> {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      const messageData: any = {
        conversationId,
        senderId,
        content,
        contentType,
        timestamp: serverTimestamp(),
        status: MessageStatus.SENT,
      };

      if (file) {
        messageData.fileName = file.name;
        messageData.fileSize = file.size;
        // Handle file upload if needed
      }

      const messageRef = await addDoc(collection(db, "messages"), messageData);

      await updateDoc(conversationRef, {
        lastMessage: {
          id: messageRef.id,
          content,
          senderId,
          contentType,
          timestamp: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  async updateMessageStatus(messageId: string, status: MessageStatus): Promise<boolean> {
    try {
      const messageRef = doc(db, "messages", messageId);
      await updateDoc(messageRef, {
        status,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error updating message status:", error);
      return false;
    }
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      const messagesQuery = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
        where("senderId", "!=", userId),
        where("status", "!=", MessageStatus.READ)
      );

      const unreadMessages = await getDocs(messagesQuery);
      const updatePromises = unreadMessages.docs.map(doc => 
        updateDoc(doc.ref, {
          status: MessageStatus.READ,
          updatedAt: serverTimestamp()
        })
      );

      await Promise.all(updatePromises);

      // Reset unread count for the user
      const conversation = await getDoc(conversationRef);
      if (conversation.exists()) {
        const unreadCounts = conversation.data().unreadCounts || {};
        await updateDoc(conversationRef, {
          [`unreadCounts.${userId}`]: 0,
          updatedAt: serverTimestamp()
        });
      }

      return true;
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      return false;
    }
  }

  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean): Promise<boolean> {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      const conversation = await getDoc(conversationRef);
      
      if (!conversation.exists()) return false;
      
      const currentTypingUsers = conversation.data().typingUserIds || [];
      let updatedTypingUsers = isTyping 
        ? [...new Set([...currentTypingUsers, userId])]
        : currentTypingUsers.filter((id: string) => id !== userId);

      await updateDoc(conversationRef, {
        typingUserIds: updatedTypingUsers,
      });

      return true;
    } catch (error) {
      console.error("Error updating typing status:", error);
      return false;
    }
  }

  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as Message[];
      
      callback(messages);
    });
  }

  subscribeToConversationTypingStatus(
    conversationId: string, 
    callback: (typingUserIds: string[]) => void
  ): () => void {
    const conversationRef = doc(db, "conversations", conversationId);
    
    return onSnapshot(conversationRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.typingUserIds || []);
      } else {
        callback([]);
      }
    });
  }

  subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(q, async (snapshot) => {
      // Use Promise.all to fetch all participant profiles in parallel instead of sequential loop
      const conversationsPromises = snapshot.docs.map(async (doc) => {
        const conversationData = doc.data();
        const participantProfiles = await this.fetchParticipantProfiles(conversationData.participants);
        
        return {
          id: doc.id,
          ...conversationData,
          participantProfiles,
          createdAt: conversationData.createdAt.toDate(),
          updatedAt: conversationData.updatedAt.toDate(),
        };
      });
      
      const conversations = await Promise.all(conversationsPromises);
      callback(conversations as Conversation[]);
    });
  }
}

export const conversationsService = new ConversationsService();