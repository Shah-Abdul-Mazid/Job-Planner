import React from 'react';
import { LucideIcon, FileText, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title, description, icon: Icon = FileText, actionText, onAction,
}) => (
  <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border-2 border-dashed"
    style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
      <Icon className="w-7 h-7 text-purple-400" />
    </div>
    <h3 className="text-base font-bold text-white mb-1">{title}</h3>
    <p className="text-sm max-w-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
    {actionText && onAction && (
      <button onClick={onAction} className="btn-primary mt-5">
        <Plus className="w-4 h-4" /> {actionText}
      </button>
    )}
  </div>
);
