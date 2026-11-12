import React, { useEffect, useState } from 'react';
import {
  Briefcase, CheckCircle, Calendar, Award, XCircle,
  FileClock, ArrowRight, Plus, AlertTriangle,
  TrendingUp, TrendingDown, FileSpreadsheet,
  Clock, MapPin, CheckCircle2, ExternalLink, MoreHorizontal,
  ChevronDown, Search, ArrowUpRight, Filter, Users, Building, ShieldCheck
} from 'lucide-react';
import { StatusBadge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { SeatPlanModal } from '../components/examinations/SeatPlanModal';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line
} from 'recharts';

interface DashboardProps {
  onNavigateToApplications: () => void;
  onOpenNewApplication: () => void;
}

// 7-day application activity trend (Sneat wavy chart)
const ACTIVITY_TREND = [
  { day: 'Mon 10', apps: 12 },
  { day: 'Tue 11', apps: 28 },
  { day: 'Wed 12', apps: 45 },
  { day: 'Thu 13', apps: 32 },
  { day: 'Fri 14', apps: 58 },
  { day: 'Sat 15', apps: 42 },
  { day: 'Sun 16', apps: 65 },
];

const RESOURCE_LINE = [
  { time: '1', val: 32 },
  { time: '2', val: 24 },
  { time: '3', val: 29 },
  { time: '4', val: 22 },
  { time: '5', val: 34 },
  { time: '6', val: 26 },
  { time: '7', val: 40 },
  { time: '8', val: 30 },
];

const DONUT_COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#10b981', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToApplications, onOpenNewApplication,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeatPlanOpen, setIsSeatPlanOpen] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;

  if (error) return (
    <div className="card p-8 text-center my-6">
      <AlertTriangle className="w-10 h-10 mx-auto mb-3 text-rose-400" />
      <h3 className="text-base font-bold text-white mb-1">Connection Error</h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
      <button onClick={fetchStats} className="btn-primary mx-auto">Retry</button>
    </div>
  );

  const totalApps = stats?.total_applications ?? 0;
  const submittedCount = stats?.submitted_count ?? 0;
  const examCount = stats?.upcoming_exams_count ?? 0;
  const rejectedCount = stats?.rejected_count ?? 0;

  // Donut chart — built from live status_distribution
  const categoryData = stats?.status_distribution?.length
    ? stats.status_distribution.map((s, i) => ({
        name: s.status,
        count: s.count,
        color: DONUT_COLORS[i % DONUT_COLORS.length],
      }))
    : [{ name: 'No data yet', count: 1, color: '#3f3f46' }];

  return (
    <div className="space-y-6">

      {/* ── Top Header Banner (Klinch Supercharged Style) ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-purple-500/20 bg-gradient-to-r from-purple-950/40 via-zinc-900/80 to-zinc-950 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Your job search, supercharged.
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Track applications, admit cards, and confirmed exam seat plans across all Bangladesh banks &amp; government portals.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setIsSeatPlanOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-purple-200" />
              <span>Exam Seat Plan</span>
            </button>
            <button
              onClick={onOpenNewApplication}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-zinc-300" />
              <span>+ Add Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4 Top KPI Cards (Sneat Pixel-Perfect Layout) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Application */}
        <div className="card p-4 sm:p-5 flex flex-col justify-between" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Applications</span>
            <button className="text-zinc-500 hover:text-zinc-300"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{totalApps}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12.67%
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">Total active job applications</p>
        </div>

        {/* Submitted */}
        <div className="card p-4 sm:p-5 flex flex-col justify-between" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Submitted</span>
            <button className="text-zinc-500 hover:text-zinc-300"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{submittedCount}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> -2.4%
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">Pipeline in submission review</p>
        </div>

        {/* Exam Confirmed */}
        <div className="card p-4 sm:p-5 flex flex-col justify-between" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Exam Confirmed</span>
            <button className="text-zinc-500 hover:text-zinc-300"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">{examCount}</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +12.67%
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">Nov 13 (Shamsul Hoque Khan)</p>
        </div>

        {/* Selected / Shortlisted */}
        <div className="card p-4 sm:p-5 flex flex-col justify-between" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400">Shortlisted / Viva</span>
            <button className="text-zinc-500 hover:text-zinc-300"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
          <div className="my-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">0</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700">
              0.0%
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">Upcoming viva voce stage</p>
        </div>
      </div>

      {/* ── Mid Section: Sneat 3-Column Visual Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Col 1 (5 cols): Applications Wavy Area Chart */}
        <div className="lg:col-span-5 card p-5 flex flex-col justify-between" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white">Applications Activity</h3>
              <p className="text-[11px] text-zinc-500">10 – 16 November</p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700 cursor-pointer">
              <span>10–16 Nov</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </div>
          </div>

          <div className="h-52 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ACTIVITY_TREND} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="sneatBlueWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                  itemStyle={{ color: '#a5b4fc' }}
                />
                <Area
                  type="natural"
                  dataKey="apps"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#sneatBlueWave)"
                  dot={{ r: 4, fill: '#818cf8', stroke: '#1e1b4b', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#c7d2fe' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            <span>Peak Application Velocity: <b>65 / day</b></span>
            <span className="text-purple-400 font-semibold cursor-pointer hover:underline" onClick={onNavigateToApplications}>View all</span>
          </div>
        </div>

        {/* Col 2 (4 cols): Multi-Colored Donut Chart */}
        <div className="lg:col-span-4 card p-5 flex flex-col justify-between" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-white">Applications Track</h3>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700">
              <span>Today</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </div>
          </div>

          <div className="relative flex items-center justify-center my-2">
            <div className="h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Center Total Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-white">{totalApps}</span>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Total</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-1.5 text-xs pt-1">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-zinc-300">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3 (3 cols): Application Resources / Stat Card */}
        <div className="lg:col-span-3 card p-5 flex flex-col justify-between" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">Application Resources</h3>
            <button className="text-zinc-500 hover:text-zinc-300"><MoreHorizontal className="w-4 h-4" /></button>
          </div>

          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={RESOURCE_LINE}>
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#818cf8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center my-2">
            <div className="text-3xl font-extrabold text-white">100%</div>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-[200px] mx-auto leading-tight">
              All applications verified with official circulars and notices.
            </p>
          </div>

          <button
            onClick={onNavigateToApplications}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-md mt-1"
          >
            Details
          </button>
        </div>
      </div>

      {/* ── Bottom Section: Schedule, Tasks & Current Vacancies (Sneat Bottom Rows) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* 1. Schedule (3 cols) */}
        <div className="lg:col-span-3 card p-5 flex flex-col justify-between" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Schedule</h3>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-800/80 px-2 py-0.5 rounded-lg border border-zinc-700">
              <span>Today</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Confirmed Exam — from seed */}
            <div className="p-3 rounded-xl bg-amber-400/90 text-zinc-950 font-medium space-y-1">
              <div className="flex items-center justify-between text-xs font-black">
                <span>MCQ Examination</span>
                <span className="text-[10px] font-mono">03:00 PM</span>
              </div>
              <p className="text-[11px] font-semibold text-zinc-900 leading-tight">
                Combined 9 Banks · Shamsul Hoque Khan School
              </p>
            </div>

            {/* Reporting Time */}
            <div className="p-3 rounded-xl bg-white text-zinc-950 font-medium space-y-1">
              <div className="flex items-center justify-between text-xs font-black">
                <span>Candidate Reporting</span>
                <span className="text-[10px] font-mono">02:00 PM</span>
              </div>
              <p className="text-[11px] font-semibold text-zinc-700 leading-tight">
                Admit Card &amp; NID Verification at Gate
              </p>
            </div>

            {/* Pending exams */}
            <div className="p-3 rounded-xl bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>5 Other Applications</span>
                <span className="text-[10px] text-zinc-400">TBD</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Admit cards not yet issued — monitor portals
              </p>
            </div>
          </div>
        </div>

        {/* 2. Tasks / Verification Progress (3 cols) */}
        <div className="lg:col-span-3 card p-5 flex flex-col justify-between" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Tasks &amp; Milestones</h3>
            <button onClick={onOpenNewApplication} className="p-1 rounded-lg bg-indigo-600/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Admit Card Verified', progress: '100%', sub: 'Combined 9 Banks #26101 — Roll 116683', done: true },
              { title: 'Seat Plan Allocated', progress: '100%', sub: 'Centre 3 · Shamsul Hoque Khan School', done: true },
              { title: 'Upload Admit Cards', progress: `${examCount > 0 ? 100 : 0}%`, sub: 'Upload PDF via Documents & Admit', done: examCount > 0 },
              { title: 'Monitor 5 Portals', progress: '0%', sub: 'Waiting for exam notices (26104–26109)', done: false },
            ].map((task) => (
              <div key={task.title} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{task.title}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{task.sub}</p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${task.done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'}`}>
                  {task.progress}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Targeted Positions — live from seed/backend */}
        <div className="lg:col-span-6 card p-5 flex flex-col justify-between" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Targeted Recruitment Positions ({String(totalApps).padStart(2, '0')})</h3>
              <p className="text-[11px] text-zinc-500">Government &amp; Scheduled Bank Openings</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 cursor-pointer hover:text-white" onClick={onNavigateToApplications}>See All</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(stats?.recent_activities?.length
              ? stats.recent_activities.slice(0, 4)
              : [
                  { id: 1, title: 'Senior Officer (General) @ Combined 9 Banks & 2 FIs', job_id: '26101', status: 'Exam Scheduled', date: '2026-11-13', action: '' },
                  { id: 2, title: 'Assistant Programmer @ Combined 8 Banks', job_id: '26106', status: 'Submitted', date: '', action: '' },
                  { id: 3, title: 'Asst. Database Admin @ Sonali Bank PLC', job_id: '26109', status: 'Submitted', date: '', action: '' },
                  { id: 4, title: 'Officer IT/MIS @ Combined 10 Banks', job_id: '26105', status: 'Submitted', date: '', action: '' },
                ]
            ).map((vac) => {
              const [postPart, orgPart] = (vac.title || '').split('@');
              const statusColor = vac.status === 'Exam Scheduled' ? '#f59e0b' : vac.status === 'Shortlisted' ? '#10b981' : '#3b82f6';
              return (
                <div key={vac.id} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 transition-colors flex flex-col justify-between space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-white truncate">{postPart?.trim()}</p>
                      <p className="text-[10px] text-zinc-400 truncate mt-0.5">{orgPart?.trim()}</p>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-purple-300">
                      #{vac.job_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[10px]">
                    <span className="font-semibold" style={{ color: statusColor }}>{vac.status}</span>
                    <button onClick={onNavigateToApplications} className="text-zinc-500 hover:text-white flex items-center gap-0.5">
                      View <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SeatPlanModal isOpen={isSeatPlanOpen} onClose={() => setIsSeatPlanOpen(false)} defaultRoll={116683} />
    </div>
  );
};
