
import { 
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  GlobalSignOutCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoConfig } from "./config";

const client = new CognitoIdentityProviderClient({ region: cognitoConfig.region });

export interface SignUpParams {
  username: string;
  password: string;
  email: string;
  userType: "applicant" | "restaurant";
}

export interface SignInParams {
  username: string;
  password: string;
}

export const cognitoService = {
  // Sign up a new user
  async signUp({ username, password, email, userType }: SignUpParams) {
    const command = new SignUpCommand({
      ClientId: cognitoConfig.userPoolWebClientId,
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "custom:userType", Value: userType }
      ],
    });

    return client.send(command);
  },

  // Confirm sign up with verification code
  async confirmSignUp(username: string, confirmationCode: string) {
    const command = new ConfirmSignUpCommand({
      ClientId: cognitoConfig.userPoolWebClientId,
      Username: username,
      ConfirmationCode: confirmationCode,
    });

    return client.send(command);
  },

  // Sign in user
  async signIn({ username, password }: SignInParams) {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: cognitoConfig.userPoolWebClientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    return client.send(command);
  },

  // Sign out user
  async signOut(accessToken: string) {
    const command = new GlobalSignOutCommand({
      AccessToken: accessToken,
    });

    return client.send(command);
  },

  // Forgot password
  async forgotPassword(username: string) {
    const command = new ForgotPasswordCommand({
      ClientId: cognitoConfig.userPoolWebClientId,
      Username: username,
    });

    return client.send(command);
  },

  // Confirm forgot password
  async confirmForgotPassword(username: string, confirmationCode: string, newPassword: string) {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: cognitoConfig.userPoolWebClientId,
      Username: username,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    });

    return client.send(command);
  },

  // Resend confirmation code
  async resendConfirmationCode(username: string) {
    const command = new ResendConfirmationCodeCommand({
      ClientId: cognitoConfig.userPoolWebClientId,
      Username: username,
    });

    return client.send(command);
  }
};
