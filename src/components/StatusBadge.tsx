import React from 'react';
import { ReminderStatus } from '../types';

interface StatusBadgeProps {
  status: ReminderStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let bgColor = '#FFE066'; // default yellow
  let textColor = '#111111';

  const normalized = status.toUpperCase();

  if (normalized === 'OVERDUE') {
    bgColor = '#FF3B3B'; // danger red
    textColor = '#FFFFFF';
  } else if (normalized === 'DUE SOON') {
    bgColor = '#FFAA00'; // warning orange
    textColor = '#111111';
  } else if (normalized === 'PENDING') {
    bgColor = '#4ECDC4'; // teal
    textColor = '#111111';
  } else if (normalized === 'PAID' || normalized === 'COMPLETED' || normalized === 'SAVED') {
    bgColor = '#2ECC71'; // success green
    textColor = '#FFFFFF';
  } else if (normalized === 'INCOMPLETE') {
    bgColor = '#FF6B6B'; // coral
    textColor = '#111111';
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`nb-badge font-heading ${paddingClass}`}
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {normalized}
    </span>
  );
};
