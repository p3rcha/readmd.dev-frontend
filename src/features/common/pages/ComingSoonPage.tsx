import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTheme } from '../../../contexts/ThemeContext';
import { Button, GlassCard } from '../../../components/ui';
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

export function ComingSoonPage() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center">
      <section className="relative py-20 md:py-28 px-6 overflow-hidden w-full">
        {/* Light mode: Clean gradient background */}
        {!isDarkMode && (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50" />
            <div className="absolute top-0 -left-40 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl" />
            <div className="absolute top-20 right-0 w-80 h-80 bg-fuchsia-200/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
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
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Coming Soon
              </span>
            </motion.div>

            {/* Icon */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500/20 mb-4">
                <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] mb-5 tracking-tight"
            >
              Registration is{' '}
              <span className="gradient-text">coming soon</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-[var(--text-tertiary)] max-w-xl mx-auto mb-10 leading-relaxed"
            >
              We're currently in development and registration will be available soon. 
              Check back later or contact us for early access.
            </motion.p>

            {/* Info Card */}
            <motion.div variants={itemVariants}>
              <GlassCard padding="lg" className="text-left border-l-4 border-l-amber-500 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      What's happening?
                    </h3>
                    <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-3">
                      We're building readmd.dev with care and attention to detail. 
                      Public registration will be available once we're ready to scale.
                    </p>
                    <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                      In the meantime, you can still view public markdown files shared by others.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link to="/">
                <Button variant="primary" size="lg">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Home
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Already have an account?
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/15 via-violet-500/10 to-transparent blur-3xl" />
        </div>
      </section>
    </div>
  );
}
