import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  noise?: boolean;
  iridescent?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  glow = false, 
  noise = true,
  iridescent = false,
  ...props 
}) => {
  return (
    <div className={`ukos-card ${glow || iridescent ? 'ukos-card-featured' : ''} ${className}`} {...props}>
      {noise && <div className="glass-noise-overlay" />}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 flex ${className.includes('justify-between') ? 'flex-row flex-wrap gap-3' : 'flex-col space-y-1.5'} border-b border-zinc-100 dark:border-white/5 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`card-title leading-tight text-zinc-900 dark:text-zinc-50 ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-sm text-zinc-500 dark:text-zinc-400 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 pt-4 ${className}`} {...props}>
      {children}
    </div>
  );
};
