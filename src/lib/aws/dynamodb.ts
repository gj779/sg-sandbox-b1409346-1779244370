import { 
  DynamoDBClient, 
  GetItemCommand, 
  PutItemCommand, 
  UpdateItemCommand, 
  DeleteItemCommand,
  QueryCommand,
  ScanCommand,
  ReturnValue
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamoDBClient, dynamoDBConfig } from './config';

// Generic DynamoDB service
export const dynamoDBService = {
  // Get an item by its primary key
  async getItem(tableName: string, key: Record<string, any>) {
    const params = {
      TableName: tableName,
      Key: marshall(key),
    };

    const command = new GetItemCommand(params);
    const response = await dynamoDBClient.send(command);
    
    return response.Item ? unmarshall(response.Item) : null;
  },

  // Put a new item
  async putItem(tableName: string, item: Record<string, any>) {
    const params = {
      TableName: tableName,
      Item: marshall(item),
    };

    const command = new PutItemCommand(params);
    return dynamoDBClient.send(command);
  },

  // Update an existing item
  async updateItem(
    tableName: string, 
    key: Record<string, any>, 
    updateExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>
  ) {
    const params = {
      TableName: tableName,
      Key: marshall(key),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW' as ReturnValue,
    };

    const command = new UpdateItemCommand(params);
    const response = await dynamoDBClient.send(command);
    
    return response.Attributes ? unmarshall(response.Attributes) : null;
  },

  // Delete an item
  async deleteItem(tableName: string, key: Record<string, any>) {
    const params = {
      TableName: tableName,
      Key: marshall(key),
    };

    const command = new DeleteItemCommand(params);
    return dynamoDBClient.send(command);
  },

  // Query items
  async query(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>
  ) {
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ExpressionAttributeNames: expressionAttributeNames,
    };

    const command = new QueryCommand(params);
    const response = await dynamoDBClient.send(command);
    
    return response.Items ? response.Items.map(item => unmarshall(item)) : [];
  },

  // Scan items
  async scan(
    tableName: string,
    filterExpression?: string,
    expressionAttributeValues?: Record<string, any>,
    expressionAttributeNames?: Record<string, string>
  ) {
    const params: any = {
      TableName: tableName,
    };

    if (filterExpression) {
      params.FilterExpression = filterExpression;
    }

    if (expressionAttributeValues) {
      params.ExpressionAttributeValues = marshall(expressionAttributeValues);
    }

    if (expressionAttributeNames) {
      params.ExpressionAttributeNames = expressionAttributeNames;
    }

    const command = new ScanCommand(params);
    const response = await dynamoDBClient.send(command);
    
    return response.Items ? response.Items.map(item => unmarshall(item)) : [];
  }
};