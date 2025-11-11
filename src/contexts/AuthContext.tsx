import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  updateCredentials: (newUsername: string, newPassword: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Initialize credentials from localStorage or use defaults
  useEffect(() => {
    const storedUsername = localStorage.getItem('app_username') || 'Krista';
    const storedPassword = localStorage.getItem('app_password') || 'Inv2025';
    
    if (!localStorage.getItem('app_username')) {
      localStorage.setItem('app_username', storedUsername);
      localStorage.setItem('app_password', storedPassword);
    }

    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      setUsername(storedUsername);
    }
  }, []);

  const login = (inputUsername: string, inputPassword: string): boolean => {
    const storedUsername = localStorage.getItem('app_username') || 'Krista';
    const storedPassword = localStorage.getItem('app_password') || 'Inv2025';

    if (inputUsername === storedUsername && inputPassword === storedPassword) {
      setIsAuthenticated(true);
      setUsername(inputUsername);
      localStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('isAuthenticated');
  };

  const updateCredentials = (newUsername: string, newPassword: string) => {
    localStorage.setItem('app_username', newUsername);
    localStorage.setItem('app_password', newPassword);
    setUsername(newUsername);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout, updateCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
