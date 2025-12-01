import { motion } from 'motion/react';

interface AnimatedBackgroundProps {
  variant?: 'default' | 'auth' | 'hero';
}

export function AnimatedBackground({ variant = 'default' }: AnimatedBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[var(--bg-primary)]" />
      
      {/* Gradient mesh overlay */}
      <div className="absolute inset-0 gradient-mesh" />
      
      {/* Animated orbs */}
          <motion.div
        className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
        }}
            animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
        className="absolute -bottom-[30%] -right-[20%] w-[70%] h-[70%] rounded-full opacity-25"
            style={{
          background: 'radial-gradient(circle, rgba(217, 70, 239, 0.4) 0%, transparent 70%)',
            }}
            animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
            }}
            transition={{
          duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

      {variant === 'hero' && (
        <>
          {/* Additional floating geometric shapes for hero */}
          <motion.div
            className="absolute top-[20%] right-[15%] w-24 h-24 border-2 border-violet-500/20 rounded-xl"
            animate={{
              rotate: [0, 90, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          <motion.div
            className="absolute bottom-[25%] left-[10%] w-16 h-16 border-2 border-fuchsia-500/20"
            style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
            animate={{
              rotate: [0, -120, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <motion.div
            className="absolute top-[60%] right-[25%] w-8 h-8 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </>
      )}

      {variant === 'auth' && (
        <>
          {/* Centered glow for auth pages */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 60%)',
            }}
          />

          {/* Floating squares */}
          <motion.div
            className="absolute top-[15%] left-[20%] w-12 h-12 border border-violet-500/30 rounded-lg"
            animate={{
              rotate: [0, 180, 360],
              y: [0, -15, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          <motion.div
            className="absolute bottom-[20%] right-[15%] w-8 h-8 border border-fuchsia-500/30 rounded"
            animate={{
              rotate: [360, 180, 0],
              x: [0, 10, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </>
      )}

      {/* Noise texture overlay */}
      <div className="noise-overlay" />
    </div>
  );
}
