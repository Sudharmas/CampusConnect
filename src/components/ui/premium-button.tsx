import React from 'react';

export const PremiumButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <div className="premium-button-wrapper">
      <button className="premium-button" {...props}>
        <div className="blob" />
        <div className="inner">
          {children}
        </div>
      </button>
    </div>
  );
};
