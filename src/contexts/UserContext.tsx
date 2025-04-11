
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";

// Define user types
export type UserRole = "applicant" | "restaurant" | "admin" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileComplete: boolean;
  firstName?: string;
  lastName?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ userProfile: any, dashboardPath: string }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    try {
      // In a real app, this would check localStorage or a token cookie
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('staffspace_user') : null;
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Validate the user object has required fields
          if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
            setUser(parsedUser);
          } else {
            console.error('Invalid user data in localStorage');
            if (typeof window !== 'undefined') {
              localStorage.removeItem('staffspace_user');
            }
          }
        } catch (error) {
          console.error('Failed to parse stored user', error);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('staffspace_user');
          }
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<{ userProfile: any, dashboardPath: string }> => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Determine user role based on email (for demo purposes)
      let role: UserRole = 'applicant';
      
      // Check if it's the admin email - ensure lowercase comparison
      if (email.toLowerCase() === 'staffspace@gmail.com') {
        role = 'admin';
        console.log('Admin login detected');
      } else if (email.includes('restaurant')) {
        role = 'restaurant';
      }
      
      // Get first part of email as name
      const name = email.split('@')[0];
      const firstName = name;
      const lastName = '';
      
      // Create mock user
      const mockUser: User = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        name,
        firstName,
        lastName,
        email,
        role,
        profileComplete: false
      };
      
      // Save to state and localStorage
      setUser(mockUser);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('staffspace_user', JSON.stringify(mockUser));
        } catch (storageError) {
          console.error('Error saving user to localStorage:', storageError);
          // Continue even if localStorage fails
        }
      }
      
      // Determine dashboard path based on role
      let dashboardPath = '/';
      if (role === 'admin') {
        dashboardPath = '/admin/dashboard';
      } else if (role === 'restaurant') {
        dashboardPath = '/restaurant/dashboard';
      } else if (role === 'applicant') {
        dashboardPath = '/applicant/dashboard';
      }
      
      // Create a userProfile object that matches what the login page expects
      const userProfile = {
        id: mockUser.id,
        email: mockUser.email,
        userType: mockUser.role,
        firstName: mockUser.firstName || mockUser.name,
        lastName: mockUser.lastName || '',
        isActive: true,
      };
      
      return { userProfile, dashboardPath };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to sign in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    if (!name || !email || !password || !role) {
      throw new Error('All fields are required for registration');
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Split name into first and last name
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      // Create mock user
      const mockUser: User = {
        id: `user_${Math.random().toString(36).substring(2, 9)}`,
        name,
        firstName,
        lastName,
        email,
        role,
        profileComplete: false
      };
      
      // Save to state and localStorage
      setUser(mockUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('staffspace_user', JSON.stringify(mockUser));
      }
      
      // Redirect based on role
      if (role === 'applicant') {
        router.push('/applicant/create-resume');
      } else if (role === 'restaurant') {
        router.push('/restaurant/setup-profile');
      } else if (role === 'admin') {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('staffspace_user');
      }
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, still try to clear the user state
      setUser(null);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
