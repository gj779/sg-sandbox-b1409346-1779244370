import { firestoreService } from "./firebaseFirestore";
import { v4 as uuidv4 } from "uuid";
import { collection, query, where, orderBy, onSnapshot, serverTimestamp, WhereFilterOp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Message, Conversation } from "@/types";

export const firebaseMessagingService = {
  // Create a new conversation
  async createConversation(participantIds: string[]): Promise<Conversation> {
    const conversationId = uuidv4();
    
    const conversationData = {
      participants: participantIds,
      lastMessage: undefined,
      unreadCounts: {}
    };

    await firestoreService.createDocumentWithId("conversations", conversationId, conversationData);
    
    // Get the created document to return with server timestamps
    const createdConversation = await firestoreService.getDocument("conversations", conversationId) as Conversation;
    return createdConversation;
  },

  // Get a conversation by ID
  async getConversation(conversationId: string): Promise<Conversation | null> {
    return firestoreService.getDocument("conversations", conversationId) as Promise<Conversation | null>;
  },

  // Get conversations for a user
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      // This would require a complex query to get all conversations where the user is a participant
      // For now, we'll return a mock implementation
      return [];
    } catch (error) {
      console.error(`Error getting conversations for user ${userId}:`, error);
      return [];
    }
  },

  // Send a message
  async sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      const messageData = {
        ...message,
        read: false
      };
      
      const messageId = await firestoreService.createDocument('messages', messageData);
      
      // Update the conversation's lastMessage and lastMessageTimestamp
      await firestoreService.updateDocument("conversations", message.conversationId, {
        lastMessage: message.content,
        lastMessageTimestamp: serverTimestamp(),
        unreadCount: firestoreService.increment(1) // Increment unread count
      });
      
      return messageId;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get messages for a conversation
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const conditions = [{
      field: "conversationId",
      operator: "==" as const,
      value: conversationId
    }];
    
    return firestoreService.queryDocuments("messages", conditions, "createdAt", "asc") as Promise<Message[]>;
  },

  // Subscribe to messages for a conversation (real-time)
  subscribeToConversationMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("createdAt", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      callback(messages);
    });
    
    return unsubscribe;
  },

  // Mark message as read
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await firestoreService.updateDocument('messages', messageId, { read: true });
    } catch (error) {
      console.error(`Error marking message ${messageId} as read:`, error);
      throw error;
    }
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const conditions = [
      {
        field: "conversationId",
        operator: "==" as const,
        value: conversationId
      },
      {
        field: "receiverId",
        operator: "==" as const,
        value: userId
      },
      {
        field: "read",
        operator: "==" as const,
        value: false
      }
    ];
    
    const unreadMessages = await firestoreService.queryDocuments("messages", conditions) as Message[];
    
    // Update each message to mark as read
    const updatePromises = unreadMessages.map(message => 
      firestoreService.updateDocument("messages", message.id, { read: true })
    );
    
    await Promise.all(updatePromises);
  },

  // Get unread message count for a user
  async getUnreadMessageCount(userId: string): Promise<number> {
    try {
      const conditions = [
        {
          field: 'receiverId',
          operator: '==' as WhereFilterOp,
          value: userId
        },
        {
          field: 'read',
          operator: '==' as WhereFilterOp,
          value: false
        }
      ];
      
      const messages = await firestoreService.queryDocuments('messages', conditions);
      return messages.length;
    } catch (error) {
      console.error(`Error getting unread message count for user ${userId}:`, error);
      // Return 0 instead of throwing to prevent cascading failures
      return 0;
    }
  },

  // Get messages between two users
  async getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
    try {
      // We need to query for messages where:
      // (senderId = userId1 AND receiverId = userId2) OR (senderId = userId2 AND receiverId = userId1)
      // This is a complex query that would require multiple queries and merging results
      
      // For now, we'll return a mock implementation
      return [];
    } catch (error) {
      console.error(`Error getting messages between users ${userId1} and ${userId2}:`, error);
      return [];
    }
  }
};