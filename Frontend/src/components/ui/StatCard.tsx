import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'indigo',
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/70',
      iconBg: 'bg-indigo-100 text-indigo-600',
      border: 'hover:border-indigo-200',
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      iconBg: 'bg-emerald-100 text-emerald-600',
      border: 'hover:border-emerald-200',
    },
    amber: {
      bg: 'bg-amber-50/70',
      iconBg: 'bg-amber-100 text-amber-600',
      border: 'hover:border-amber-200',
    },
    rose: {
      bg: 'bg-rose-50/70',
      iconBg: 'bg-rose-100 text-rose-600',
      border: 'hover:border-rose-200',
    },
    blue: {
      bg: 'bg-blue-50/70',
      iconBg: 'bg-blue-100 text-blue-600',
      border: 'hover:border-blue-200',
    },
    purple: {
      bg: 'bg-purple-50/70',
      iconBg: 'bg-purple-100 text-purple-600',
      border: 'hover:border-purple-200',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.indigo;

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm transition-all duration-200 hover:shadow-md ${scheme.border}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {subtitle && (
        <div className="mt-3 flex items-center text-xs text-slate-500">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
