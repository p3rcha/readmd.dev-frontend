import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const baseInputClasses = `
  w-full
  bg-[var(--bg-glass)]
  backdrop-blur-md
  border border-[var(--border-primary)]
  rounded-xl
  px-4 py-3
  text-[var(--text-primary)]
  placeholder:text-[var(--text-muted)]
  transition-all duration-200 ease-out
  focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20
  disabled:opacity-50 disabled:cursor-not-allowed
`;

const labelClasses = `
  block text-sm font-medium text-[var(--text-secondary)] mb-2
`;

const errorClasses = `
  mt-1.5 text-sm text-red-400
`;

const helperClasses = `
  mt-1.5 text-sm text-[var(--text-muted)]
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseInputClasses} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''} ${className}`}
          {...props}
        />
        {error && <p className={errorClasses}>{error}</p>}
        {helperText && !error && <p className={helperClasses}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`${baseInputClasses} resize-y min-h-[120px] font-mono text-sm ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''} ${className}`}
          {...props}
        />
        {error && <p className={errorClasses}>{error}</p>}
        {helperText && !error && <p className={helperClasses}>{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export const Select = forwardRef<
  HTMLSelectElement,
  InputProps & { children: React.ReactNode }
>(({ label, error, helperText, className = '', id, children, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
        <label htmlFor={inputId} className={labelClasses}>
            {label}
          </label>
        )}
        <select
          ref={ref}
        id={inputId}
        className={`${baseInputClasses} cursor-pointer ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''} ${className}`}
        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
      >
        {children}
        </select>
      {error && <p className={errorClasses}>{error}</p>}
      {helperText && !error && <p className={helperClasses}>{helperText}</p>}
      </div>
    );
});

Select.displayName = 'Select';
