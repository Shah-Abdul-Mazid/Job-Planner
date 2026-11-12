import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { api, CenterInfo, SeniorOfficerCenterResponse } from '../../services/api';
import { MapPin, Search, CheckCircle2, Building, Clock, Calendar, Users, AlertCircle, FileSpreadsheet } from 'lucide-react';

interface SeatPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRoll?: number;
}

export const SeatPlanModal: React.FC<SeatPlanModalProps> = ({
  isOpen,
  onClose,
  defaultRoll = 116683,
}) => {
  const [data, setData] = useState<SeniorOfficerCenterResponse | null>(null);
  const [searchRoll, setSearchRoll] = useState(defaultRoll ? defaultRoll.toString() : '116683');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async (roll?: number) => {
    setLoading(true);
    try {
      const res = await api.getSeniorOfficerCenters(roll);
      setData(res);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const initialRoll = defaultRoll || 116683;
      setSearchRoll(initialRoll.toString());
      loadData(initialRoll);
    }
  }, [isOpen, defaultRoll]);

  const handleRollSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const rollNum = parseInt(searchRoll.trim(), 10);
    if (!isNaN(rollNum)) {
      loadData(rollNum);
    }
  };

  // Find center matching roll number: start_roll <= roll <= end_roll
  const parsedSearchRoll = parseInt(searchRoll.trim(), 10);
  const activeMatchedCenter = data?.matched_center || (
    !isNaN(parsedSearchRoll)
      ? data?.centers.find((c: any) => c.start_roll <= parsedSearchRoll && parsedSearchRoll <= c.end_roll)
      : undefined
  );

  // Search by between the limit: start_roll <= searchNum <= end_roll or name/address
  const filteredCenters = (data?.centers || []).filter((c: any) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const searchNum = parseInt(term, 10);

    // Search by between the limit: start_roll <= roll <= end_roll
    if (!isNaN(searchNum) && term.length >= 3) {
      if (c.start_roll <= searchNum && searchNum <= c.end_roll) {
        return true;
      }
    }

    return (
      (c.name || '').toLowerCase().includes(term) ||
      (c.address || c.area || '').toLowerCase().includes(term) ||
      (c.sl || c.centre_no || '').toString().includes(term) ||
      (c.start_roll || '').toString().includes(term) ||
      (c.end_roll || '').toString().includes(term)
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Seat Plan & Exam Center List"
      description="Combined 9 Banks & 2 FIs (BSCS) — Senior Officer (General) (Job ID: 26101) — Notice No: 348/2026"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Notice Info Strip */}
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-xl p-4 shadow-sm border border-indigo-500/30">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                Notice No: 348/2026
              </span>
              <span className="text-xs text-slate-300">Published: 27 October 2026</span>
              <span className="text-xs text-purple-300 font-bold">• 903 Vacancies (Combined 9 Banks &amp; 2 FIs)</span>
            </div>
            <span className="text-xs text-amber-300 font-semibold flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-amber-400" />
              Exam: 13/11/2026 (Tomorrow, Friday)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-200">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Time: 03:00 PM – 04:00 PM</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Reporting: By 02:00 PM</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Total Candidates: 120,529</span>
            </div>
          </div>
        </div>

        {/* Roll Search & Highlighted Matched Center */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Candidate Roll Number Lookup (Between Start &amp; End Roll)</span>
            </span>

            <form onSubmit={handleRollSearch} className="flex items-center space-x-2">
              <input
                type="number"
                value={searchRoll}
                onChange={(e) => setSearchRoll(e.target.value)}
                placeholder="Enter roll e.g. 116683..."
                className="px-3 py-1.5 text-xs rounded-lg border border-emerald-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44 font-mono font-bold"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Find Center
              </button>
            </form>
          </div>

          {activeMatchedCenter ? (
            <div className="bg-white p-3.5 rounded-lg border border-emerald-300 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
                    Center #{activeMatchedCenter.sl} Assigned for Roll {searchRoll}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                    {activeMatchedCenter.name}
                  </h4>
                  <p className="text-xs text-slate-600 flex items-center mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
                    <span>{activeMatchedCenter.address}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                    Roll: {activeMatchedCenter.start_roll} – {activeMatchedCenter.end_roll}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-1 font-medium">
                    Total Seats: {activeMatchedCenter.total}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-600">
              No center found matching roll number {searchRoll}. Please check the start/end roll limits below.
            </p>
          )}
        </div>

        {/* Filter All 31 Centers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              All 31 Exam Centers (Search by name, address, or roll number between limits)
            </h4>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter centers or search roll..."
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 w-10 text-center">Sl</th>
                  <th className="py-2 px-3">School / College Name</th>
                  <th className="py-2 px-3">Address</th>
                  <th className="py-2 px-3 text-right">Starting Roll</th>
                  <th className="py-2 px-3 text-right">Ending Roll</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCenters.map((c: any) => {
                  const isUserCenter = activeMatchedCenter?.sl === c.sl;
                  return (
                    <tr
                      key={c.sl}
                      className={
                        isUserCenter
                          ? 'bg-emerald-50/90 font-semibold text-emerald-950 border-l-4 border-l-emerald-600'
                          : 'hover:bg-slate-50 text-slate-700'
                      }
                    >
                      <td className="py-2 px-3 text-center">{c.sl}</td>
                      <td className="py-2 px-3">
                        <span className="flex items-center">
                          {c.name}
                          {isUserCenter && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-emerald-600 text-white font-bold">
                              YOUR CENTER
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-500">{c.address}</td>
                      <td className="py-2 px-3 text-right font-mono">{c.start_roll}</td>
                      <td className="py-2 px-3 text-right font-mono">{c.end_roll}</td>
                      <td className="py-2 px-3 text-right font-mono">{c.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            Source: Bankers' Selection Committee Secretariat (Notice Ref: 348/2026)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
          >
            Close Seat Plan
          </button>
        </div>
      </div>
    </Modal>
  );
};
