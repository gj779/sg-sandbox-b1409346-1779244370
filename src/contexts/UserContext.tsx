
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/router";

// Define user types
export type UserRole = "applicant" | "restaurant" | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileComplete: boolean;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
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
    // In a real app, this would check localStorage or a token cookie
    const storedUser = localStorage.getItem("staffspace_user");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("staffspace_user");
      }
    }
    
    setIsLoading(false);
  }, []);

  // Mock login function
  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create mock user
    const mockUser: User = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      name: email.split("@")[0],
      email,
      role,
      profileComplete: false
    };
    
    // Save to state and localStorage
    setUser(mockUser);
    localStorage.setItem("staffspace_user", JSON.stringify(mockUser));
    setIsLoading(false);
    
    // Redirect based on role
    if (role === "applicant") {
      router.push("/applicant/dashboard");
    } else if (role === "restaurant") {
      router.push("/restaurant/dashboard");
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create mock user
    const mockUser: User = {
      id: `user_${Math.random().toString(36).substring(2, 9)}`,
      name,
      email,
      role,
      profileComplete: false
    };
    
    // Save to state and localStorage
    setUser(mockUser);
    localStorage.setItem("staffspace_user", JSON.stringify(mockUser));
    setIsLoading(false);
    
    // Redirect based on role
    if (role === "applicant") {
      router.push("/applicant/create-resume");
    } else if (role === "restaurant") {
      router.push("/restaurant/setup-profile");
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("staffspace_user");
    router.push("/");
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
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
