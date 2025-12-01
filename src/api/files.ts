import axios from 'axios';
import { apiClient } from './client';
import type { FileMetadata, FileWithContent, FileListParams, FileListResponse } from '../types/file';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

// Anonymous API client (no auth token)
const anonymousClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const filesApi = {
  fetchFiles: async (params?: FileListParams): Promise<FileListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.visibility) queryParams.append('visibility', params.visibility);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/files?${queryString}` : '/files';
    
    const response = await apiClient.get<{ success: boolean; data: FileListResponse }>(url);
    return response.data.data;
  },

  fetchFile: async (id: string): Promise<FileWithContent> => {
    const response = await apiClient.get<{ success: boolean; data: FileWithContent }>(
      `/files/${id}`
    );
    return response.data.data;
  },

  uploadFile: async (file: File, visibility: 'private' | 'unlisted' | 'public' = 'private'): Promise<FileMetadata> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', visibility);

    const response = await apiClient.post<{ success: boolean; data: FileMetadata }>(
      '/files/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  uploadFileAnonymous: async (file: File, visibility: 'private' | 'unlisted' | 'public' = 'private'): Promise<FileMetadata> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', visibility);

    const response = await anonymousClient.post<{ success: boolean; data: FileMetadata }>(
      '/files/upload-anonymous',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  claimFile: async (id: string): Promise<FileMetadata> => {
    const response = await apiClient.post<{ success: boolean; data: FileMetadata }>(
      `/files/${id}/claim`
    );
    return response.data.data;
  },

  deleteFile: async (id: string): Promise<void> => {
    await apiClient.delete(`/files/${id}`);
  },
};

