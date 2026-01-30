import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      setUser(data.user);
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response = await fetch('/.netlify/functions/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Signup failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      setUser(data.user);
      console.log('Signup successful');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
