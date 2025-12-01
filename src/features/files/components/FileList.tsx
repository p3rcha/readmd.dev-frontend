import { motion, AnimatePresence } from 'motion/react';
import type { FileMetadata } from '../../../types/file';
import { FileCard } from './FileCard';

interface FileListProps {
  files: FileMetadata[];
  onDelete: (id: string) => void;
}

export function FileList({ files, onDelete }: FileListProps) {
    return (
      <motion.div
      className="grid gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      >
      <AnimatePresence mode="popLayout">
        {files.map((file) => (
          <FileCard key={file.id} file={file} onDelete={onDelete} />
        ))}
      </AnimatePresence>
      </motion.div>
  );
}
