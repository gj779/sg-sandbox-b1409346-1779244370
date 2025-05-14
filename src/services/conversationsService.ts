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
import { 
  Message, 
  Conversation, 
  UserProfile, 
  MessageStatus 
} from "@/types"; 
import { firebaseStorageService } from "./firebaseStorage"; // For file uploads
import { profilesService } from "./profilesService"; // To get user profiles for conversations

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
  updatedAt: z.date().optional(),
  typingUserIds: z.array(z.string()).optional() // Add typingUserIds
});

// Define the Message schema for validation
export const messageSchema = z.object({
  id: z.string().optional(), // Add optional id
  conversationId: z.string().min(1, "Conversation ID is required"),
  senderId: z.string().min(1, "Sender ID is required"),
  receiverId: z.string().min(1, "Receiver ID is required"),
  text: z.string().min(1, "Message text is required"),
  isRead: z.boolean().default(false),
  createdAt: z.date().optional(),
  contentType: z.enum(["text", "image", "file", "emoji"]).default("text"), // Add contentType
  fileURL: z.string().optional(), // Add fileURL
  fileName: z.string().optional(), // Add fileName
  fileSize: z.number().optional(), // Add fileSize
  fileType: z.string().optional(), // Add fileType
  status: z.enum(["sent", "delivered", "read"]).default("sent"), // Add status
  reactions: z.record(z.array(z.string())).optional() // Add reactions
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
   * @param participantIds - Array of participant IDs
   * @returns Promise with the created conversation
   */
  async createConversation(participantIds: string[]): Promise<Conversation> {
    // Check if a conversation already exists with these participants
    // For private chats (2 participants), order matters for consistent ID generation
    const sortedParticipantIds = [...participantIds].sort();
    const existingConversationQuery = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "==", sortedParticipantIds) // Use sorted for private chats
    );

    const querySnapshot = await getDocs(existingConversationQuery);
    if (!querySnapshot.empty) {
      // Conversation already exists
      const doc = querySnapshot.docs[0];
      const conversationData = doc.data() as Omit<Conversation, "id">;
      // Fetch participant profiles
      const participantProfiles = await Promise.all(
        conversationData.participants.map(id => profilesService.getUserProfile(id))
      );
      return { 
        id: doc.id, 
        ...conversationData,
        participantProfiles: participantProfiles.filter(p => p !== null) as UserProfile[]
      };
    }

    // Create new conversation
    const newConversationRef = doc(collection(db, CONVERSATIONS_COLLECTION));
    const unreadCounts: { [userId: string]: number } = {};
    participantIds.forEach(id => unreadCounts[id] = 0);

    const newConversationData: Omit<Conversation, "id" | "participantProfiles"> = {
      participants: sortedParticipantIds, // Store sorted for private chats
      lastMessage: null,
      unreadCounts,
      createdAt: new Date(),
      updatedAt: new Date(),
      typingUserIds: [],
    };

    await setDoc(newConversationRef, newConversationData);
    // Fetch participant profiles for the new conversation
    const participantProfiles = await Promise.all(
      newConversationData.participants.map(id => profilesService.getUserProfile(id))
    );
    return { 
      id: newConversationRef.id, 
      ...newConversationData,
      participantProfiles: participantProfiles.filter(p => p !== null) as UserProfile[]
    };
  },

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    contentType: "text" | "image" | "file" | "emoji" = "text",
    file?: File
  ): Promise<Message> {
    const newMessageRef = doc(collection(db, MESSAGES_COLLECTION));
    let fileURL: string | undefined = undefined;
    let fileName: string | undefined = undefined;
    let fileSize: number | undefined = undefined;
    let fileType: string | undefined = undefined;

    if (file && (contentType === "image" || contentType === "file")) {
      const filePath = `chat_attachments/${conversationId}/${newMessageRef.id}/${file.name}`;
      fileURL = await firebaseStorageService.uploadFile(filePath, file);
      fileName = file.name;
      fileSize = file.size;
      fileType = file.type;
    }
    
    // Fetch sender profile for denormalization
    const senderProfile = await profilesService.getUserProfile(senderId);

    const newMessageData: Omit<Message, "id"> = {
      conversationId,
      senderId,
      senderName: senderProfile?.firstName ? `${senderProfile.firstName} ${senderProfile.lastName || ''}`.trim() : senderProfile?.email,
      senderPhotoURL: senderProfile?.photoURL || "",
      content,
      contentType,
      fileURL,
      fileName,
      fileSize,
      fileType,
      timestamp: new Date(),
      status: "sent", // Initial status
      reactions: {},
    };

    await setDoc(newMessageRef, newMessageData);

    // Update conversation's lastMessage and unread counts
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationSnap = await getDoc(conversationRef);
    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data() as Conversation;
      const updatedUnreadCounts = { ...conversationData.unreadCounts };
      conversationData.participants.forEach(participantId => {
        if (participantId !== senderId) {
          updatedUnreadCounts[participantId] = (updatedUnreadCounts[participantId] || 0) + 1;
        }
      });

      await updateDoc(conversationRef, {
        lastMessage: { ...newMessageData, id: newMessageRef.id }, // Store the full message object
        updatedAt: new Date(),
        unreadCounts: updatedUnreadCounts,
      });
    }

    return { id: newMessageRef.id, ...newMessageData };
  },

  async getMessages(conversationId: string, messageLimit: number = 50): Promise<Message[]> {
    const messagesQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "desc"),
      limit(messageLimit)
    );
    const snapshot = await getDocs(messagesQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)).reverse(); // Reverse to show oldest first
  },

  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    const messagesQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc") // Keep ascending for real-time updates
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      callback(messages);
    });
  },

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const conversationsQuery = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );
    const snapshot = await getDocs(conversationsQuery);
    
    const conversations = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
      const conversationData = docSnapshot.data() as Omit<Conversation, "id" | "participantProfiles">;
      const participantProfiles = await Promise.all(
        conversationData.participants.map(id => profilesService.getUserProfile(id))
      );
      return { 
        id: docSnapshot.id, 
        ...conversationData,
        participantProfiles: participantProfiles.filter(p => p !== null) as UserProfile[]
      };
    }));
    return conversations;
  },

  subscribeToUserConversations(userId: string, callback: (conversations: Conversation[]) => void): () => void {
    const conversationsQuery = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(conversationsQuery, async (snapshot) => {
      const conversations = await Promise.all(snapshot.docs.map(async (docSnapshot) => {
        const conversationData = docSnapshot.data() as Omit<Conversation, "id" | "participantProfiles">;
        const participantProfiles = await Promise.all(
          conversationData.participants.map(id => profilesService.getUserProfile(id))
        );
        return { 
          id: docSnapshot.id, 
          ...conversationData,
          participantProfiles: participantProfiles.filter(p => p !== null) as UserProfile[]
        };
      }));
      callback(conversations);
    });
  },

  async updateMessageStatus(messageId: string, status: MessageStatus): Promise<void> {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, { status, updatedAt: new Date() });
  },

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationSnap = await getDoc(conversationRef);
    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data() as Conversation;
      const updatedUnreadCounts = { ...conversationData.unreadCounts, [userId]: 0 };
      await updateDoc(conversationRef, { 
        unreadCounts: updatedUnreadCounts,
        updatedAt: new Date() 
      });

      // Optionally, mark all messages in this conversation as read for this user
      // This can be more complex and might involve a batch write or a Cloud Function
      // For now, we'll just update the conversation's unread count.
      // A more robust solution would be to update message statuses individually if needed.
      const messagesQuery = query(
        collection(db, MESSAGES_COLLECTION),
        where("conversationId", "==", conversationId),
        where("senderId", "!=", userId), // Only messages not sent by the current user
        where("status", "!=", "read")    // Only messages not already read
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      const batch = writeBatch(db);
      messagesSnapshot.docs.forEach(messageDoc => {
        // Check if current user is a recipient and status is not 'read'
        // This logic is simplified; a real app might have a 'readBy' array in messages
        batch.update(messageDoc.ref, { status: "read" });
      });
      await batch.commit();
    }
  },

  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data() as Conversation;
      let typingUserIds = conversationData.typingUserIds || [];

      if (isTyping) {
        if (!typingUserIds.includes(userId)) {
          typingUserIds.push(userId);
        }
      } else {
        typingUserIds = typingUserIds.filter(id => id !== userId);
      }
      await updateDoc(conversationRef, { typingUserIds, updatedAt: new Date() });
    }
  },

  subscribeToConversationTypingStatus(conversationId: string, callback: (typingUserIds: string[]) => void): () => void {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    return onSnapshot(conversationRef, (docSnap) => {
      if (docSnap.exists()) {
        const conversationData = docSnap.data() as Conversation;
        callback(conversationData.typingUserIds || []);
      }
    });
  },

  async addReactionToMessage(messageId: string, userId: string, emoji: string): Promise<void> {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    const messageSnap = await getDoc(messageRef);

    if (messageSnap.exists()) {
      const messageData = messageSnap.data() as Message;
      const reactions = messageData.reactions || {};
      
      // If emoji exists, add user or remove if already reacted
      if (reactions[emoji]) {
        if (reactions[emoji].includes(userId)) {
          reactions[emoji] = reactions[emoji].filter(id => id !== userId);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji]; // Remove emoji if no users reacted with it
          }
        } else {
          reactions[emoji].push(userId);
        }
      } else {
        // New emoji reaction
        reactions[emoji] = [userId];
      }
      await updateDoc(messageRef, { reactions, updatedAt: new Date() });
    }
  },
  
  // Get a single conversation by ID, including participant profiles
  async getConversationById(conversationId: string): Promise<Conversation | null> {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const docSnap = await getDoc(conversationRef);

    if (docSnap.exists()) {
      const conversationData = docSnap.data() as Omit<Conversation, "id" | "participantProfiles">;
      const participantProfiles = await Promise.all(
        conversationData.participants.map(id => profilesService.getUserProfile(id))
      );
      return {
        id: docSnap.id,
        ...conversationData,
        participantProfiles: participantProfiles.filter(p => p !== null) as UserProfile[]
      };
    }
    return null;
  },

  // Subscribe to a single conversation by ID
  subscribeToConversationById(conversationId: string, callback: (conversation: Conversation | null) => void): () => void {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    return onSnapshot(conversationRef, async (docSnap) => {
      if (docSnap.exists()) {
        const conversationData = docSnap.data() as Omit<Conversation, "id" | "participantProfiles">;
        const participantProfiles = await Promise.all(
          conversationData.participants.map(id => profilesService.getUserProfile(id))
        );
        callback({
          id: docSnap.id,
          ...conversationData,
          participantProfiles: participantProfiles.filter(p => p !== null) as UserProfile[]
        });
      } else {
        callback(null);
      }
    });
  }
};