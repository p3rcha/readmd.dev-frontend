import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button } from '../../../components/ui';
import FloatingLines from '../../../components/common/FloatingLines';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
} as const;

export function NotFoundPage() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="w-full">
      <section className="relative py-20 md:py-28 px-6 overflow-hidden w-full">
        {/* Light mode: Clean gradient background */}
        {!isDarkMode && (
          <div className="absolute inset-0 z-0">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50" />
            {/* Subtle decorative blobs */}
            <div className="absolute top-0 -left-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl" />
            <div className="absolute top-20 right-0 w-80 h-80 bg-fuchsia-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
            {/* Grid pattern overlay */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)`,
                backgroundSize: '60px 60px'
              }}
            />
          </div>
        )}
        
        {/* Dark mode: Floating Lines Background */}
        {isDarkMode && (
          <div className="absolute inset-0 z-0">
            <FloatingLines
              linesGradient={['#8b5cf6', '#a855f7', '#d946ef']}
              enabledWaves={['middle', 'bottom']}
              lineCount={[8, 5]}
              lineDistance={[6, 8]}
              animationSpeed={0.4}
              interactive={true}
              bendRadius={4.0}
              bendStrength={-0.4}
              parallax={false}
              mixBlendMode="screen"
            />
          </div>
        )}
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 404 Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Page not found
              </span>
            </motion.div>

            {/* Large 404 Number */}
            <motion.div 
              variants={itemVariants}
              className="mb-2"
            >
              <span className="text-[6rem] md:text-[8rem] font-extrabold leading-none gradient-text select-none">
                404
              </span>
            </motion.div>

            {/* Message */}
            <motion.h1 
              variants={itemVariants}
              className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight mb-3 tracking-tight text-[var(--text-primary)]"
            >
              Oops! This page got{' '}
              <span className="gradient-text">lost</span>
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              variants={itemVariants}
              className="text-sm md:text-base text-[var(--text-tertiary)] max-w-sm mx-auto mb-6 leading-relaxed"
            >
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back on track.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link to="/">
                <Button 
                  variant="primary" 
                  size="lg"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </Button>
              </Link>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => window.history.back()}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent blur-3xl" />
        </div>

        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-20 left-10 w-3 h-3 rounded-full bg-violet-400/30"
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-32 right-20 w-2 h-2 rounded-full bg-fuchsia-400/40"
          animate={{
            y: [0, 15, 0],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-40 right-32 w-4 h-4 rounded-full bg-indigo-400/20"
          animate={{
            y: [0, -10, 0],
            x: [0, 5, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </section>
    </div>
  );
}

