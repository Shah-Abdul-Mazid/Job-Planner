import React from 'react';
import { Modal } from '../ui/Modal';
import { Bell, Calendar, Clock, CheckCircle } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notification Center"
      description="Real-time alerts for Bangladesh Bank & combined bank exam schedules"
      maxWidth="max-w-md"
    >
      <div className="space-y-3">
        <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/70">
          <div className="flex items-center space-x-2 text-amber-800 font-semibold text-xs">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>EXAM_UPCOMING: Bangladesh Bank Senior Officer</span>
          </div>
          <p className="text-xs text-amber-900 mt-1">
            MCQ examination scheduled in 3 days at Government Bangla College, Mirpur-1, Dhaka. Reporting time: 09:15 AM.
          </p>
          <span className="text-[10px] text-amber-600 mt-2 block">
            Notice Ref: BB/HRD/BSCS/2026/Notice-048
          </span>
        </div>

        <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/70">
          <div className="flex items-center space-x-2 text-blue-800 font-semibold text-xs">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>DEADLINE_APPROACHING: Combined Banks Officer (IT)</span>
          </div>
          <p className="text-xs text-blue-900 mt-1">
            Application submission window for Job ID: 26105 closes in 5 days. Ensure BSCS bank choice preferences are confirmed.
          </p>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Close Notifications
          </button>
        </div>
      </div>
    </Modal>
  );
};
