import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBannerProps {
  message?: string;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message = "COULDN'T READ EVERYTHING — CHECK THE FIELDS BELOW",
  onDismiss,
}) => {
  return (
    <div className="bg-[#FFE066] border-3 border-black p-4 mb-6 shadow-[4px_4px_0_#111111] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-black text-[#FFE066] p-1 border-2 border-black flex-shrink-0">
          <AlertTriangle className="w-5 h-5 stroke-[3]" />
        </div>
        <span className="font-heading text-sm md:text-base font-black text-black uppercase tracking-wide">
          {message}
        </span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="nb-btn nb-btn-secondary px-2 py-1 text-xs border-2 font-bold"
        >
          DISMISS
        </button>
      )}
    </div>
  );
};
