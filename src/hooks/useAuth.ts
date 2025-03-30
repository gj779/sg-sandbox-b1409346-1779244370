
import { useState, useEffect, useCallback } from "react";
import { authService } from "@/services/auth";
import { useRouter } from "next/router";

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null,
  });
  
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, you would check for a valid token in localStorage/cookies
        // and validate it with Cognito
        const token = localStorage.getItem("accessToken");
        
        if (token) {
          // Get user profile
          const userId = localStorage.getItem("userId");
          
          if (userId) {
            const userProfile = await authService.getUserProfile(userId);
            
            if (userProfile) {
              setAuthState({
                isAuthenticated: true,
                user: userProfile,
                isLoading: false,
                error: null,
              });
              return;
            }
          }
        }
        
        // No valid auth found
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: "Failed to authenticate",
        });
      }
    };

    checkAuth();
  }, []);

  // Sign in function
  const signIn = useCallback(async (username: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { authResponse, userProfile } = await authService.signIn({ username, password });
      
      if (authResponse.AuthenticationResult?.AccessToken) {
        // Store tokens
        localStorage.setItem("accessToken", authResponse.AuthenticationResult.AccessToken);
        localStorage.setItem("refreshToken", authResponse.AuthenticationResult.RefreshToken || "");
        
        if (userProfile) {
          localStorage.setItem("userId", userProfile.id);
          
          setAuthState({
            isAuthenticated: true,
            user: userProfile,
            isLoading: false,
            error: null,
          });
          
          return userProfile;
        }
      }
      
      throw new Error("Authentication failed");
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to sign in",
      }));
      throw error;
    }
  }, []);

  // Sign up function
  const signUp = useCallback(async (userData: {
    username: string;
    password: string;
    email: string;
    userType: "applicant" | "restaurant";
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await authService.registerUser(userData);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      return result;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to sign up",
      }));
      throw error;
    }
  }, []);

  // Confirm sign up
  const confirmSignUp = useCallback(async (username: string, code: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.confirmSignUp(username, code);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to confirm sign up",
      }));
      throw error;
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const accessToken = localStorage.getItem("accessToken") || "";
      
      if (accessToken) {
        await authService.signOut(accessToken);
      }
      
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
      });
      
      router.push("/");
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to sign out",
      }));
    }
  }, [router]);

  // Forgot password
  const forgotPassword = useCallback(async (username: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.forgotPassword(username);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to initiate password reset",
      }));
      throw error;
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (username: string, code: string, newPassword: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await authService.resetPassword(username, code, newPassword);
      
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      return true;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to reset password",
      }));
      throw error;
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (updates: Record<string, any>) => {
    if (!authState.user?.id) {
      throw new Error("User not authenticated");
    }
    
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const updatedProfile = await authService.updateUserProfile(authState.user.id, updates);
      
      if (updatedProfile) {
        setAuthState(prev => ({
          ...prev,
          user: updatedProfile,
          isLoading: false,
          error: null,
        }));
      }
      
      return updatedProfile;
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to update profile",
      }));
      throw error;
    }
  }, [authState.user]);

  return {
    ...authState,
    signIn,
    signUp,
    confirmSignUp,
    signOut,
    forgotPassword,
    resetPassword,
    updateUserProfile,
  };
}
