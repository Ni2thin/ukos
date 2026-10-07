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
  const isIridescent = iridescent || glow;
  return (
    <div
      className={`relative rounded-2xl border border-zinc-200 dark:border-white/5 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl transition-all duration-300 ${
        glow ? 'shadow-[0_0_20px_rgba(99,102,241,0.15)] dark:shadow-[0_0_20px_rgba(99,102,241,0.05)] border-indigo-500/20 dark:border-indigo-500/10' : 'shadow-lg shadow-black/5'
      } ${isIridescent ? 'iridescent-card' : ''} ${className}`}
      {...props}
    >
      {/* Noise filter overlay */}
      {noise && <div className="glass-noise-overlay" />}

      {/* Glow effect helper */}
      {glow && (
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl pointer-events-none" />
      )}

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => {
  return (
    <div className={`p-5 flex flex-col space-y-1.5 border-b border-zinc-100 dark:border-white/5 pb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-lg font-semibold leading-none tracking-tight text-zinc-900 dark:text-zinc-50 ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-xs text-zinc-500 dark:text-zinc-400 ${className}`} {...props}>
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
