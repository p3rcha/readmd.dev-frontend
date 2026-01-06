import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { filesApi } from '../../../api/files';
import { FileUpload } from '../components/FileUpload';
import { useAuth } from '../../auth/hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';
import { GlassCard, Button } from '../../../components/ui';
import FloatingLines from '../../../components/common/FloatingLines';

const PENDING_FILE_KEY = 'pendingFileId';

// Animation variants for staggered children
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

export function FilesDashboardPage() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Only use FloatingLines for dark mode
  const isDarkMode = theme === 'dark';

  // Clear stale state on mount
  useEffect(() => {
    const pendingFileId = sessionStorage.getItem(PENDING_FILE_KEY);
    if (pendingFileId && isAuthenticated) {
      sessionStorage.removeItem(PENDING_FILE_KEY);
    }
    
    if (isAuthenticated) {
      setShowLoginPrompt(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginPrompt(false);
    }
  }, [isAuthenticated]);

  const uploadMutation = useMutation({
    mutationFn: ({ file, visibility }: { file: File; visibility: 'private' | 'unlisted' | 'public' }) =>
      isAuthenticated
        ? filesApi.uploadFile(file, visibility)
        : filesApi.uploadFileAnonymous(file, visibility),
    onSuccess: (data) => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['files'] });
      } else {
        sessionStorage.setItem(PENDING_FILE_KEY, data.id);
        setShowLoginPrompt(true);
      }
    },
  });

  const handleUpload = async (file: File, visibility: 'private' | 'unlisted' | 'public') => {
    return await uploadMutation.mutateAsync({ file, visibility });
  };

  const steps = [
    {
      number: '1',
      title: 'Drop it',
      description: 'Drag your .md file or paste raw markdown directly.',
      accent: 'from-violet-500 to-violet-600',
    },
    {
      number: '2',
      title: 'Preview it',
      description: 'See your content rendered with full GFM support.',
      accent: 'from-fuchsia-500 to-fuchsia-600',
    },
    {
      number: '3',
      title: 'Ship it',
      description: 'Copy your link and share it anywhere.',
      accent: 'from-amber-500 to-amber-600',
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 px-6 overflow-hidden">
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
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Open source markdown hosting
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.15] mb-5 tracking-tight"
            >
              Your docs deserve a{' '}
              <span className="gradient-text">home</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-[var(--text-tertiary)] max-w-xl mx-auto mb-10 leading-relaxed"
            >
              Turn any markdown into a beautiful, shareable page. No account required.
            </motion.p>

            {/* Quick stats */}
            <motion.div 
              variants={itemVariants}
              className="flex items-center justify-center gap-8 mb-10 text-sm"
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[var(--text-secondary)]">No signup needed</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[var(--text-secondary)]">Full GFM support</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[var(--text-secondary)]">Instant sharing</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start now — it's free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Button>
              {!isAuthenticated && (
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    Sign in
                  </Button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent blur-3xl" />
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload-section" className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-violet-500/50" />
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Try it out</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-violet-500/50" />
            </div>
            
            <FileUpload onUpload={handleUpload} />
            
            {/* Login Prompt after Anonymous Upload */}
            {showLoginPrompt && !isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <GlassCard className="mt-8 text-center border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <p className="text-[var(--text-primary)] font-medium">
                      File uploaded successfully!
                    </p>
                  </div>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Login to claim ownership and manage your file.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link to="/login">
                      <Button variant="primary">Login</Button>
                    </Link>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Simple Steps Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Dead simple workflow
            </h2>
            <p className="text-[var(--text-tertiary)]">
              From markdown to shareable link in under 10 seconds
            </p>
          </motion.div>

          {/* Horizontal steps on desktop, vertical on mobile */}
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex-1 relative"
              >
                <div className="glass-card p-5 h-full border-l-2 border-l-transparent hover:border-l-violet-500 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${step.accent} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
                {/* Connector arrow (hidden on mobile and last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-[var(--text-muted)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why readmd.dev Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why <span className="gradient-text">readmd.dev</span>?
            </h2>
            <p className="text-[var(--text-tertiary)] max-w-2xl mx-auto">
              Built for developers, writers, and teams who value simplicity and speed
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Zero Config */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <GlassCard variant="hover" padding="lg" className="h-full">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Zero Configuration</h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  No setup, no build tools, no hosting headaches. Just upload and share.
                </p>
              </GlassCard>
            </motion.div>

            {/* Beautiful Rendering */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GlassCard variant="hover" padding="lg" className="h-full">
                <div className="w-10 h-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Beautiful Rendering</h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  Full GFM support with syntax highlighting, tables, and task lists.
                </p>
              </GlassCard>
            </motion.div>

            {/* Privacy Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassCard variant="hover" padding="lg" className="h-full">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Privacy Controls</h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  Choose who sees your content: private, unlisted, or public.
                </p>
              </GlassCard>
            </motion.div>

            {/* Instant Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <GlassCard variant="hover" padding="lg" className="h-full">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Instant Links</h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  Get a shareable link immediately. No waiting, no approval.
                </p>
              </GlassCard>
            </motion.div>

            {/* Syntax Highlighting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <GlassCard variant="hover" padding="lg" className="h-full">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Code Blocks</h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  Share code snippets with proper formatting and readability.
                </p>
              </GlassCard>
            </motion.div>

            {/* Mobile Friendly */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <GlassCard variant="hover" padding="lg" className="h-full">
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Mobile Friendly</h3>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed">
                  Your docs look great on any device, from phone to desktop.
                </p>
              </GlassCard>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-16"
          >
            <p className="text-[var(--text-secondary)] mb-6">
              Ready to share your markdown?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started Free
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </Button>
              {!isAuthenticated && (
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
