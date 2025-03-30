import { firestoreService } from "./firebaseFirestore";
import { v4 as uuidv4 } from "uuid";
import { collection, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: any;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessageAt: any;
  createdAt: any;
}

export const firebaseMessagingService = {
  // Create a new conversation
  async createConversation(participantIds: string[]): Promise<Conversation> {
    const conversationId = uuidv4();
    
    const conversation: Conversation = {
      id: conversationId,
      participants: participantIds,
      lastMessageAt: null, // Will be set by Firestore
      createdAt: null, // Will be set by Firestore
    };

    await firestoreService.createDocumentWithId("conversations", conversationId, conversation);
    
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
    const conditions = [{
      field: "participants",
      operator: "array-contains" as const,
      value: userId
    }];
    
    return firestoreService.queryDocuments("conversations", conditions, "lastMessageAt", "desc") as Promise<Conversation[]>;
  },

  // Send a message
  async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string): Promise<Message> {
    // Create the message
    const messageData: Omit<Message, "id"> = {
      conversationId,
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: null, // Will be set by Firestore
    };
    
    // Add message to Firestore
    const messageId = await firestoreService.createDocument("messages", messageData);
    
    // Update the conversation's lastMessageAt
    await firestoreService.updateDocument("conversations", conversationId, {
      lastMessageAt: serverTimestamp()
    });
    
    // Get the created message
    const message = await firestoreService.getDocument("messages", messageId) as Message;
    return message;
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
    const conditions = [
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
    return unreadMessages.length;
  }
};