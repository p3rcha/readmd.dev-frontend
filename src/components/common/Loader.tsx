import { motion } from 'motion/react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-2',
  lg: 'w-14 h-14 border-3',
};

export function Loader({ size = 'md', text }: LoaderProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`
          ${sizeClasses[size]}
          border-violet-500 border-t-transparent
          rounded-full
        `}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-[var(--text-tertiary)] text-sm">{text}</p>
      )}
    </div>
  );
}
