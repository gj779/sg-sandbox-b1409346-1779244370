
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, updateDoc, addDoc, serverTimestamp, onSnapshot, DocumentData } from "firebase/firestore";
import { Conversation, Message, UserProfile, MessageStatus } from "@/types";

class ConversationsService {
  private async fetchParticipantProfiles(participantIds: string[]): Promise<Record<string, UserProfile>> {
    const profiles: Record<string, UserProfile> = {};
    
    for (const userId of participantIds) {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        profiles[userId] = userDoc.data() as UserProfile;
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
      });

      return conversationRef.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<boolean> {
    try {
      const conversationRef = doc(db, "conversations", conversationId);
      const messageRef = await addDoc(collection(db, "messages"), {
        conversationId,
        senderId,
        content,
        timestamp: serverTimestamp(),
        status: MessageStatus.SENT,
      });

      await updateDoc(conversationRef, {
        lastMessage: {
          id: messageRef.id,
          content,
          senderId,
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

  subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(q, async (snapshot) => {
      const conversations: Conversation[] = [];
      
      for (const doc of snapshot.docs) {
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
      
      callback(conversations);
    });
  }
}

export const conversationsService = new ConversationsService();
