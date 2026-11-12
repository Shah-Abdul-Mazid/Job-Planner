import React, { useState, useEffect } from 'react';
import {
  Search, Plus, Eye, Edit2, Trash2, Building,
  FileCheck2, ChevronLeft, ChevronRight,
  LayoutGrid, Table as TableIcon, Filter, MoreHorizontal,
  Calendar, Clock, MapPin, FileSpreadsheet, CheckCircle2,
} from 'lucide-react';
import { StatusBadge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { ApplicationDetailModal } from '../components/applications/ApplicationDetailModal';
import { SeatPlanModal } from '../components/examinations/SeatPlanModal';
import { api, FilterParams } from '../services/api';
import { JobApplication, ApplicationCreatePayload } from '../types';

interface ApplicationsPageProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

const BOARD_COLUMNS = [
  { key: 'Submitted',            label: 'Submitted',         emoji: '📝', accent: '#3b82f6' },
  { key: 'Admit Card Available', label: 'Admit Card',         emoji: '✅', accent: '#10b981' },
  { key: 'Exam Scheduled',       label: 'Exam Scheduled',    emoji: '📅', accent: '#f59e0b' },
  { key: 'Written Examination',  label: 'Written Exam',      emoji: '✍️',  accent: '#8b5cf6' },
  { key: 'Viva',                 label: 'Viva Voce',         emoji: '🎤', accent: '#06b6d4' },
  { key: 'Selected',             label: 'Selected',          emoji: '🏆', accent: '#10b981' },
  { key: 'Rejected',             label: 'Rejected',          emoji: '❌', accent: '#ef4444' },
];

const STATUS_FILTERS = [
  'All', 'Submitted', 'Admit Card Available', 'Exam Scheduled',
  'Shortlisted', 'Written Examination', 'Viva', 'Selected', 'Rejected',
];

export const Applications: React.FC<ApplicationsPageProps> = ({
  isCreateModalOpen, setIsCreateModalOpen,
}) => {
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [orgFilter, setOrgFilter] = useState('All');
  const [orgOptions, setOrgOptions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteConfirmApp, setDeleteConfirmApp] = useState<JobApplication | null>(null);
  const [isSeatPlanOpen, setIsSeatPlanOpen] = useState(false);
  const [seatPlanRoll, setSeatPlanRoll] = useState<number>(116683);

  const fetchApplications = async () => {
    try {
      setLoading(true); setError(null);
      const params: FilterParams = {
        search: search.trim() || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        organization: orgFilter !== 'All' ? orgFilter : undefined,
        page, page_size: pageSize,
      };
      const res = await api.getApplications(params);
      setApplications(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally { setLoading(false); }
  };

  const fetchOrganizations = async () => {
    try { const orgs = await api.getOrganizations(); setOrgOptions(orgs); } catch {}
  };

  useEffect(() => { fetchOrganizations(); }, []);
  useEffect(() => { fetchApplications(); }, [search, statusFilter, orgFilter, page]);

  useEffect(() => {
    const handleCreated = () => {
      fetchApplications();
      fetchOrganizations();
    };
    window.addEventListener('application-created', handleCreated);
    return () => window.removeEventListener('application-created', handleCreated);
  }, []);

  const handleCreate = async (payload: ApplicationCreatePayload) => {
    await api.createApplication(payload); fetchApplications(); fetchOrganizations();
  };
  const handleEdit = async (payload: ApplicationCreatePayload) => {
    if (!selectedApp) return;
    await api.updateApplication(selectedApp.id, payload); fetchApplications();
  };
  const handleDelete = async () => {
    if (!deleteConfirmApp) return;
    try { await api.deleteApplication(deleteConfirmApp.id); setDeleteConfirmApp(null); fetchApplications(); }
    catch (err: any) { alert(`Delete failed: ${err.message}`); }
  };

  const handleQuickStatusChange = async (appId: number, newStatus: string) => {
    try {
      await api.updateApplication(appId, { status: newStatus });
      fetchApplications();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  // Top KPI summary counts
  const counts = BOARD_COLUMNS.reduce((acc, col) => {
    acc[col.key] = applications.filter(a =>
      col.key === 'Submitted' ? (a.status === 'Submitted' || a.status === 'Applied') : a.status === col.key
    ).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">

      {/* ── Page Header (My Board style) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">My Board</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Bangladesh bank &amp; government recruitment pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center rounded-xl p-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {(['board', 'table'] as const).map((mode) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all`}
                style={viewMode === mode ? {
                  background: '#7c3aed', color: '#fff',
                } : { color: 'var(--text-muted)' }}>
                {mode === 'board' ? <LayoutGrid className="w-3.5 h-3.5" /> : <TableIcon className="w-3.5 h-3.5" />}
                {mode === 'board' ? 'Board' : 'Table'}
              </button>
            ))}
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </div>
      </div>

      {/* ── Upcoming Confirmed Exam Callout Banner ── */}
      {(() => {
        const examApp = applications.find(
          a => a.status === 'Exam Scheduled' || (a.examinations && a.examinations.length > 0)
        );
        if (!examApp) return null;
        return (
          <div className="p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-transparent flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 uppercase tracking-wider">
                    TOMORROW (NOV 13)
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed MCQ Exam
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  {examApp.organization_name} — {examApp.post_name} (Job #{examApp.job_id})
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>🕒 Friday, Nov 13, 2026 · 03:00 PM – 04:00 PM</span>
                  <span>📍 Shamsul Hoque Khan School &amp; College, Jatrabari</span>
                  <span className="font-mono text-purple-300">Roll: {examApp.roll_number || '116683'}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSeatPlanRoll(examApp.roll_number ? parseInt(examApp.roll_number) : 116683);
                  setIsSeatPlanOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                View 31 Centers Seat Plan
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedApp(examApp);
                  setIsDetailOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
              >
                Exam Details
              </button>
            </div>
          </div>
        );
      })()}

      {/* ── Status KPI Bar (My Board top counters) ── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Total', value: total, key: 'All', color: '#9492a8', bg: 'rgba(148,146,168,0.12)' },
          { label: 'Submitted', value: counts['Submitted'] || 0, key: 'Submitted', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
          { label: 'Admit Card', value: counts['Admit Card Available'] || 0, key: 'Admit Card Available', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
          { label: 'Exam', value: counts['Exam Scheduled'] || 0, key: 'Exam Scheduled', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
          { label: 'Viva', value: counts['Viva'] || 0, key: 'Viva', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
          { label: 'Selected', value: counts['Selected'] || 0, key: 'Selected', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
        ].map((s) => {
          const isActive = statusFilter === s.key || (s.key === 'All' && statusFilter === 'All');
          return (
            <div key={s.label}
              onClick={() => {
                setStatusFilter(statusFilter === s.key ? 'All' : s.key);
                setPage(1);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: s.bg,
                border: isActive && s.key !== 'All' ? `2px solid ${s.color}` : `1px solid ${s.color}22`,
                minWidth: '90px'
              }}
              title={`Click to filter by ${s.label}`}
            >
              <div>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search bank, post, Job ID, roll number..."
            className="input-dark pl-9 w-full" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-dark py-2 text-sm pr-8"
            style={{ minWidth: '160px', appearance: 'none', paddingRight: '2rem', cursor: 'pointer' }}>
            {STATUS_FILTERS.map((s) => <option key={s} value={s}>Stage: {s}</option>)}
          </select>

          {orgOptions.length > 0 && (
            <select value={orgFilter} onChange={(e) => { setOrgFilter(e.target.value); setPage(1); }}
              className="input-dark py-2 text-sm"
              style={{ maxWidth: '160px', appearance: 'none', cursor: 'pointer' }}>
              <option value="All">Org: All</option>
              {orgOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <LoadingState message="Loading applications pipeline..." />
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-sm mb-3" style={{ color: '#f87171' }}>{error}</p>
          <button onClick={fetchApplications} className="btn-primary mx-auto">Retry</button>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications found"
          description="No recruitment records match your search or filters."
          actionText="Add First Application"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : viewMode === 'board' ? (

        /* ── KANBAN BOARD (My Board style) ── */
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1">
          {BOARD_COLUMNS.map((col) => {
            const colApps = applications.filter((a) =>
              col.key === 'Submitted'
                ? (a.status === 'Submitted' || a.status === 'Applied')
                : a.status === col.key
            );
            return (
              <div key={col.key} className="w-72 flex-shrink-0 flex flex-col max-h-[calc(100vh-280px)]">
                {/* Column header */}
                <div className="flex items-center justify-between px-1 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 rounded-full flex-shrink-0"
                      style={{ background: col.accent }} />
                    <span className="text-sm font-bold text-white">{col.label}</span>
                    <span className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center"
                      style={{ background: `${col.accent}25`, color: col.accent }}>
                      {colApps.length}
                    </span>
                  </div>
                  <button className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text-muted)' }}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto space-y-3 kanban-col pr-1">
                  {colApps.map((app) => (
                    <div key={app.id}
                      onClick={() => { setSelectedApp(app); setIsDetailOpen(true); }}
                      className="card card-hover p-4 space-y-3"
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(124,58,237,0.15)' }}>
                          <Building className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{app.organization_name}</p>
                          <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                            Job #{app.job_id}
                          </p>
                        </div>
                        <div onClick={(e) => e.stopPropagation()} className="flex gap-1 flex-shrink-0">
                          <button onClick={() => { setSelectedApp(app); setIsEditOpen(true); }}
                            className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                            style={{ color: 'var(--text-muted)' }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteConfirmApp(app)}
                            className="p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                            style={{ color: 'var(--text-muted)' }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Post name */}
                      <p className="text-sm font-semibold text-white leading-snug">
                        {app.post_name}
                        {app.grade && <span className="ml-1.5 text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>({app.grade})</span>}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="badge-purple">#{app.job_id}</span>
                        {app.admit_card_available && <span className="badge-green">✓ Admit Ready</span>}
                        {app.roll_number && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                            style={{ background: 'var(--bg-base)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                            Roll: {app.roll_number}
                          </span>
                        )}
                      </div>

                      {/* Scheduled Exam Callout Banner — rendered if the app has confirmed exam data */}
                      {app.examinations && app.examinations.length > 0 && (
                        <div className="p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 space-y-1.5"
                          onClick={(e) => { e.stopPropagation(); setSelectedApp(app); setIsDetailOpen(true); }}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {app.examinations[0].exam_type || 'MCQ'} Exam
                            </span>
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 border border-amber-500/40">
                              {app.examinations[0].schedule_status === 'confirmed' ? 'Confirmed' : 'Scheduled'}
                            </span>
                          </div>
                          
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {app.examinations[0].exam_date ? new Date(app.examinations[0].exam_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA'}
                            </span>
                            {app.examinations[0].start_time && (
                              <>
                                <span className="text-zinc-500">·</span>
                                <span className="text-amber-300">
                                  {app.examinations[0].start_time}{app.examinations[0].end_time ? ` – ${app.examinations[0].end_time}` : ''}
                                </span>
                              </>
                            )}
                          </p>

                          {app.examinations[0].center_name && (
                            <p className="text-[11px] text-zinc-300 truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                              <span>{app.examinations[0].center_name}</span>
                            </p>
                          )}

                          <div className="pt-1 flex items-center justify-between border-t border-amber-500/20">
                            <span className="text-[10px] font-mono font-semibold text-emerald-400">
                              Roll: {app.roll_number || 'Awaiting'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSeatPlanRoll(app.roll_number ? parseInt(app.roll_number) : 116683);
                                setIsSeatPlanOpen(true);
                              }}
                              className="text-[10px] font-bold text-amber-300 hover:text-white px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 transition-colors flex items-center gap-1"
                            >
                              <FileSpreadsheet className="w-3 h-3" />
                              Seat Plan
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 gap-2"
                        style={{ borderTop: '1px solid var(--border)' }}>
                        <span className="text-[11px] flex items-center gap-1 truncate" style={{ color: 'var(--text-muted)' }}>
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          {app.deadline ? `Due: ${app.deadline}` : 'No deadline'}
                        </span>
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                          <select
                            value={app.status}
                            onChange={(e) => handleQuickStatusChange(app.id, e.target.value)}
                            className="text-[10px] font-bold py-1 px-1.5 rounded-lg cursor-pointer bg-zinc-800 border border-zinc-700 text-zinc-200 hover:border-purple-500 focus:outline-none transition-colors"
                            title="Quick Stage Switcher"
                          >
                            {STATUS_FILTERS.filter(s => s !== 'All').map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed p-8 text-center"
                      style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No applications</p>
                      <button onClick={() => setIsCreateModalOpen(true)}
                        className="text-xs mt-2 font-semibold transition-colors hover:text-purple-300"
                        style={{ color: '#7c3aed' }}>
                        + Add application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      ) : (
        /* ── TABLE VIEW ── */
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider"
                  style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  {['Organization & Post', 'Job ID', 'Roll & Tracking', 'Status', 'Admit Card', 'Timeline', 'Actions'].map(h => (
                    <th key={h} className={`py-3.5 px-4 ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {applications.map((app) => (
                  <tr key={app.id}
                    className="group cursor-pointer transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => { setSelectedApp(app); setIsDetailOpen(true); }}>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {app.post_name}
                      </div>
                      <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <Building className="w-3 h-3" />
                        {app.organization_name}
                        {app.grade && <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>{app.grade}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold" style={{ color: '#a78bfa' }}>#{app.job_id}</td>
                    <td className="py-3.5 px-4 font-mono text-xs">
                      <div className="font-bold text-white">{app.roll_number || 'Pending'}</div>
                      <div className="truncate max-w-[130px]" style={{ color: 'var(--text-muted)' }}>
                        {app.tracking_id || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><StatusBadge status={app.status} /></td>
                    <td className="py-3.5 px-4">
                      {app.admit_card_available
                        ? <span className="badge-green flex items-center gap-1 w-fit"><FileCheck2 className="w-3 h-3" />Available</span>
                        : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Pending</span>
                      }
                    </td>
                    <td className="py-3.5 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <div>Applied: {app.application_date || 'N/A'}</div>
                      {app.deadline && <div>Due: {app.deadline}</div>}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {[
                          { icon: Eye, onClick: () => { setSelectedApp(app); setIsDetailOpen(true); }, title: 'View' },
                          { icon: Edit2, onClick: () => { setSelectedApp(app); setIsEditOpen(true); }, title: 'Edit' },
                          { icon: Trash2, onClick: () => setDeleteConfirmApp(app), title: 'Delete' },
                        ].map((btn) => {
                          const BIcon = btn.icon;
                          return (
                            <button key={btn.title} onClick={btn.onClick} title={btn.title}
                              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                              style={{ color: 'var(--text-muted)' }}>
                              <BIcon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 flex items-center justify-between text-xs"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <span>Showing <b className="text-white">{applications.length}</b> of <b className="text-white">{total}</b></span>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page <b className="text-white">{page}</b> of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <ApplicationModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate} mode="create" />
      <ApplicationModal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setSelectedApp(null); }}
        onSubmit={handleEdit} initialData={selectedApp} mode="edit" />
      <ApplicationDetailModal application={selectedApp} isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedApp(null); }}
        onEdit={(app) => { setSelectedApp(app); setIsEditOpen(true); }} />
      <SeatPlanModal isOpen={isSeatPlanOpen} onClose={() => setIsSeatPlanOpen(false)}
        defaultRoll={seatPlanRoll} />

      {/* ── Delete confirm ── */}
      {deleteConfirmApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="card max-w-sm w-full p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">Delete Application?</h4>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete <b className="text-white">{deleteConfirmApp.post_name}</b> (Job #{deleteConfirmApp.job_id})?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirmApp(null)} className="btn-ghost">Cancel</button>
              <button onClick={handleDelete}
                className="btn-primary"
                style={{ background: '#ef4444' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
