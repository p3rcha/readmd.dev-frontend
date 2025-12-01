import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { filesApi } from '../../../api/files';
import { FileList } from '../components/FileList';
import { FileUpload } from '../components/FileUpload';
import { useAuth } from '../../auth/hooks/useAuth';
import { GlassCard, Button } from '../../../components/ui';
import type { FileMetadata, FileVisibility } from '../../../types/file';

export function DashboardPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  
  // Filter and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<FileVisibility | 'all'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'filename' | 'sizeBytes'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build query parameters
  const queryParams = useMemo(() => ({
    visibility: visibilityFilter !== 'all' ? visibilityFilter : undefined,
    sort: sortBy,
    order: sortOrder,
    search: debouncedSearch || undefined,
    page: 1,
    limit: 50,
  }), [visibilityFilter, sortBy, sortOrder, debouncedSearch]);

  // Fetch files
  const { data, isLoading, error } = useQuery({
    queryKey: ['files', queryParams],
    queryFn: async () => {
      return await filesApi.fetchFiles(queryParams);
    },
    enabled: isAuthenticated,
  });

  const files = data?.files || [];
  const pagination = data?.pagination;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: filesApi.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleUpload = async (file: File, visibility: FileVisibility): Promise<FileMetadata> => {
    const result = await filesApi.uploadFile(file, visibility);
    queryClient.invalidateQueries({ queryKey: ['files'] });
    setShowUpload(false);
    return result;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <GlassCard padding="xl" className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Dashboard Access Required
          </h1>
          <p className="text-[var(--text-tertiary)] mb-8">
            Please log in to access your dashboard and manage your files.
        </p>
          <Link to="/login">
            <Button variant="primary" size="lg" className="w-full">
              Sign In
            </Button>
        </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
              My <span className="gradient-text">Files</span>
            </h1>
            <p className="text-[var(--text-tertiary)]">
          Manage and organize your markdown files
        </p>
      </div>
          <Button
            variant="primary"
            onClick={() => setShowUpload(!showUpload)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Upload File
          </Button>
        </div>
      </motion.div>

      {/* Upload Section - Collapsible */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-10"
        >
          <FileUpload onUpload={handleUpload} />
        </motion.div>
      )}

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard padding="lg" className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Search Files
            </label>
              <div className="relative">
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            <input
              type="text"
              placeholder="Search by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-glass pl-10"
            />
              </div>
          </div>

          {/* Visibility Filter */}
          <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Visibility
            </label>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as FileVisibility | 'all')}
                className="input-glass"
            >
              <option value="all">All Files</option>
                <option value="private">🔒 Private</option>
                <option value="unlisted">🔗 Unlisted</option>
                <option value="public">🌐 Public</option>
            </select>
          </div>

          {/* Sort */}
          <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="input-glass flex-1"
              >
                <option value="createdAt">Date Created</option>
                <option value="filename">Name</option>
                <option value="sizeBytes">Size</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="input-glass px-3 hover:border-violet-500 transition-colors"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                  <motion.span
                    animate={{ rotate: sortOrder === 'asc' ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </motion.span>
              </button>
            </div>
          </div>
        </div>
        </GlassCard>
      </motion.div>

      {/* Files List */}
      <div>
        {isLoading && (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full"
            />
            <p className="mt-4 text-[var(--text-tertiary)]">Loading files...</p>
          </div>
        )}

        {error && (
          <GlassCard className="border-l-4 border-l-red-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-[var(--text-primary)]">Failed to load files</p>
                <p className="text-sm text-[var(--text-tertiary)]">Please try again later.</p>
              </div>
          </div>
          </GlassCard>
        )}

        {!isLoading && !error && (
          <>
            {files.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <GlassCard padding="xl" className="text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  No files yet
                </h3>
                  <p className="text-[var(--text-tertiary)] mb-8 max-w-sm mx-auto">
                  Upload your first markdown file to get started!
                </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowUpload(true)}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  >
                    Upload Your First File
                  </Button>
                </GlassCard>
              </motion.div>
            ) : (
              <>
                {pagination && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-4 text-sm text-[var(--text-tertiary)]"
                  >
                    Showing {files.length} of {pagination.total} file{pagination.total !== 1 ? 's' : ''}
                  </motion.div>
                )}
                <FileList files={files} onDelete={handleDelete} />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
