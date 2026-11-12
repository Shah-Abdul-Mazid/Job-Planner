import React from 'react';
import {
  LayoutDashboard, Briefcase, Calendar, FileText,
  Bot, Bell, Building2, Users, ChevronLeft, ChevronRight,
  UserCheck, FileSpreadsheet, FileCheck2
} from 'lucide-react';

export type NavItemKey = 
  | 'dashboard' 
  | 'applications' 
  | 'resume' 
  | 'companies' 
  | 'interviews' 
  | 'calendar' 
  | 'admit-upload'
  | 'seatplan-upload'
  | 'documents' 
  | 'assistant' 
  | 'notifications';

interface SidebarProps {
  currentTab: NavItemKey;
  onTabChange: (tab: NavItemKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingAlertsCount?: number;
}

const MAIN_MENU = [
  { key: 'dashboard' as NavItemKey,    label: 'Dashboard',     icon: LayoutDashboard },
  { key: 'resume' as NavItemKey,       label: 'Resume / CV',   icon: UserCheck },
  { key: 'applications' as NavItemKey, label: 'Applications',  icon: Briefcase },
  { key: 'companies' as NavItemKey,    label: 'Companies',     icon: Building2 },
  { key: 'interviews' as NavItemKey,   label: 'Interviews',    icon: Users },
  { key: 'calendar' as NavItemKey,     label: 'Calendar',      icon: Calendar },
];

const TOOLS_MENU = [
  { key: 'admit-upload' as NavItemKey,    label: 'Admit Card Upload',     icon: FileCheck2 },
  { key: 'seatplan-upload' as NavItemKey, label: 'Seat Plan & Schedule',  icon: FileSpreadsheet },
  { key: 'assistant' as NavItemKey,       label: 'AI Coach & Intel',      icon: Bot },
  { key: 'notifications' as NavItemKey,   label: 'Notifications',         icon: Bell, hasBadge: true },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab, onTabChange, collapsed, onToggleCollapse, pendingAlertsCount = 2,
}) => {
  const renderItem = (item: { key: NavItemKey; label: string; icon: any; hasBadge?: boolean }) => {
    const Icon = item.icon;
    const isActive = currentTab === item.key;
    return (
      <button
        key={item.key}
        onClick={() => onTabChange(item.key)}
        title={collapsed ? item.label : undefined}
        className={`w-full flex items-center rounded-xl transition-all duration-150 group
          ${collapsed ? 'justify-center p-3' : 'px-3.5 py-2.5 gap-3'}
          ${isActive
            ? 'text-white font-semibold'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }
        `}
        style={isActive ? {
          background: 'linear-gradient(135deg, rgba(124,58,237,0.3) 0%, rgba(124,58,237,0.12) 100%)',
          borderLeft: collapsed ? 'none' : '3px solid #8b5cf6',
          boxShadow: '0 0 20px rgba(124,58,237,0.15)',
        } : {
          borderLeft: collapsed ? 'none' : '3px solid transparent',
        }}
      >
        <Icon className={`flex-shrink-0 transition-colors
          ${collapsed ? 'w-5 h-5' : 'w-4.5 h-4.5'}
          ${isActive ? 'text-purple-400' : 'text-zinc-400 group-hover:text-zinc-200'}
        `} style={{ width: '18px', height: '18px' }} />

        {!collapsed && (
          <>
            <span className={`text-xs sm:text-sm font-medium flex-1 text-left ${isActive ? 'text-white' : ''}`}>
              {item.label}
            </span>
            {item.hasBadge && pendingAlertsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingAlertsCount}
              </span>
            )}
          </>
        )}

        {/* Tooltip dot for active in collapsed */}
        {collapsed && isActive && (
          <span className="absolute right-0 w-1 h-6 bg-purple-500 rounded-l-full" />
        )}
      </button>
    );
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col transition-all duration-300 relative`}
      style={{
        width: collapsed ? '72px' : '240px',
        background: '#0d0d12',
        borderRight: '1px solid #1f1f28',
      }}
    >
      {/* ── Brand ── */}
      <div className={`flex items-center h-16 border-b px-4 gap-3 flex-shrink-0`}
        style={{ borderColor: '#1f1f28' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
          <span className="text-white font-extrabold text-sm">K</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-extrabold text-white tracking-tight whitespace-nowrap">CareerTrack BD</div>
            <div className="text-[10px] font-semibold tracking-wider uppercase text-purple-400">
              Recruitment Intel
            </div>
          </div>
        )}
        {!collapsed && (
          <button onClick={onToggleCollapse} className="ml-auto p-1.5 rounded-lg transition-colors hover:bg-white/5 text-zinc-400 hover:text-white">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className={`flex-1 overflow-y-auto py-4 space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
        {!collapsed && (
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 pb-2">Main Menu</p>
        )}
        {MAIN_MENU.map(renderItem)}

        {/* Tools Section */}
        <div className={`${collapsed ? 'my-3' : 'mt-6 mb-2'}`}>
          {!collapsed && <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 pb-2">Intelligence &amp; Uploads</p>}
          {collapsed && <div className="border-t mx-2 my-3 border-zinc-800" />}
        </div>
        {TOOLS_MENU.map(renderItem)}
      </nav>

      {/* ── Footer ── */}
      <div className={`flex-shrink-0 border-t ${collapsed ? 'px-2 py-3 space-y-1' : 'px-3 py-3 space-y-1'}`}
        style={{ borderColor: '#1f1f28' }}>
        {collapsed ? (
          <button onClick={onToggleCollapse}
            className="w-full flex justify-center p-3 rounded-xl transition-colors hover:bg-white/5 text-zinc-400 hover:text-white">
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="px-3 py-2.5 rounded-xl bg-purple-950/20 border border-purple-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-xs font-bold text-purple-300">Asia/Dhaka (BST)</span>
            </div>
            <p className="text-[10px] mt-1 text-zinc-400 leading-tight">
              BB · BSCS · BPSC · Teletalk
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
