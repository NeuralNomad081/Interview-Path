import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-surface-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-surface-500
            focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50
            transition-all duration-200
            hover:border-white/20
            ${error ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-red-400 text-sm flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-red-400" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;