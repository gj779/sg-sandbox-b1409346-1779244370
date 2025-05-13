import { 
  where, 
  orderBy, 
  limit, 
  QueryConstraint,
  arrayUnion,
  arrayRemove,
  DocumentData,
  FieldValue // Import FieldValue
} from 'firebase/firestore';
import { firebaseDatabaseService } from './firebaseDatabase';
import { z } from 'zod';

// Define the Conversation schema for validation
export const conversationSchema = z.object({
  id: z.string().optional(), // Add optional id
  participants: z.array(z.string()).min(2, "At least 2 participants required"),
  lastMessage: z.object({
    text: z.string(),
    senderId: z.string(),
    timestamp: z.date().optional()
  }).optional(),
  unreadCount: z.record(z.string(), z.number()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Define the Message schema for validation
export const messageSchema = z.object({
  id: z.string().optional(), // Add optional id
  conversationId: z.string().min(1, "Conversation ID is required"),
  senderId: z.string().min(1, "Sender ID is required"),
  receiverId: z.string().min(1, "Receiver ID is required"),
  text: z.string().min(1, "Message text is required"),
  isRead: z.boolean().default(false),
  createdAt: z.date().optional()
});

// Define the types
export type Conversation = z.infer<typeof conversationSchema>;
export type Message = z.infer<typeof messageSchema>;

// Collection paths
const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

export const conversationsService = {
  /**
   * Create a new conversation
   * @param conversationData - Conversation data
   * @returns Promise with the created conversation
   */
  async createConversation(conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id: string; data: Conversation }> {
    try {
      // Validate conversation data
      const validatedData = conversationSchema.parse(conversationData);
      
      // Initialize unreadCount for each participant
      const unreadCount: Record<string, number> = {};
      validatedData.participants.forEach(participantId => {
        unreadCount[participantId] = 0;
      });
      
      validatedData.unreadCount = unreadCount;
      
      // Create the conversation
      return await firebaseDatabaseService.create<Conversation>(CONVERSATIONS_COLLECTION, validatedData);
    } catch (error) {
      console.error('Error creating conversation:', error);
      if (error instanceof z.ZodError) {
        // Format validation errors
        const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation error: ${formattedErrors}`);
      }
      throw new Error(`Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get a conversation by ID
   * @param conversationId - Conversation ID
   * @returns Promise with the conversation data
   */
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    return await firebaseDatabaseService.getById<Conversation>(CONVERSATIONS_COLLECTION, conversationId);
  },

  /**
   * Get conversations for a user
   * @param userId - User ID
   * @returns Promise with an array of conversations
   */
  async getConversationsForUser(userId: string): Promise<Conversation[]> {
    const constraints: QueryConstraint[] = [
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    ];
    
    return await firebaseDatabaseService.query<Conversation>(CONVERSATIONS_COLLECTION, constraints);
  },

  /**
   * Find or create a conversation between users
   * @param userIds - Array of user IDs
   * @returns Promise with the conversation
   */
  async findOrCreateConversation(userIds: string[]): Promise<{ id: string; data: Conversation; isNew: boolean }> {
    try {
      // Sort user IDs to ensure consistent queries
      const sortedUserIds = [...userIds].sort();
      
      // Check if a conversation already exists with these participants
      const constraints: QueryConstraint[] = [
        where('participants', '==', sortedUserIds)
      ];
      
      const existingConversations = await firebaseDatabaseService.query<Conversation>(CONVERSATIONS_COLLECTION, constraints);
      
      if (existingConversations.length > 0 && existingConversations[0].id) {
        return {
          id: existingConversations[0].id, // Now this is safe
          data: existingConversations[0],
          isNew: false
        };
      }
      
      // Create a new conversation
      const newConversation = await this.createConversation({
        participants: sortedUserIds
      });
      
      return {
        ...newConversation,
        isNew: true
      };
    } catch (error) {
      console.error('Error finding or creating conversation:', error);
      throw new Error(`Failed to find or create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Add a participant to a conversation
   * @param conversationId - Conversation ID
   * @param userId - User ID to add
   * @returns Promise<void>
   */
  async addParticipant(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.getConversationById(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    if (conversation.participants.includes(userId)) {
      return; // User is already a participant
    }
    
    // Add user to participants array
    await firebaseDatabaseService.update<Conversation>(CONVERSATIONS_COLLECTION, conversationId, {
      participants: arrayUnion(userId) as any, // Cast to any for FieldValue
      [`unreadCount.${userId}`]: 0
    } as Partial<Conversation>);
  },

  /**
   * Remove a participant from a conversation
   * @param conversationId - Conversation ID
   * @param userId - User ID to remove
   * @returns Promise<void>
   */
  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.getConversationById(conversationId);
    
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }
    
    if (!conversation.participants.includes(userId)) {
      return; // User is not a participant
    }
    
    // Remove user from participants array
    await firebaseDatabaseService.update<Conversation>(CONVERSATIONS_COLLECTION, conversationId, {
      participants: arrayRemove(userId) as any // Cast to any for FieldValue
    } as Partial<Conversation>);
    
    // Remove user's unread count
    const unreadCount = { ...conversation.unreadCount };
    if (unreadCount && userId in unreadCount) {
      delete unreadCount[userId];
      await firebaseDatabaseService.update<Conversation>(CONVERSATIONS_COLLECTION, conversationId, {
        unreadCount
      });
    }
  },

  /**
   * Send a message in a conversation
   * @param messageData - Message data
   * @returns Promise with the created message
   */
  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<{ id: string; data: Message }> {
    try {
      // Validate message data
      const validatedData = messageSchema.parse(messageData);
      
      // Create the message
      const message = await firebaseDatabaseService.create<Message>(MESSAGES_COLLECTION, validatedData);
      
      // Update conversation with last message and increment unread count
      const conversation = await this.getConversationById(messageData.conversationId);
      
      if (conversation) {
        const unreadCount = { ...conversation.unreadCount };
        
        // Increment unread count for all participants except the sender
        conversation.participants.forEach(participantId => {
          if (participantId !== messageData.senderId) {
            unreadCount[participantId] = (unreadCount[participantId] || 0) + 1;
          }
        });
        
        // Update the conversation
        await firebaseDatabaseService.update<Conversation>(CONVERSATIONS_COLLECTION, messageData.conversationId, {
          lastMessage: {
            text: messageData.text,
            senderId: messageData.senderId,
            timestamp: new Date()
          },
          unreadCount
        });
      }
      
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      if (error instanceof z.ZodError) {
        // Format validation errors
        const formattedErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation error: ${formattedErrors}`);
      }
      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get messages for a conversation
   * @param conversationId - Conversation ID
   * @returns Promise with an array of messages
   */
  async getMessagesForConversation(conversationId: string): Promise<Message[]> {
    const constraints: QueryConstraint[] = [
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    ];
    
    return await firebaseDatabaseService.query<Message>(MESSAGES_COLLECTION, constraints);
  },

  /**
   * Mark messages as read
   * @param conversationId - Conversation ID
   * @param userId - User ID
   * @returns Promise<void>
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // Get all unread messages for this user in the conversation
      const constraints: QueryConstraint[] = [
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId),
        where('isRead', '==', false)
      ];
      
      const unreadMessages = await firebaseDatabaseService.query<Message>(MESSAGES_COLLECTION, constraints);
      
      // Mark each message as read
      const updateOperations = unreadMessages.map(message => ({
        type: 'update' as const,
        collectionPath: MESSAGES_COLLECTION,
        id: message.id!, // Add non-null assertion if id is guaranteed by query
        data: { isRead: true }
      }));
      
      if (updateOperations.length > 0) {
        await firebaseDatabaseService.batchOperation(updateOperations);
      }
      
      // Reset unread count for this user in the conversation
      const conversation = await this.getConversationById(conversationId);
      
      if (conversation && conversation.unreadCount) {
        const unreadCount = { ...conversation.unreadCount };
        unreadCount[userId] = 0;
        
        await firebaseDatabaseService.update<Conversation>(CONVERSATIONS_COLLECTION, conversationId, {
          unreadCount
        });
      }
    } catch (error) {
      console.error(`Error marking messages as read in conversation ${conversationId} for user ${userId}:`, error);
      throw new Error(`Failed to mark messages as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Subscribe to real-time updates for a conversation
   * @param conversationId - Conversation ID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToConversation(conversationId: string, callback: (conversation: Conversation | null) => void): () => void {
    return firebaseDatabaseService.subscribeToDocument<Conversation>(CONVERSATIONS_COLLECTION, conversationId, callback);
  },

  /**
   * Subscribe to real-time updates for a user's conversations
   * @param userId - User ID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToUserConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
    const constraints: QueryConstraint[] = [
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    ];
    
    return firebaseDatabaseService.subscribeToQuery<Conversation>(CONVERSATIONS_COLLECTION, constraints, callback);
  },

  /**
   * Subscribe to real-time updates for messages in a conversation
   * @param conversationId - Conversation ID
   * @param callback - Callback function to handle updates
   * @returns Unsubscribe function
   */
  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    const constraints: QueryConstraint[] = [
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    ];
    
    return firebaseDatabaseService.subscribeToQuery<Message>(MESSAGES_COLLECTION, constraints, callback);
  }
};