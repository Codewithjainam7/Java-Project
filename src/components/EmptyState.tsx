import React from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="nb-card p-8 text-center my-6 bg-white flex flex-col items-center justify-center">
      {icon && (
        <div className="p-4 bg-[#FFE066] border-3 border-black mb-4 shadow-[4px_4px_0_#111111]">
          {icon}
        </div>
      )}
      <h3 className="font-heading text-xl font-black uppercase text-black mb-2">
        {title}
      </h3>
      <p className="font-medium text-gray-700 max-w-md mb-6 text-sm">
        {message}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="nb-btn">
          {actionText}
        </button>
      )}
    </div>
  );
};
