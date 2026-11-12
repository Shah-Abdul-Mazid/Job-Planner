import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { JobApplication, ApplicationCreatePayload, ApplicationStatus } from '../../types';
import { Plus, Trash2, Building, AlertCircle } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApplicationCreatePayload) => Promise<void>;
  initialData?: JobApplication | null;
  mode: 'create' | 'edit';
}

const COMMON_ORGS = [
  'Bangladesh Bank',
  'Sonali Bank PLC',
  'Janata Bank PLC',
  'Agrani Bank PLC',
  'Rupali Bank PLC',
  "Bankers' Selection Committee Secretariat (BSCS)",
  'Bangladesh Public Service Commission (BPSC)',
  'Bangladesh Hi-Tech Park Authority (BHTPA)'
];

const STATUS_OPTIONS: ApplicationStatus[] = [
  'Draft',
  'Applied',
  'Submitted',
  'Admit Card Available',
  'Exam Scheduled',
  'Shortlisted',
  'Written Examination',
  'Viva',
  'Selected',
  'Rejected',
  'Waiting List',
];

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}) => {
  const [orgName, setOrgName] = useState('');
  const [postName, setPostName] = useState('');
  const [jobId, setJobId] = useState('');
  const [grade, setGrade] = useState('Grade-9');
  const [trackingId, setTrackingId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [appDate, setAppDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Submitted');
  const [admitCardAvailable, setAdmitCardAvailable] = useState(false);
  const [notes, setNotes] = useState('');
  const [choices, setChoices] = useState<string[]>([]);
  const [newChoice, setNewChoice] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setOrgName(initialData.organization_name || '');
      setPostName(initialData.post_name || '');
      setJobId(initialData.job_id || '');
      setGrade(initialData.grade || 'Grade-9');
      setTrackingId(initialData.tracking_id || '');
      setRollNumber(initialData.roll_number || '');
      setAppDate(initialData.application_date || '');
      setDeadline(initialData.deadline || '');
      setStatus(initialData.status || 'Submitted');
      setAdmitCardAvailable(initialData.admit_card_available || false);
      setNotes(initialData.notes || '');
      setChoices(initialData.choices ? initialData.choices.map((c) => c.choice_organization) : []);
    } else {
      // Reset form
      setOrgName('');
      setPostName('');
      setJobId('');
      setGrade('Grade-9');
      setTrackingId('');
      setRollNumber('');
      setAppDate(new Date().toISOString().split('T')[0]);
      setDeadline('');
      setStatus('Submitted');
      setAdmitCardAvailable(false);
      setNotes('');
      setChoices([]);
    }
    setErrors({});
  }, [initialData, mode, isOpen]);

  const handleAddChoice = () => {
    if (!newChoice.trim()) return;
    if (choices.includes(newChoice.trim())) {
      setErrors((prev) => ({ ...prev, choice: 'Bank already in choice list' }));
      return;
    }
    setChoices([...choices, newChoice.trim()]);
    setNewChoice('');
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.choice;
      return copy;
    });
  };

  const handleRemoveChoice = (index: number) => {
    setChoices(choices.filter((_, idx) => idx !== index));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!orgName.trim()) newErrors.orgName = 'Organization name is required';
    if (!postName.trim()) newErrors.postName = 'Post/Designation name is required';
    if (!jobId.trim()) newErrors.jobId = 'Job ID is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: ApplicationCreatePayload = {
        organization_name: orgName.trim(),
        post_name: postName.trim(),
        job_id: jobId.trim(),
        grade: grade.trim() || undefined,
        tracking_id: trackingId.trim() || undefined,
        roll_number: rollNumber.trim() || undefined,
        application_date: appDate || undefined,
        deadline: deadline || undefined,
        status: status,
        admit_card_available: admitCardAvailable,
        notes: notes.trim() || undefined,
        choices: choices,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, submit: err.message || 'Failed to save application' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Job Application' : 'Edit Application'}
      description="Track Bangladesh recruitment applications, tracking IDs, and choice lists."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Organization Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Organization Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Bangladesh Bank, Sonali Bank PLC"
              className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.orgName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.orgName && <p className="text-xs text-rose-500 mt-1">{errors.orgName}</p>}

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {COMMON_ORGS.slice(0, 4).map((org) => (
              <button
                type="button"
                key={org}
                onClick={() => setOrgName(org)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                + {org}
              </button>
            ))}
          </div>
        </div>

        {/* Post Name and Job ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Post Name / Designation *
            </label>
            <input
              type="text"
              value={postName}
              onChange={(e) => setPostName(e.target.value)}
              placeholder="e.g. Senior Officer (IT)"
              className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.postName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.postName && <p className="text-xs text-rose-500 mt-1">{errors.postName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Job ID / Circular ID *
            </label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="e.g. 26101"
              className={`w-full px-3.5 py-2 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                errors.jobId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {errors.jobId && <p className="text-xs text-rose-500 mt-1">{errors.jobId}</p>}
          </div>
        </div>

        {/* Grade, Roll and Tracking ID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Grade
            </label>
            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="e.g. Grade-9"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Tracking ID / CV ID
            </label>
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="e.g. 2052062-838456"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Roll Number
            </label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="e.g. 116683"
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Application Date, Deadline, and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Applied Date
            </label>
            <input
              type="date"
              value={appDate}
              onChange={(e) => setAppDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Application Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Admit Card Available Checkbox */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="admit_card_available"
            checked={admitCardAvailable}
            onChange={(e) => setAdmitCardAvailable(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <label htmlFor="admit_card_available" className="text-sm font-medium text-slate-700 cursor-pointer">
            Admit Card is available for download
          </label>
        </div>

        {/* Choice List Manager */}
        <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bank Choice List / Preferences</span>
            </span>
            <span className="text-[11px] text-slate-500">{choices.length} choices configured</span>
          </div>

          <div className="flex space-x-2 mb-2.5">
            <input
              type="text"
              value={newChoice}
              onChange={(e) => setNewChoice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChoice();
                }
              }}
              placeholder="e.g. Sonali Bank PLC, Janata Bank PLC"
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
            <button
              type="button"
              onClick={handleAddChoice}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {errors.choice && <p className="text-[11px] text-rose-500 mb-2">{errors.choice}</p>}

          {choices.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {choices.map((choice, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-md border border-slate-200 text-xs text-slate-800"
                >
                  <span className="font-medium text-slate-500 w-5">{idx + 1}.</span>
                  <span className="flex-1 font-medium">{choice}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChoice(idx)}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">
              No specific choice list required (common for single-bank recruitment).
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Recruitment Notes / Notice Information
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Exam date and center will be announced later in newspapers. Tracking ID verified."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Application' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
