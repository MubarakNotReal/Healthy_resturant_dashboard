import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  role: 'admin' | 'staff';
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredUser extends User {
  timestamp: number;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('nourish_user');
    console.log('AuthContext: Checking stored user:', storedUser);
    if (storedUser) {
      try {
        const parsed: StoredUser = JSON.parse(storedUser);
        console.log('AuthContext: Parsed user:', parsed);
        // Check if session is still valid (24 hours)
        const now = Date.now();
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

        if (now - parsed.timestamp < sessionDuration) {
          console.log('AuthContext: Session valid, setting user');
          setUser(parsed);
        } else {
          // Session expired, remove it
          console.log('AuthContext: Session expired, removing');
          localStorage.removeItem('nourish_user');
        }
      } catch (error) {
        console.log('AuthContext: Error parsing stored user:', error);
        localStorage.removeItem('nourish_user');
      }
    } else {
      console.log('AuthContext: No stored user found');
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    const userWithTimestamp: StoredUser = {
      ...userData,
      timestamp: Date.now(),
    };
    console.log('AuthContext: Logging in user:', userWithTimestamp);
    setUser(userData);
    localStorage.setItem('nourish_user', JSON.stringify(userWithTimestamp));
    console.log('AuthContext: Stored in localStorage');
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    setUser(null);
    localStorage.removeItem('nourish_user');
    console.log('AuthContext: User logged out and localStorage cleared');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}