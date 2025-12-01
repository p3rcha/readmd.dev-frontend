/* eslint-disable react-refresh/only-export-components */
import { useState, createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../../api/auth';
import { filesApi } from '../../../api/files';
import type { User } from '../../../types/user';
import type { LoginInput, RegisterInput } from '../../../types/auth';

const PENDING_FILE_KEY = 'pendingFileId';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children?: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: !!token,
    retry: false,
  });

  // Claim pending file after authentication
  const claimPendingFile = async () => {
    const pendingFileId = sessionStorage.getItem(PENDING_FILE_KEY);
    if (pendingFileId) {
      try {
        await filesApi.claimFile(pendingFileId);
        sessionStorage.removeItem(PENDING_FILE_KEY);
        queryClient.invalidateQueries({ queryKey: ['files'] });
      } catch (error) {
        console.error('Failed to claim file:', error);
        // Remove invalid file ID from storage
        sessionStorage.removeItem(PENDING_FILE_KEY);
      }
    }
  };

  // Cleanup stale pending file on mount if user is already authenticated
  useEffect(() => {
    if (token && user) {
      // If user is authenticated, check for stale pending file
      const pendingFileId = sessionStorage.getItem(PENDING_FILE_KEY);
      if (pendingFileId) {
        // Try to claim it, or remove if it fails
        claimPendingFile().catch(() => {
          // If claiming fails, remove stale entry
          sessionStorage.removeItem(PENDING_FILE_KEY);
        });
      }
    }
  }, [token, user]); // Run when token or user changes

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      queryClient.setQueryData(['currentUser'], data.user);
      // Claim pending file after login
      await claimPendingFile();
      navigate('/');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      queryClient.setQueryData(['currentUser'], data.user);
      // Claim pending file after register
      await claimPendingFile();
      navigate('/');
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    queryClient.clear();
    navigate('/login');
  };

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!token && !!user,
    login: async (input: LoginInput) => {
      await loginMutation.mutateAsync(input);
    },
    register: async (input: RegisterInput) => {
      await registerMutation.mutateAsync(input);
    },
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children || <Outlet />}
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

