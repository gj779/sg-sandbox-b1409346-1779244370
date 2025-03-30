
import { cognitoService, SignUpParams, SignInParams } from "@/lib/aws/cognito";
import { dynamoDBService } from "@/lib/aws/dynamodb";
import { dynamoDBConfig } from "@/lib/aws/config";

// Extended user registration interface
export interface RegisterUserParams extends SignUpParams {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

// Auth service that combines Cognito authentication with DynamoDB user data
export const authService = {
  // Register a new user
  async registerUser({
    username,
    password,
    email,
    userType,
    firstName,
    lastName,
    phoneNumber,
  }: RegisterUserParams) {
    // Register user in Cognito
    const cognitoResponse = await cognitoService.signUp({
      username,
      password,
      email,
      userType,
    });

    // Create user profile in DynamoDB
    if (cognitoResponse.UserSub) {
      const userId = cognitoResponse.UserSub;
      
      const userProfile = {
        id: userId,
        username,
        email,
        userType,
        firstName,
        lastName,
        phoneNumber: phoneNumber || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      await dynamoDBService.putItem(dynamoDBConfig.usersTable, userProfile);
      
      return {
        cognitoResponse,
        userProfile,
      };
    }

    return { cognitoResponse };
  },

  // Sign in user
  async signIn(params: SignInParams) {
    const response = await cognitoService.signIn(params);
    
    // Get user profile from DynamoDB if authentication successful
    if (response.AuthenticationResult?.AccessToken) {
      // In a real app, you would decode the JWT token to get the user ID
      // For simplicity, we'll assume username is unique and use it to get the profile
      const userProfiles = await dynamoDBService.scan(
        dynamoDBConfig.usersTable,
        "username = :username",
        { ":username": params.username }
      );

      if (userProfiles.length > 0) {
        return {
          authResponse: response,
          userProfile: userProfiles[0],
        };
      }
      
      return { authResponse: response };
    }
    
    return { authResponse: response };
  },

  // Sign out user
  async signOut(accessToken: string) {
    return cognitoService.signOut(accessToken);
  },

  // Confirm user registration
  async confirmSignUp(username: string, confirmationCode: string) {
    return cognitoService.confirmSignUp(username, confirmationCode);
  },

  // Forgot password
  async forgotPassword(username: string) {
    return cognitoService.forgotPassword(username);
  },

  // Reset password
  async resetPassword(username: string, confirmationCode: string, newPassword: string) {
    return cognitoService.confirmForgotPassword(username, confirmationCode, newPassword);
  },

  // Get user profile
  async getUserProfile(userId: string) {
    return dynamoDBService.getItem(dynamoDBConfig.usersTable, { id: userId });
  },

  // Update user profile
  async updateUserProfile(userId: string, updates: Record<string, any>) {
    // Create update expression and attribute values
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id") { // Don't update primary key
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    // Add updatedAt timestamp
    updateExpressions.push("#updatedAt = :updatedAt");
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();
    expressionAttributeNames["#updatedAt"] = "updatedAt";

    const updateExpression = `SET ${updateExpressions.join(", ")}`;

    return dynamoDBService.updateItem(
      dynamoDBConfig.usersTable,
      { id: userId },
      updateExpression,
      expressionAttributeValues,
      expressionAttributeNames
    );
  }
};
