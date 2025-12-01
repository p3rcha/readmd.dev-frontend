import { apiClient } from './client';
import type { LoginInput, RegisterInput, AuthResponse } from '../types/auth';
import type { User } from '../types/user';

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/login',
      input
    );
    return response.data.data;
  },

  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/auth/register',
      input
    );
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  },
};

