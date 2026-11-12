import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen, onClose, title, description, children, maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 transition-opacity"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative overflow-hidden rounded-2xl w-full ${maxWidth} shadow-2xl`}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              {description && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{description}</p>
              )}
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Body */}
          <div className="px-6 py-5 max-h-[calc(85vh-120px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
