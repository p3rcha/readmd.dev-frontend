import { apiClient } from './client';
import type { User } from '../types/user';

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string | null;
  password?: string;
  isAdmin?: boolean;
}

export const usersApi = {
  // Admin-only: Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<{ success: boolean; data: User[] }>('/users');
    return response.data.data;
  },

  // Admin-only: Create a new user
  createUser: async (input: CreateUserInput): Promise<User> => {
    const response = await apiClient.post<{ success: boolean; data: { user: User } }>(
      '/auth/register',
      input
    );
    return response.data.data.user;
  },

  // Admin-only: Update a user
  updateUser: async (userId: string, input: UpdateUserInput): Promise<User> => {
    const response = await apiClient.patch<{ success: boolean; data: User }>(
      `/users/${userId}`,
      input
    );
    return response.data.data;
  },

  // Admin-only: Delete a user
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },

  // Admin-only: Toggle admin status
  toggleAdmin: async (userId: string, isAdmin: boolean): Promise<User> => {
    const response = await apiClient.patch<{ success: boolean; data: User }>(
      `/users/${userId}`,
      { isAdmin }
    );
    return response.data.data;
  },
};

