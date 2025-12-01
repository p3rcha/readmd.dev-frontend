import { type ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'violet';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

const variantClasses = {
  default: `
    bg-[var(--bg-tertiary)]
    text-[var(--text-secondary)]
    border border-[var(--border-primary)]
  `,
  success: `
    bg-emerald-500/10
    text-emerald-400
    border border-emerald-500/20
  `,
  warning: `
    bg-amber-500/10
    text-amber-400
    border border-amber-500/20
  `,
  danger: `
    bg-red-500/10
    text-red-400
    border border-red-500/20
  `,
  violet: `
    bg-violet-500/10
    text-violet-400
    border border-violet-500/20
  `,
};

export function Badge({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-lg
        backdrop-blur-sm
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `.trim()}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Specific badge variants for file visibility
export function VisibilityBadge({ visibility }: { visibility: 'private' | 'unlisted' | 'public' }) {
  const config = {
    private: { variant: 'default' as const, icon: '🔒', label: 'Private' },
    unlisted: { variant: 'warning' as const, icon: '🔗', label: 'Unlisted' },
    public: { variant: 'success' as const, icon: '🌐', label: 'Public' },
  };

  const { variant, icon, label } = config[visibility];

  return (
    <Badge variant={variant} icon={icon}>
      {label}
    </Badge>
  );
}
