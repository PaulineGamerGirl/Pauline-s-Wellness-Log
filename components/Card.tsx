import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, title, className = '', action, style }) => {
  return (
    <div 
      className={`bg-white rounded-[24px] p-6 shadow-subtle border border-slate-100 transition-all duration-300 hover:shadow-float ${className}`}
      style={style}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
            {title && (
                <h3 className="font-sans font-bold text-lg text-slateText tracking-tight">
                {title}
                </h3>
            )}
            {action && action}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;