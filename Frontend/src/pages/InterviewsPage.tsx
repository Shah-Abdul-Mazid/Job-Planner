import React, { useState } from 'react';
import { 
  Users, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, 
  ChevronRight, Award, FileText, Sparkles, Plus, ExternalLink
} from 'lucide-react';

interface Interview {
  id: string;
  title: string;
  stage: 'MCQ Preliminary' | 'Written Examination' | 'Viva Voce / Oral' | 'Practical / Coding';
  organization: string;
  jobId: string;
  date: string;
  time: string;
  venue: string;
  status: 'Confirmed' | 'Awaiting Notice' | 'Completed';
  rollNumber?: string;
  totalMarks?: number;
  notes?: string;
}

const INTERVIEWS_DATA: Interview[] = [
  {
    id: 'int-1',
    title: 'Senior Officer (General) Preliminary MCQ Exam',
    stage: 'MCQ Preliminary',
    organization: 'Combined 9 Banks & 2 FIs',
    jobId: '26101',
    date: 'Fri, Nov 13, 2026',
    time: '03:00 PM – 04:00 PM (Report by 02:00 PM)',
    venue: 'Shamsul Hoque Khan School & College, Matuail, Demra Road, Jatrabari, Dhaka',
    status: 'Confirmed',
    rollNumber: '116683',
    totalMarks: 100,
    notes: 'Official BSCS Notice 348/2026 verified. Centre 3 (Roll range 112001 – 118000).'
  },
  {
    id: 'int-2',
    title: 'Assistant Programmer (Grade-9) Examination',
    stage: 'Written Examination',
    organization: 'Combined 8 Banks',
    jobId: '26106',
    date: 'To Be Announced',
    time: 'TBA',
    venue: 'Dhaka City Centers (Will be published by BSCS)',
    status: 'Awaiting Notice',
    totalMarks: 200,
    notes: 'Technical MCQ & Written syllabus covering CSE algorithms, database & networking.'
  },
  {
    id: 'int-3',
    title: 'Assistant Manager (CSE/IT) Preliminary',
    stage: 'MCQ Preliminary',
    organization: 'Bangladesh Oil, Gas and Mineral Corporation (Petrobangla)',
    jobId: 'K24GPCTA',
    date: 'To Be Announced',
    time: 'TBA',
    venue: 'Teletalk Scheduled Center, Dhaka',
    status: 'Awaiting Notice',
    totalMarks: 100,
    notes: 'Ref: 28.02.0000.000.011.26.0027.26.453. SMS alert will be received on 01531329222.'
  },
  {
    id: 'int-4',
    title: 'Assistant Network Engineer (Non-Cadre) Screening',
    stage: 'MCQ Preliminary',
    organization: 'Bangladesh Public Service Commission (BPSC)',
    jobId: 'BPSC-702',
    date: 'To Be Announced',
    time: 'TBA',
    venue: 'BPSC Examination Hall, Agargaon, Dhaka',
    status: 'Awaiting Notice',
    totalMarks: 100,
    notes: 'Preliminary screening exam followed by written and viva voce.'
  },
  {
    id: 'int-5',
    title: 'Assistant Programmer Selection Exam',
    stage: 'Written Examination',
    organization: 'Bangladesh Hi-Tech Park Authority (BHTPA)',
    jobId: 'XLKMNFTA',
    date: 'To Be Announced',
    time: 'TBA',
    venue: 'ICT Division Examination Venue',
    status: 'Awaiting Notice',
    totalMarks: 100,
    notes: 'Ref: 56.02.0000.003.11.0004.26-150. Application submitted.'
  }
];

export const InterviewsPage: React.FC = () => {
  const [filter, setFilter] = useState<'All' | 'Confirmed' | 'Awaiting Notice'>('All');

  const filtered = INTERVIEWS_DATA.filter((i) => {
    if (filter === 'All') return true;
    return i.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Interviews &amp; Examination Pipeline
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Track Preliminary MCQ, Written examinations, Practical coding tests, and Viva Voce schedules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
            1 Confirmed Exam This Week
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
        {(['All', 'Confirmed', 'Awaiting Notice'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="card p-5 sm:p-6 transition-all border hover:border-purple-500/40"
            style={{
              background: item.status === 'Confirmed' ? 'rgba(245, 158, 11, 0.04)' : '#121217',
              borderColor: item.status === 'Confirmed' ? 'rgba(245, 158, 11, 0.3)' : '#1f1f28'
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    item.status === 'Confirmed'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-purple-400">
                    #{item.jobId}
                  </span>
                  <span className="text-xs text-zinc-400">
                    · {item.organization}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">
                  {item.title}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                    <span>{item.time}</span>
                  </div>
                  {item.rollNumber && (
                    <div className="flex items-center gap-2 text-emerald-400 font-mono font-semibold">
                      <Award className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Roll: {item.rollNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 text-xs text-zinc-400 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{item.venue}</span>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/80">
                    {item.notes}
                  </p>
                )}
              </div>

              <div className="flex lg:flex-col items-center lg:items-end gap-2 flex-shrink-0">
                <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-medium">
                  {item.stage}
                </span>
                {item.totalMarks && (
                  <span className="text-[11px] text-zinc-500">
                    Full Marks: {item.totalMarks}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
