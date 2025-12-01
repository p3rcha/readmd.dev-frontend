import type { FileMetadata } from '../../../types/file';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatFileSize, formatRelativeTime } from '../../../utils/format';
import { VisibilityBadge, Button } from '../../../components/ui';

interface FileCardProps {
  file: FileMetadata;
  onDelete: (id: string) => void;
}

export function FileCard({ file, onDelete }: FileCardProps) {
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${file.filename.replace(/\.md$/i, '')}"?`)) {
      onDelete(file.id);
    }
  };

  const displayName = file.filename.replace(/\.md$/i, '');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="
        group relative
        glass-card p-5
        border-l-4 border-l-violet-500
        hover:border-l-fuchsia-500
        transition-all duration-300
      "
      >
        {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-4">
          <Link
            to={`/files/${file.id}`}
            className="flex-1 min-w-0"
          >
          <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate group-hover:text-violet-400 transition-colors">
              {displayName}
            </h3>
          </Link>

        {/* Actions - shown on hover */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Link to={`/files/${file.id}`}>
              <Button variant="ghost" size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
          </div>
        </div>

        {/* Metadata */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            {formatFileSize(file.sizeBytes)}
          </span>

        <VisibilityBadge visibility={file.visibility} />
        
        <span className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatRelativeTime(file.createdAt)}
          </span>

          {file.updatedAt !== file.createdAt && (
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Updated {formatRelativeTime(file.updatedAt)}
            </span>
          )}
        </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5" />
      </div>
    </motion.div>
  );
}
