// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  avatar: any;
  id: number;
  username: string;
  email: string;
  sex?: string;
  confirmed?: boolean;
  role?: { name: string };
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  setAuth: (jwt: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khôi phục từ localStorage khi app load
    const jwt = localStorage.getItem('jwt');
    const userStr = localStorage.getItem('user');
    const roleStr = localStorage.getItem('role');
    
    if (jwt && userStr) {
      try {
        // Verify JWT token bằng cách gọi API /api/users/me
        const verifyToken = async () => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me`, {
              headers: { Authorization: `Bearer ${jwt}` },
            });
            
            if (res.ok) {
              // JWT hợp lệ -> khôi phục user
              const userData = JSON.parse(userStr);
              setUser(userData);
              setRole(roleStr || userData?.role?.name || 'employee');
            } else {
              // JWT không hợp lệ -> clear localStorage
              logout();
            }
          } catch (error) {
            console.error('Token verification error:', error);
            logout();
          } finally {
            setLoading(false);
          }
        };
        
        verifyToken();
      } catch (e) {
        console.error('Parse user error', e);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const setAuth = (jwt: string, userData: User) => {
    const userRole = userData.role?.name || 'employee';
    setUser(userData);
    setRole(userRole);
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('role', userRole);
    document.cookie = `jwt=${jwt}; path=/; max-age=604800`;
    document.cookie = `role=${userRole}; path=/; max-age=604800`;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, setAuth, logout }}>
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