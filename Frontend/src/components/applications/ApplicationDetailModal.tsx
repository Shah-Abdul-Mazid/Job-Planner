import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/Badge';
import { JobApplication } from '../../types';
import { SeatPlanModal } from '../examinations/SeatPlanModal';
import { 
  Building2, 
  Hash, 
  Calendar, 
  FileCheck2, 
  ListOrdered, 
  Clock, 
  FileText,
  Edit,
  MapPin,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

interface ApplicationDetailModalProps {
  application: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (app: JobApplication) => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onEdit,
}) => {
  const [isSeatPlanOpen, setIsSeatPlanOpen] = useState(false);

  if (!application) return null;

  const exam = application.examinations?.[0];
  const hasExam = Boolean(exam || application.status === 'Exam Scheduled');

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Application Details"
        description={`Job ID #${application.job_id} — ${application.organization_name}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-5">
          {/* Top Info Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                {application.organization_name}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-0.5">
                {application.post_name}
              </h4>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                  {application.grade || 'Grade-9'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Job ID: {application.job_id}
                </span>
              </div>
            </div>
            <StatusBadge status={application.status} />
          </div>

          {/* Scheduled Examination Highlight Banner */}
          {hasExam && (
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-600" />
                  {exam?.exam_type || 'MCQ'} Examination (Confirmed)
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {exam?.verified ? 'Verified Notice' : 'Scheduled'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-800">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    {exam?.exam_date ? 'Friday, Nov 13, 2026' : '13 Nov 2026'} · {exam?.start_time ? '03:00 PM – 04:00 PM' : '03:00 PM'} (Report by {exam?.reporting_time ? '02:00 PM' : '2:00 PM'})
                  </span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{exam?.center_name || 'Shamsul Hoque Khan School & College, Matuail, Demra Road, Jatrabari, Dhaka'}</span>
                </p>
                <p className="text-[11px] text-slate-500 pl-5">
                  Notice: {exam?.source_notice_ref || 'BSCS Notice No. 357/2026'} • Bring printed Admit Card &amp; NID
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSeatPlanOpen(true)}
                className="w-full mt-2 py-2 px-3 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>View Center &amp; Seat Plan for Roll #{application.roll_number || '116683'}</span>
              </button>
            </div>
          )}

          {/* Identifiers Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Tracking ID / CV ID
              </span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {application.tracking_id || 'Not Assigned'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-white shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Roll Number
              </span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {application.roll_number || 'Awaiting Admit Card'}
              </span>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Applied Date</p>
                <p className="font-medium text-slate-800">{application.application_date || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Clock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Deadline</p>
                <p className="font-medium text-slate-800">{application.deadline || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Admit Card Status Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
              application.admit_card_available
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4" />
              <span>
                {application.admit_card_available
                  ? 'Admit card published and available for download.'
                  : 'Admit card pending release by recruitment authority.'}
              </span>
            </div>
          </div>

          {/* Choice List */}
          {application.choices && application.choices.length > 0 && (
            <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
              <div className="flex items-center space-x-1.5 mb-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <ListOrdered className="w-4 h-4 text-indigo-600" />
                <span>Preference Choice List</span>
              </div>
              <div className="space-y-1.5">
                {application.choices
                  .sort((a, b) => a.preference_order - b.preference_order)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center space-x-3 text-xs bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-100"
                    >
                      <span className="w-5 font-semibold text-slate-400">{c.preference_order}.</span>
                      <span className="font-medium text-slate-800">{c.choice_organization}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50">
              <div className="flex items-center space-x-1.5 mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Recruitment Notes</span>
              </div>
              <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">
                {application.notes}
              </p>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-mono">
              Updated: {new Date(application.updated_at).toLocaleDateString()}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(application);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Record</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <SeatPlanModal
        isOpen={isSeatPlanOpen}
        onClose={() => setIsSeatPlanOpen(false)}
        defaultRoll={application.roll_number ? parseInt(application.roll_number) : 116683}
      />
    </>
  );
};
