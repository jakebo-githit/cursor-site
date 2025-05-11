import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

type ButtonProps = {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  external?: boolean;
};

const Button = ({
  children,
  to,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  external = false,
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
    secondary: 'bg-secondary hover:bg-secondary-600 text-white shadow-sm',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  };
  
  const sizeClasses = {
    sm: 'text-sm py-1.5 px-3',
    md: 'text-base py-2 px-4',
    lg: 'text-lg py-2.5 px-5',
  };
  
  const disabledClasses = disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

  const buttonMotion = {
    whileHover: { scale: 1.03 },
    whileTap: { scale: 0.98 }
  };

  if (to) {
    if (external) {
      return (
        <motion.a
          href={to}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
          {...buttonMotion}
        >
          {children}
        </motion.a>
      );
    }
    return (
      <motion.div {...buttonMotion}>
        <Link to={to} className={classes}>
          {children}
        </Link>
      </motion.div>
    );
  }
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...buttonMotion}
    >
      {children}
    </motion.button>
  );
};

export default Button;