import { useAuth } from '../../features/auth/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { motion } from 'motion/react';
import { Button } from '../ui';

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-50 glass-heavy border-b border-[var(--border-glass)]"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="group">
          <motion.span 
            className="text-xl font-bold"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <span className="gradient-text">readmd</span>
            <span className="text-[var(--text-muted)]">.dev</span>
          </motion.span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Dashboard Link */}
              <Link to="/dashboard">
                <motion.div
                  className={`
                    relative px-4 py-2 rounded-xl text-sm font-medium
                    transition-colors duration-200
                    ${isActive('/dashboard')
                      ? 'text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive('/dashboard') && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">Dashboard</span>
                </motion.div>
              </Link>

              {/* User email */}
              <span className="text-sm text-[var(--text-muted)] hidden sm:block">
                {user.email}
              </span>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
              >
                {t('common.logout')}
              </Button>
            </>
          ) : (
            <>
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Login */}
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>

              {/* Sign Up */}
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
