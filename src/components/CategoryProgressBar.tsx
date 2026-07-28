import React from 'react';

interface CategoryProgressBarProps {
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export const CategoryProgressBar: React.FC<CategoryProgressBarProps> = ({
  label,
  amount,
  percentage,
  color,
}) => {
  return (
    <div className="mb-4">
      {/* Label and amount box */}
      <div className="flex justify-between items-center bg-white border-2 border-black p-2 mb-1 shadow-[2px_2px_0_#111111]">
        <span className="font-heading text-sm font-bold uppercase">{label}</span>
        <span className="font-heading text-sm font-black">
          ${amount.toFixed(2)} <span className="text-xs text-gray-600 font-semibold">({percentage}%)</span>
        </span>
      </div>

      {/* Outer thick rectangular bar */}
      <div className="w-full h-6 bg-white border-3 border-black relative overflow-hidden shadow-[3px_3px_0_#111111]">
        <div
          className="h-full border-r-2 border-black transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(100, Math.max(0, percentage))}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};
