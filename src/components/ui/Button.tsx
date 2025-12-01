import { motion, type HTMLMotionProps } from 'motion/react';
import { forwardRef, type ReactNode } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const variantClasses = {
  primary: `
    bg-gradient-to-r from-violet-500 to-fuchsia-500 
    text-white font-semibold
    hover:from-violet-600 hover:to-fuchsia-600
    shadow-lg shadow-violet-500/25
    hover:shadow-violet-500/40
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-violet-500/25
  `,
  secondary: `
    glass-card
    text-[var(--text-primary)] font-medium
    hover:border-violet-500 hover:bg-[var(--bg-glass-hover)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent
    text-[var(--text-secondary)] font-medium
    hover:bg-[var(--bg-glass)] hover:text-[var(--text-primary)]
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  danger: `
    bg-gradient-to-r from-red-500 to-rose-500
    text-white font-semibold
    hover:from-red-600 hover:to-rose-600
    shadow-lg shadow-red-500/25
    hover:shadow-red-500/40
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
  variant = 'primary',
  size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
  className = '',
      children,
      disabled,
  ...props
    },
    ref
  ) => {
    const combinedClasses = `
      inline-flex items-center justify-center gap-2
      transition-all duration-200 ease-out
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${className}
    `.trim();

  return (
    <motion.button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
        {isLoading ? (
          <motion.span
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && <span className="flex-shrink-0">{rightIcon}</span>}
    </motion.button>
  );
}
);

Button.displayName = 'Button';
