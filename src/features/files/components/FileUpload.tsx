import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { FileMetadata } from '../../../types/file';
import { FilePreviewModal } from './FilePreviewModal';
import { GlassCard, Button } from '../../../components/ui';

interface FileUploadProps {
  onUpload: (file: File, visibility: 'private' | 'unlisted' | 'public') => Promise<FileMetadata>;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [pasteContent, setPasteContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewContent, setPreviewContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewFileName, setPreviewFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowPreview(false);
    setPreviewFile(null);
    setPreviewContent('');
    setPreviewFileName('');
    setError('');
    setIsUploading(false);
    setIsDragging(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const validateFile = (file: File): boolean => {
    if (!file.name.toLowerCase().endsWith('.md')) {
      setError('Only .md files are allowed');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return false;
    }
    return true;
  };

  const createFileFromContent = (content: string, filename: string): File => {
    const blob = new Blob([content], { type: 'text/markdown' });
    return new File([blob], filename, { type: 'text/markdown' });
  };

  const handleFile = async (file: File) => {
    setError('');
    if (!validateFile(file)) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setPreviewContent(content);
      setPreviewFile(file);
      setPreviewFileName(file.name);
      setShowPreview(true);
    };
    reader.readAsText(file);
  };

  const handlePaste = () => {
    if (!pasteContent.trim()) {
      setError('Please enter some content');
      return;
    }

    if (!fileName.trim()) {
      setError('Please enter a file name');
      return;
    }

    const finalFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
    const file = createFileFromContent(pasteContent, finalFileName);
    setPreviewContent(pasteContent);
    setPreviewFile(file);
    setPreviewFileName(finalFileName);
    setShowPreview(true);
  };

  const handleModalUpload = async (file: File, visibility: 'private' | 'unlisted' | 'public'): Promise<FileMetadata> => {
    setIsUploading(true);
    setError('');
    try {
      const result = await onUpload(file, visibility);
      setShowPreview(false);
      setPreviewFile(null);
      setPreviewContent('');
      setPreviewFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setPasteContent('');
      setFileName('');
      setError('');
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowPreview(false);
    setPreviewFile(null);
    setPreviewContent('');
    setPreviewFileName('');
    setError('');
    setIsUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <GlassCard padding="lg" className="max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-[var(--bg-secondary)]">
        {(['upload', 'paste'] as const).map((tab) => (
          <button
            key={tab}
            className={`
              flex-1 px-6 py-3 text-sm font-medium rounded-lg
              transition-all duration-200
              ${mode === tab
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
            onClick={() => setMode(tab)}
          >
            {tab === 'upload' ? 'File Upload' : 'Paste Content'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'upload' ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`
                relative rounded-2xl py-16 px-8 text-center cursor-pointer
                transition-all duration-300
                border-2 border-dashed
                ${isDragging
                  ? 'border-violet-500 bg-violet-500/10 scale-[1.02]'
                  : 'border-[var(--border-secondary)] hover:border-violet-500/50 hover:bg-[var(--bg-glass)]'
                }
              `}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".md"
                onChange={handleFileInput}
                className="hidden"
              />

              {/* Upload Icon */}
              <motion.div
                animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="mb-6"
              >
                <div className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-2xl
                  ${isDragging 
                    ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500' 
                    : 'bg-[var(--bg-tertiary)]'
                  }
                  transition-colors duration-300
                `}>
                  <svg 
                    className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-[var(--text-tertiary)]'}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                </div>
              </motion.div>

              <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                {isDragging ? 'Drop your file here' : 'Drag & drop a markdown file'}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                or click to select a file
              </p>
              
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-violet-500/30 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-violet-500/30 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-violet-500/30 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-violet-500/30 rounded-br-lg" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="paste"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                File Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
              required
                className="input-glass"
                placeholder="Enter file name (e.g., my-document)"
              value={fileName}
              onChange={(e) => {
                setFileName(e.target.value);
                setError('');
              }}
              />
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                .md extension will be added automatically
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Content
              </label>
              <textarea
                className="input-glass resize-y min-h-[200px] font-mono text-sm"
                placeholder="Paste your markdown content here..."
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              rows={10}
            />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-[var(--border-primary)]">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Visibility:
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as typeof visibility)}
            className="input-glass py-2 px-3 pr-8 text-sm min-w-[120px]"
          >
            <option value="private">🔒 Private</option>
            <option value="unlisted">🔗 Unlisted</option>
            <option value="public">🌐 Public</option>
          </select>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={mode === 'paste' ? handlePaste : () => fileInputRef.current?.click()}
          disabled={isUploading || (mode === 'paste' && (!pasteContent.trim() || !fileName.trim()))}
          isLoading={isUploading}
        >
          {mode === 'paste' ? 'Preview' : 'Select File'}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Button>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
          >
              {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      {showPreview && previewFile && (
        <FilePreviewModal
          file={previewFile}
          content={previewContent}
          fileName={previewFileName}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          onUpload={handleModalUpload}
          onClose={handleCloseModal}
          isUploading={isUploading}
        />
      )}
    </GlassCard>
  );
}
