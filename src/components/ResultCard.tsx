import React from 'react';
import { Check, X, Edit3 } from 'lucide-react';

interface ResultCardProps {
  title?: string;
  children: React.ReactNode;
  onSave: () => void;
  onDiscard: () => void;
  saveText?: string;
  discardText?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title = 'AI EXTRACTION RESULT (EDITABLE)',
  children,
  onSave,
  onDiscard,
  saveText = 'SAVE RESULT',
  discardText = 'DISCARD',
}) => {
  return (
    <div className="nb-card p-5 md:p-6 mb-8 bg-[#FFF9EC] border-3 border-black">
      <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-[#A8E6CF] p-1.5 border-2 border-black">
            <Edit3 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <h3 className="font-heading text-lg font-black uppercase text-black">
            {title}
          </h3>
        </div>
        <span className="font-heading text-xs uppercase font-extrabold bg-[#2ECC71] text-white px-2 py-1 border-2 border-black shadow-[2px_2px_0_#111111]">
          VERIFY & EDIT
        </span>
      </div>

      <div className="mb-6">{children}</div>

      <div className="flex flex-wrap gap-4 justify-end border-t-3 border-black pt-4">
        <button
          type="button"
          onClick={onDiscard}
          className="nb-btn nb-btn-secondary px-5 py-2.5 text-xs font-heading font-extrabold"
        >
          <X className="w-4 h-4 stroke-[3]" />
          {discardText}
        </button>

        <button
          type="button"
          onClick={onSave}
          className="nb-btn nb-btn-success px-6 py-2.5 text-xs font-heading font-extrabold"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          {saveText}
        </button>
      </div>
    </div>
  );
};
