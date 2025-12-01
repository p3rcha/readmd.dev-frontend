import { motion, type HTMLMotionProps } from 'motion/react';
import { forwardRef, type ReactNode } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref' | 'children'> {
  variant?: 'default' | 'hover' | 'brutal' | 'gradient';
  blur?: 'normal' | 'heavy';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  children?: ReactNode;
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
  variant = 'default',
      blur = 'normal',
      padding = 'md',
      animate = true,
  className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      rounded-2xl
      ${blur === 'heavy' ? 'glass-heavy' : 'glass-card'}
      ${paddingMap[padding]}
    `;

    const variantClasses = {
      default: '',
      hover: 'glass-card-hover transition-all duration-300',
      brutal: 'border-brutal border-brutal-hover',
      gradient: 'gradient-border',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

    if (animate) {
  return (
    <motion.div
          ref={ref}
          className={combinedClasses}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          {...props}
    >
      {children}
    </motion.div>
  );
}

  return (
      <div ref={ref} className={combinedClasses} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
      {children}
    </div>
  );
}
);

GlassCard.displayName = 'GlassCard';
