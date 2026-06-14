import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'gold';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  className,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-semibold py-2 px-4 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm';
  const variants = {
    primary: 'bg-[#E8731A] hover:bg-[#155D38] text-white focus:ring-[#E8731A]',
    secondary: 'bg-white dark:bg-gray-800 border border-[#E8731A] text-[#E8731A] dark:text-green-400 dark:border-green-600 hover:bg-[#E8731A]/5 dark:hover:bg-green-900/20 focus:ring-[#E8731A]',
    gold: 'bg-[#4DB8E8] hover:bg-[#7DCEF4] text-[#1A1A1A] font-bold focus:ring-[#4DB8E8]',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${isLoading ? 'opacity-60 cursor-not-allowed' : ''} ${className ?? ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : children}
    </button>
  );
};
