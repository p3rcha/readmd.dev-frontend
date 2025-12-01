export type FileVisibility = 'private' | 'unlisted' | 'public';

export interface FileMetadata {
  id: string;
  ownerId: string | null;
  filename: string;
  sizeBytes: number;
  visibility: FileVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface FileWithContent extends FileMetadata {
  content: string;
}

export interface FileListParams {
  visibility?: FileVisibility;
  sort?: 'createdAt' | 'filename' | 'sizeBytes';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FileListResponse {
  files: FileMetadata[];
  pagination: PaginationMeta;
}

