interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  size = 'md',
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  const variantClasses = {
    primary:
      'relative bg-violet-600 text-white font-semibold overflow-hidden ' +
      'before:absolute before:inset-0 before:bg-gradient-to-r before:from-violet-500 before:to-purple-600 before:opacity-0 before:transition-opacity ' +
      'hover:before:opacity-100 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] active:scale-[0.98] transition-all duration-200',
    secondary:
      'border border-white/10 bg-white/5 text-gray-200 font-semibold ' +
      'hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200',
    ghost:
      'text-gray-400 font-medium hover:text-white hover:bg-white/5 ' +
      'active:scale-[0.98] transition-all duration-200',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
      `}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
