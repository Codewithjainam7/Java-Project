import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'THINKING...' }) => {
  return (
    <div className="nb-card p-6 my-6 bg-white flex flex-col items-center justify-center text-center">
      <div className="w-full h-8 mb-4 nb-loader-stripes" />
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-black animate-spin" />
        <span className="font-heading text-lg font-black uppercase tracking-wider text-black">
          {message}
        </span>
      </div>
      <p className="text-xs font-semibold text-gray-600 mt-2">
        SIMULATING AI PROCESSING ENGINE (1.5s DELAY)...
      </p>
    </div>
  );
};
