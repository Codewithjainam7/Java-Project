import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  colorBg?: 'yellow' | 'coral' | 'teal' | 'mint' | 'white';
  subtitle?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  colorBg = 'yellow',
  subtitle,
  icon,
}) => {
  const bgMap = {
    yellow: '#FFE066',
    coral: '#FF6B6B',
    teal: '#4ECDC4',
    mint: '#A8E6CF',
    white: '#FFFFFF',
  };

  return (
    <div
      className="nb-card p-5 flex flex-col justify-between relative overflow-hidden"
      style={{ backgroundColor: bgMap[colorBg] }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-heading text-xs uppercase tracking-wider text-black font-extrabold bg-white/80 px-2 py-0.5 border-2 border-black">
          {label}
        </span>
        {icon && <div className="p-1 bg-white border-2 border-black">{icon}</div>}
      </div>

      <div className="font-heading text-3xl md:text-4xl font-black text-black my-1">
        {value}
      </div>

      {subtitle && (
        <div className="text-xs font-semibold text-black/80 mt-1 uppercase tracking-wide">
          {subtitle}
        </div>
      )}
    </div>
  );
};
