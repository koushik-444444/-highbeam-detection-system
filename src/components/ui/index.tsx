'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = true }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      className={`
        relative overflow-hidden
        bg-slate-900/80 backdrop-blur-xl
        border border-white/20
        rounded-2xl shadow-2xl
        ${className}
      `}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  disabled = false,
  loading = false,
  className = ''
}: ButtonProps) {
  const baseStyles = `
    relative px-6 py-3 rounded-xl font-semibold text-sm
    transition-all duration-300 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    overflow-hidden
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600 to-cyan-500
      hover:from-blue-500 hover:to-cyan-400
      text-white shadow-lg shadow-blue-500/30
      hover:shadow-blue-500/50 hover:scale-105
    `,
    secondary: `
      bg-white/10 backdrop-blur-sm border border-white/30
      text-white hover:bg-white/20
      hover:scale-105
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-orange-500
      hover:from-red-500 hover:to-orange-400
      text-white shadow-lg shadow-red-500/30
      hover:shadow-red-500/50 hover:scale-105
    `,
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" cy="12" r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : children}
    </motion.button>
  );
}

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  icon?: ReactNode;
}

export function Input({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  error,
  icon
}: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/80">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 ${icon ? 'pl-10' : ''}
            bg-slate-800/90 backdrop-blur-sm
            border ${error ? 'border-red-500' : 'border-white/30'}
            rounded-xl text-white placeholder-white/50
            focus:outline-none focus:ring-2 focus:ring-cyan-500/50
            focus:border-cyan-500 focus:bg-slate-700/90
            transition-all duration-300
          `}
        />
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  const variants = {
    success: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <span className={`
      inline-flex items-center px-3 py-1
      text-xs font-medium rounded-full
      border ${variants[variant]}
    `}>
      {children}
    </span>
  );
}

// Police Scanner Animation
export function PoliceScanner() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
      />
      <motion.div
        initial={{ x: '200%' }}
        animate={{ x: '-100%' }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'linear',
          delay: 0.5,
        }}
        className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-transparent via-red-500/10 to-transparent"
      />
    </div>
  );
}

// Animated Background Grid
export function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: 50 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 150, 255, 0.2) 2px, transparent 2px)
          `,
          backgroundSize: '100px 100px',
        }}
      />
    </div>
  );
}
