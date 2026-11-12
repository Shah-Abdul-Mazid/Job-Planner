import React, { useState } from 'react';
import { Calendar, FileText, Bot, Clock, MapPin, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { SeatPlanModal } from '../components/examinations/SeatPlanModal';

export const CalendarPreview: React.FC<{ onNavigateToApps: () => void }> = ({ onNavigateToApps }) => {
  const [isSeatPlanOpen, setIsSeatPlanOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recruitment Examination Calendar & Timeline
              </h3>
              <p className="text-xs text-slate-500">
                Multi-stage exam tracker: MCQ Preliminary, Written Exam, Practical, Viva Voce.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSeatPlanOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>View All 31 Centers Seat Plan</span>
          </button>
        </div>

        {/* Live Seeded Exam Card (Senior Officer Verified Center) */}
        <div className="mt-4 p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-indigo-100 text-indigo-700">
                MCQ Preliminary Examination
              </span>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                TOMORROW (FRIDAY)
              </span>
            </div>
            <span className="text-xs text-emerald-700 font-semibold flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
              Verified via Notice No: 357/2026
            </span>
          </div>

          <h4 className="text-base font-bold text-slate-900 mt-3">
            Bangladesh Bank & 09 Combined Banks — Senior Officer (General) (Job ID: 26101)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs text-slate-700">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase text-[10px] mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Exam Schedule</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">13 Nov 2026 (Friday)</p>
              <p className="text-xs text-slate-600">03:00 PM – 04:00 PM</p>
              <p className="text-[11px] text-rose-600 font-medium mt-1">Reporting: by 02:00 PM</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase text-[10px] mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Your Center (Center #3)</span>
              </div>
              <p className="font-bold text-slate-900 text-sm">Shamsul Hoque Khan School & College</p>
              <p className="text-xs text-slate-600">School Campus, Matuail, Demra, Jatrabari, Dhaka</p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-1.5 text-slate-400 font-bold uppercase text-[10px] mb-1">
                <span>Roll Allocation</span>
              </div>
              <p className="font-bold font-mono text-indigo-700 text-sm">Your Roll: 116683</p>
              <p className="text-xs text-slate-600 font-mono">Center Range: 111828 – 121329</p>
              <p className="text-[11px] text-slate-400 mt-1">Total Center Capacity: 8,300</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl border border-dashed border-slate-300 text-center">
          <p className="text-xs text-slate-500">
            Full calendar month view, Google Calendar sync, and SMS reminders will expand in <span className="font-semibold text-indigo-600">Phase 2</span>.
          </p>
          <button
            onClick={onNavigateToApps}
            className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
          >
            ← Return to Application Management
          </button>
        </div>
      </div>

      <SeatPlanModal
        isOpen={isSeatPlanOpen}
        onClose={() => setIsSeatPlanOpen(false)}
        defaultRoll={116683}
      />
    </div>
  );
};

export const DocumentsPreview: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center space-y-4">
      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
        <FileText className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">
          Document Intelligence & Admit Card Parsing
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Scheduled for <span className="font-semibold text-indigo-600">Phase 3</span>. Will extract Job ID, Post Name, and Roll number from Bangladesh Bank and BPSC PDFs with deterministic rule verification.
        </p>
      </div>
    </div>
  );
};

export const AssistantPreview: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs text-center space-y-4">
      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto">
        <Bot className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-slate-900">
          AI Career Assistant & Preparation Planner
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Scheduled for <span className="font-semibold text-purple-600">Phase 4</span>. Will answer questions like "What exams do I have this month?" and generate customized preparation syllabi.
        </p>
      </div>
    </div>
  );
};
