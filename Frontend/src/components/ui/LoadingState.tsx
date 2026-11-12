import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center p-16 text-center">
    <div className="relative mb-4">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#7c3aed' }} />
      <div className="absolute inset-0 rounded-full blur-sm opacity-30"
        style={{ background: '#7c3aed', animation: 'pulse 2s infinite' }} />
    </div>
    <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{message}</p>
  </div>
);
