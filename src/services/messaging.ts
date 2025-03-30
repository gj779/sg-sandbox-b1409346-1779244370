
import { dynamoDBService } from "@/lib/aws/dynamodb";
import { dynamoDBConfig } from "@/lib/aws/config";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessageAt: string;
  createdAt: string;
}

export const messagingService = {
  // Create a new conversation
  async createConversation(participantIds: string[]): Promise<Conversation> {
    const now = new Date().toISOString();
    
    const conversation: Conversation = {
      id: uuidv4(),
      participants: participantIds,
      lastMessageAt: now,
      createdAt: now,
    };

    await dynamoDBService.putItem(dynamoDBConfig.messagesTable, conversation);
    return conversation;
  },

  // Get a conversation by ID
  async getConversation(conversationId: string): Promise<Conversation | null> {
    return dynamoDBService.getItem(dynamoDBConfig.messagesTable, { id: conversationId }) as Promise<Conversation | null>;
  },

  // Get conversations for a user
  async getUserConversations(userId: string): Promise<Conversation[]> {
    const filterExpression = "contains(#participants, :userId)";
    const expressionAttributeValues = { ":userId": userId };
    const expressionAttributeNames = { "#participants": "participants" };
    
    return dynamoDBService.scan(
      dynamoDBConfig.messagesTable,
      filterExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Promise<Conversation[]>;
  },

  // Send a message
  async sendMessage(conversationId: string, senderId: string, receiverId: string, content: string): Promise<Message> {
    const now = new Date().toISOString();
    
    const message: Message = {
      id: uuidv4(),
      conversationId,
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: now,
    };

    // Update the conversation's lastMessageAt
    await dynamoDBService.updateItem(
      dynamoDBConfig.messagesTable,
      { id: conversationId },
      "SET #lastMessageAt = :lastMessageAt",
      { ":lastMessageAt": now },
      { "#lastMessageAt": "lastMessageAt" }
    );

    // Store the message
    await dynamoDBService.putItem(`${dynamoDBConfig.messagesTable}-messages`, message);
    
    return message;
  },

  // Get messages for a conversation
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const filterExpression = "#conversationId = :conversationId";
    const expressionAttributeValues = { ":conversationId": conversationId };
    const expressionAttributeNames = { "#conversationId": "conversationId" };
    
    const messages = await dynamoDBService.scan(
      `${dynamoDBConfig.messagesTable}-messages`,
      filterExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Message[];
    
    // Sort messages by createdAt
    return messages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    // Get unread messages for this user in this conversation
    const filterExpression = "#conversationId = :conversationId AND #receiverId = :userId AND #read = :unread";
    const expressionAttributeValues = { 
      ":conversationId": conversationId,
      ":userId": userId,
      ":unread": false
    };
    const expressionAttributeNames = { 
      "#conversationId": "conversationId",
      "#receiverId": "receiverId",
      "#read": "read"
    };
    
    const unreadMessages = await dynamoDBService.scan(
      `${dynamoDBConfig.messagesTable}-messages`,
      filterExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Message[];
    
    // Update each message to mark as read
    const updatePromises = unreadMessages.map(message => 
      dynamoDBService.updateItem(
        `${dynamoDBConfig.messagesTable}-messages`,
        { id: message.id },
        "SET #read = :read",
        { ":read": true },
        { "#read": "read" }
      )
    );
    
    await Promise.all(updatePromises);
  },

  // Get unread message count for a user
  async getUnreadMessageCount(userId: string): Promise<number> {
    const filterExpression = "#receiverId = :userId AND #read = :unread";
    const expressionAttributeValues = { 
      ":userId": userId,
      ":unread": false
    };
    const expressionAttributeNames = { 
      "#receiverId": "receiverId",
      "#read": "read"
    };
    
    const unreadMessages = await dynamoDBService.scan(
      `${dynamoDBConfig.messagesTable}-messages`,
      filterExpression,
      expressionAttributeValues,
      expressionAttributeNames
    ) as Message[];
    
    return unreadMessages.length;
  }
};
