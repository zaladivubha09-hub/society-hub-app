import React from 'react';

// Fix: Extend React.HTMLAttributes<HTMLDivElement> to accept props like onClick
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...rest }) => {
  return (
    <div {...rest} className={`bg-card border border-border rounded-lg shadow-md p-6 ${className} transition-transform duration-300 ease-in-out hover:-translate-y-1`}>
      {children}
    </div>
  );
};

export default Card;
