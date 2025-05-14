import { 
  db 
} from "@/lib/firebase"; // Import db from firebase setup
import { 
  collection,
  query,
  where, 
  orderBy, 
  limit, 
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp, // For server-side timestamps if needed
  FieldValue,
  arrayUnion, // Added import
  arrayRemove  // Added import
} from 'firebase/firestore';

import { 
  Message, 
  Conversation, 
  UserProfile, 
  MessageStatus 
} from "@/types"; 
import { firebaseStorageService } from "./firebaseStorage";
import { profilesService } from "./profilesService";

const CONVERSATIONS_COLLECTION = "conversations";
const MESSAGES_COLLECTION = "messages";

export const conversationsService = {
  async createConversation(participantIds: string[]): Promise<Conversation> {
    const sortedParticipantIds = [...participantIds].sort();
    
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "==", sortedParticipantIds)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
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

    const newConversationRef = doc(collection(db, CONVERSATIONS_COLLECTION));
    const unreadCounts: { [userId: string]: number } = {};
    participantIds.forEach(id => unreadCounts[id] = 0);

    const newConversationData: Omit<Conversation, "id" | "participantProfiles"> = {
      participants: sortedParticipantIds,
      lastMessage: null,
      unreadCounts,
      createdAt: new Date(), // Consider serverTimestamp() for consistency
      updatedAt: new Date(), // Consider serverTimestamp()
      typingUserIds: [],
    };

    await setDoc(newConversationRef, newConversationData);
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
    contentType: Message["contentType"] = "text",
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
      timestamp: new Date(), // Consider serverTimestamp()
      status: "sent",
      reactions: {},
    };

    await setDoc(newMessageRef, newMessageData);

    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationSnap = await getDoc(conversationRef);
    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data() as Conversation;
      const updatedUnreadCounts = { ...(conversationData.unreadCounts || {}) };
      conversationData.participants.forEach(participantId => {
        if (participantId !== senderId) {
          updatedUnreadCounts[participantId] = (updatedUnreadCounts[participantId] || 0) + 1;
        }
      });

      await updateDoc(conversationRef, {
        lastMessage: { ...newMessageData, id: newMessageRef.id },
        updatedAt: new Date(), // Consider serverTimestamp()
        unreadCounts: updatedUnreadCounts,
      });
    }

    return { id: newMessageRef.id, ...newMessageData };
  },

  async getMessages(conversationId: string, messageLimit: number = 50): Promise<Message[]> {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "desc"),
      limit(messageLimit)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Message)).reverse();
  },

  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Message));
      callback(messages);
    });
  },

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );
    const snapshot = await getDocs(q);
    
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

  subscribeToUserConversations(
    userId: string, 
    callback: (conversations: Conversation[]) => void,
    onError?: (error: Error) => void // Optional error callback
  ): () => void {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participants", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(q, async (snapshot) => {
      try {
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
      } catch (error) {
        console.error("Error processing conversation snapshot:", error);
        if (onError) onError(error as Error);
      }
    }, (error) => { // Firebase onSnapshot error callback
      console.error("Error subscribing to user conversations:", error);
      if (onError) onError(error);
    });
  },

  async updateMessageStatus(messageId: string, status: MessageStatus): Promise<void> {
    const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(messageRef, { status, updatedAt: new Date() }); // Consider serverTimestamp()
  },

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const conversationSnap = await getDoc(conversationRef);
    if (conversationSnap.exists()) {
      const conversationData = conversationSnap.data() as Conversation;
      const updatedUnreadCounts = { ...(conversationData.unreadCounts || {}), [userId]: 0 };
      await updateDoc(conversationRef, { 
        unreadCounts: updatedUnreadCounts,
        updatedAt: new Date() // Consider serverTimestamp()
      });

      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where("conversationId", "==", conversationId),
        where("senderId", "!=", userId),
        where("status", "!=", "read")
      );
      const messagesSnapshot = await getDocs(q);
      if (!messagesSnapshot.empty) {
        const batch = writeBatch(db);
        messagesSnapshot.docs.forEach(messageDoc => {
          batch.update(messageDoc.ref, { status: "read" });
        });
        await batch.commit();
      }
    }
  },

  async setTypingStatus(conversationId: string, userId: string, isTyping: boolean): Promise<void> {
    const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    
    // Firestore's arrayUnion and arrayRemove are good for this
    if (isTyping) {
      await updateDoc(conversationRef, { 
        typingUserIds: arrayUnion(userId),
        updatedAt: new Date() // Consider serverTimestamp()
      });
    } else {
      await updateDoc(conversationRef, { 
        typingUserIds: arrayRemove(userId),
        updatedAt: new Date() // Consider serverTimestamp()
      });
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
      const reactions = { ...(messageData.reactions || {}) };
      
      if (reactions[emoji]) {
        if (reactions[emoji].includes(userId)) {
          reactions[emoji] = reactions[emoji].filter(id => id !== userId);
          if (reactions[emoji].length === 0) {
            delete reactions[emoji];
          }
        } else {
          reactions[emoji].push(userId);
        }
      } else {
        reactions[emoji] = [userId];
      }
      await updateDoc(messageRef, { reactions, updatedAt: new Date() }); // Consider serverTimestamp()
    }
  },
  
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