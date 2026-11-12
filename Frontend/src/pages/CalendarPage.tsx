import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, FileSpreadsheet,
  Clock, MapPin, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { SeatPlanModal } from '../components/examinations/SeatPlanModal';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_IN_NOV = Array.from({ length: 30 }, (_, i) => i + 1);
const START_OFFSET = 6; // Nov 1 2026 = Sunday → 6 blanks in Mon-first grid

export const CalendarPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(13);
  const [isSeatPlanOpen, setIsSeatPlanOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Recruitment Calendar</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Preliminary MCQ, Written, Practical &amp; Viva Examination Timeline (Asia/Dhaka)
          </p>
        </div>
        <button onClick={() => setIsSeatPlanOpen(true)} className="btn-primary text-sm">
          <FileSpreadsheet className="w-4 h-4" />
          View 31 Centers Seat Plan
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Calendar Card ── */}
        <div className="lg:col-span-2 card p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6 pb-4"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="text-base font-bold text-white">November 2026</h3>
            <div className="flex items-center gap-1.5">
              {[ChevronLeft, ChevronRight].map((Icon, i) => (
                <button key={i}
                  className="p-2 rounded-lg transition-colors hover:bg-white/5"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
            {DAYS_OF_WEEK.map(d => (
              <span key={d} className="text-[11px] font-bold uppercase tracking-wider py-1"
                style={{ color: 'var(--text-muted)' }}>{d}</span>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: START_OFFSET }).map((_, i) => (
              <div key={`blank-${i}`} className="h-14 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)' }} />
            ))}

            {DAYS_IN_NOV.map((day) => {
              const isExam = day === 13;
              const isDeadline = day === 17;
              const isSelected = selectedDay === day;
              const isToday = false;

              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  className="h-14 rounded-xl p-2 flex flex-col justify-between transition-all text-left relative"
                  style={
                    isExam ? {
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      border: '2px solid #fbbf24',
                      boxShadow: '0 0 20px rgba(245,158,11,0.3)',
                    } : isSelected ? {
                      background: 'rgba(124,58,237,0.2)',
                      border: '1px solid rgba(124,58,237,0.5)',
                    } : {
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                    }
                  }
                >
                  <span className={`text-xs font-semibold ${
                    isExam ? 'text-white' : isSelected ? 'text-purple-300' : ''
                  }`} style={!isExam && !isSelected ? { color: 'var(--text-secondary)' } : {}}>
                    {day}
                  </span>

                  {isExam && (
                    <div>
                      <span className="w-1.5 h-1.5 rounded-full bg-white block mb-0.5" />
                      <span className="text-[9px] font-extrabold text-white leading-none">9-Bank MCQ</span>
                    </div>
                  )}

                  {isDeadline && !isExam && (
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#3b82f6' }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-5 pt-4"
            style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { color: '#f59e0b', label: 'MCQ Examination (Confirmed)' },
              { color: '#8b5cf6', label: 'Written Examination' },
              { color: '#3b82f6', label: 'Application Deadline' },
              { color: '#10b981', label: 'Viva Voce' },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: 'var(--text-secondary)' }}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right Sidebar ── */}
        <div className="space-y-4">

          {/* Summary stats */}
          <div className="card p-5">
            <p className="label-sm mb-4">Summary</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { val: '1', label: 'Exams', color: 'var(--text-primary)' },
                { val: '1', label: 'Tomorrow', color: '#fbbf24' },
                { val: '46', label: 'Week', color: '#a78bfa' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                  <span className="text-xl font-bold block" style={{ color: s.color }}>{s.val}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="card p-5 space-y-4">
            <p className="label-sm">Upcoming Recruitment Events</p>

            {/* Event 1 — Tomorrow exam */}
            <div className="rounded-xl p-4 space-y-3"
              style={{
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.25)',
              }}>
              <div className="flex items-center justify-between">
                <span className="badge-red text-[10px]">TOMORROW</span>
                <span className="text-[11px] font-semibold flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Notice
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">
                Combined 9 Banks &amp; 2 FIs — Senior Officer (Job ID: 26101)
              </h4>
              <p className="text-[11px] font-semibold text-purple-300">
                903 Vacancies (BSCS Notice No. 348/2026)
              </p>

              <div className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  Fri, Nov 13, 2026 · 03:00 PM – 04:00 PM
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  Shamsul Hoque Khan School &amp; College, Jatrabari
                </p>
                <p className="font-mono font-bold text-purple-400 pl-5">
                  Roll: 116683 (Range: 112001 – 118000)
                </p>
              </div>

              <button onClick={() => setIsSeatPlanOpen(true)}
                className="w-full py-2 rounded-xl text-xs font-bold text-white transition-colors"
                style={{ background: '#10b981' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#059669')}
                onMouseLeave={e => (e.currentTarget.style.background = '#10b981')}>
                View Seat Plan
              </button>
            </div>

            {/* Event 2 — Deadline */}
            <div className="rounded-xl p-3.5 space-y-1.5"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
              <span className="badge-blue text-[10px]">Deadline</span>
              <h5 className="text-xs font-bold text-white">
                Officer (IT) / MIS (Job ID: 26105)
              </h5>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Nov 17, 2026 · Bankers' Selection Committee Secretariat (BSCS)
              </p>
            </div>

            {/* Stages */}
            <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="label-sm mb-3">Senior Officer Exam Stages</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>1. MCQ Examination (Nov 13, 2026)</span>
                </div>
                {[
                  '2. Written Examination (Awaiting Result)',
                  '3. Viva Voce Examination',
                  '4. Final Selection & Police Verification',
                ].map((step) => (
                  <div key={step} className="flex items-center gap-2 pl-5"
                    style={{ color: 'var(--text-muted)' }}>
                    <ArrowRight className="w-3 h-3 flex-shrink-0" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SeatPlanModal isOpen={isSeatPlanOpen} onClose={() => setIsSeatPlanOpen(false)} defaultRoll={116683} />
    </div>
  );
};
