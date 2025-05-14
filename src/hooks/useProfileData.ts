
import { useState, useEffect, useCallback } from "react";
import { profilesService } from "@/services/profilesService";
import { useUser } from "@/contexts/UserContext";
import { UserProfile } from "@/hooks/useFirebaseAuth";

interface ProfileDataState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export function useProfileData(userId?: string) {
  const { user, userProfile: contextProfile } = useUser();
  const [state, setState] = useState<ProfileDataState>({
    profile: null,
    isLoading: true,
    error: null,
  });

  // If no userId is provided, use the current user's ID
  const targetUserId = userId || user?.uid;

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    if (!targetUserId) {
      setState({
        profile: null,
        isLoading: false,
        error: "No user ID provided",
      });
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // If we're looking at the current user's profile and we already have it in context,
      // use that instead of making another request
      if (!userId && contextProfile) {
        setState({
          profile: contextProfile,
          isLoading: false,
          error: null,
        });
        return;
      }

      const profile = await profilesService.getUserProfile(targetUserId);
      
      setState({
        profile,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Error fetching profile data:", error);
      setState({
        profile: null,
        isLoading: false,
        error: error.message || "Failed to load profile data",
      });
    }
  }, [targetUserId, userId, contextProfile]);

  // Update profile data
  const updateProfileData = useCallback(async (updates: Partial<UserProfile>) => {
    if (!targetUserId) {
      throw new Error("No user ID provided");
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await profilesService.updateUserProfile(targetUserId, updates);
      
      // Merge the updates with the existing profile
      const updatedProfile = {
        ...(state.profile || {}),
        ...updates,
        id: targetUserId,
      } as UserProfile;
      
      setState({
        profile: updatedProfile,
        isLoading: false,
        error: null,
      });
      
      return updatedProfile;
    } catch (error: any) {
      console.error("Error updating profile data:", error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to update profile data",
      }));
      throw error;
    }
  }, [targetUserId, state.profile]);

  // Set up real-time subscription to profile data
  useEffect(() => {
    if (!targetUserId) return;

    // Initial fetch
    fetchProfileData();

    // Set up real-time subscription
    const unsubscribe = profilesService.subscribeToUserProfile(targetUserId, (profile) => {
      if (profile) {
        setState({
          profile,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [targetUserId, fetchProfileData]);

  return {
    profile: state.profile,
    isLoading: state.isLoading,
    error: state.error,
    updateProfile: updateProfileData,
    refreshProfile: fetchProfileData,
  };
}
