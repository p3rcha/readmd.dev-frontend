import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import type { FileMetadata } from '../../../types/file';
import { useAuth } from '../../auth/hooks/useAuth';
import { MarkdownViewer } from './MarkdownViewer';
import { Button } from '../../../components/ui';

interface FilePreviewModalProps {
  file: File | null;
  content: string;
  fileName: string;
  visibility: 'private' | 'unlisted' | 'public';
  onVisibilityChange: (visibility: 'private' | 'unlisted' | 'public') => void;
  onUpload: (file: File, visibility: 'private' | 'unlisted' | 'public') => Promise<FileMetadata>;
  onClose: () => void;
  isUploading: boolean;
}

export function FilePreviewModal({
  file,
  content,
  fileName,
  visibility,
  onVisibilityChange,
  onUpload,
  onClose,
  isUploading,
}: FilePreviewModalProps) {
  const { isAuthenticated } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleUpload = async () => {
    if (!file) return;
    await onUpload(file, visibility);
  };

  const displayName = fileName.replace(/\.md$/i, '');

  useEffect(() => {
    return () => {
      setShowTooltip(false);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isUploading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, isUploading]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isUploading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="glass-card w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--border-primary)]">
          {/* Left: File name and visibility */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <h2 className="text-xl font-bold text-[var(--text-primary)] truncate">
                {displayName}
              </h2>
              <div className="flex items-center gap-2 relative flex-shrink-0">
              <select
                value={visibility}
                onChange={(e) => onVisibilityChange(e.target.value as typeof visibility)}
                  className="input-glass py-2 px-3 text-sm min-w-[130px]"
                disabled={isUploading}
              >
                  <option value="private">🔒 Private</option>
                  <option value="unlisted">🔗 Unlisted</option>
                  <option value="public">🌐 Public</option>
              </select>
              <div
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <button
                  type="button"
                    className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] hover:bg-violet-500/20 flex items-center justify-center text-[var(--text-muted)] hover:text-violet-400 text-xs font-bold cursor-help transition-colors"
                  aria-label="Visibility information"
                >
                  ?
                </button>
                  <AnimatePresence>
                {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute left-0 top-8 w-64 p-4 glass-card text-sm z-10"
                      >
                        <div className="mb-2 font-semibold text-[var(--text-primary)]">Visibility Options:</div>
                        <div className="space-y-2 text-[var(--text-secondary)]">
                          <div><span className="font-medium text-[var(--text-primary)]">Private:</span> Only you can view</div>
                          <div><span className="font-medium text-[var(--text-primary)]">Unlisted:</span> Anyone with link can view</div>
                          <div><span className="font-medium text-[var(--text-primary)]">Public:</span> Anyone can find and view</div>
                    </div>
                      </motion.div>
                )}
                  </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right: Action buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
                <Button
                  variant="primary"
                onClick={handleUpload}
                  isLoading={isUploading}
              >
                  Upload
                </Button>
            ) : (
              <>
                  <Link to="/login">
                    <Button variant="primary">Login</Button>
                </Link>
                  <Link to="/register">
                    <Button variant="secondary">Sign Up</Button>
                </Link>
              </>
            )}
            <button
              onClick={onClose}
                disabled={isUploading}
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-glass)] transition-colors disabled:opacity-50"
              aria-label="Close"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div
          ref={scrollContainerRef as React.RefObject<HTMLDivElement>}
            className="flex-1 overflow-y-auto p-6 bg-[var(--bg-secondary)]"
        >
            <div className="glass-card p-8 text-left border-l-4 border-l-violet-500">
            <MarkdownViewer
              content={content}
              scrollContainerRef={scrollContainerRef}
            />
          </div>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
