interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  size = 'md',
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const variantClasses = {
    primary:
      'bg-brand-primary text-white font-semibold hover:bg-brand-primary-light active:scale-[0.98] transition-all duration-150',
    secondary:
      'border border-brand-border bg-brand-card text-brand-text font-semibold ' +
      'hover:border-white/20 hover:bg-brand-card-alt active:scale-[0.98] transition-all duration-150',
    ghost:
      'text-brand-text-secondary font-medium hover:text-brand-text hover:bg-brand-card ' +
      'active:scale-[0.98] transition-all duration-150',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-full
        ${fullWidth ? 'w-full' : ''}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
      `}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      <span>{children}</span>
    </button>
  );
}
