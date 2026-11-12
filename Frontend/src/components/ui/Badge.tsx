import React from 'react';
import { ApplicationStatus } from '../../types';

interface BadgeProps {
  status: ApplicationStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getStyle = (status: string): React.CSSProperties => {
    switch (status) {
      case 'Admit Card Available':
        return { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' };
      case 'Exam Scheduled':
        return { background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' };
      case 'Shortlisted':
      case 'Selected':
        return { background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' };
      case 'Submitted':
      case 'Applied':
        return { background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' };
      case 'Written Examination':
        return { background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' };
      case 'Viva':
        return { background: 'rgba(6,182,212,0.15)', color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)' };
      case 'Rejected':
        return { background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' };
      case 'Waiting List':
        return { background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' };
      default:
        return { background: 'rgba(148,146,168,0.15)', color: '#9492a8', border: '1px solid rgba(148,146,168,0.2)' };
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${className}`}
      style={getStyle(status)}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 flex-shrink-0" />
      {status}
    </span>
  );
};
