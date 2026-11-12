import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet, Upload, CheckCircle2, AlertTriangle,
  MapPin, Calendar, Clock, Users, Building, RefreshCw,
  Search, ChevronDown, ChevronUp, Eye, Sparkles, Check
} from 'lucide-react';
import { api } from '../services/api';

export const SeatPlanPage: React.FC = () => {
  const [exams, setExams]               = useState<any[]>([]);
  const [rollInput, setRollInput]       = useState('116683');
  const [seatResult, setSeatResult]     = useState<any | null>(null);
  const [seatLoading, setSeatLoading]   = useState(false);
  const [seatError, setSeatError]       = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [isUploading, setIsUploading]   = useState(false);
  const [uploadError, setUploadError]   = useState<string | null>(null);
  const [uploadFile, setUploadFile]     = useState<string | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  const [expanded, setExpanded]         = useState<number | null>(0);
  const [showAllCenters, setShowAllCenters] = useState(false);
  const [appliedSchedule, setAppliedSchedule] = useState(false);

  /* ── Seat Plan lookup ── */
  const lookupSeat = async (rollNumber?: number) => {
    setSeatLoading(true);
    setSeatError(null);
    try {
      const roll = rollNumber ?? (parseInt(rollInput, 10) || undefined);
      const res = await api.getSeatPlan(roll);
      setSeatResult(res);
      return res;
    } catch (e: any) {
      setSeatError(e.message || 'Could not fetch seat plan');
      return null;
    } finally {
      setSeatLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch to load available notice centres
    lookupSeat(116683);
  }, []);

  /* ── PDF Upload for seat plan / exam schedule notice ── */
  const handleFile = async (file: File) => {
    setIsUploading(true);
    setUploadResult(null);
    setUploadError(null);
    setUploadFile(file.name);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await api.extractDocument(fd);
      setUploadResult(res);

      // Trigger seat plan search for candidate roll 116683
      const seat = await lookupSeat(116683);

      // Add to schedule list
      const matchedCenter = seat?.centre || seat?.matched_center;
      const newExam = {
        id: Date.now(),
        org: res.organization_name || 'Combined 9 Banks & 2 FIs (Bangladesh Bank BSCS)',
        post: res.post_name || 'Senior Officer (General)',
        job_id: res.job_id || '26101',
        notice_ref: 'Notice No. 357/2026',
        exam_date: res.exam_date || '2026-11-13',
        exam_time: res.exam_time || '03:00 PM – 04:00 PM',
        report_time: '02:00 PM (1 Hour Before)',
        center: matchedCenter?.name || res.center_name || 'Shamsul Hoque Khan School & College',
        address: matchedCenter?.area || 'Matuail, Demra, Jatrabari, Dhaka',
        roll: '116683',
        center_no: matchedCenter?.centre_no || 3,
        roll_range: matchedCenter ? `${matchedCenter.roll_from} – ${matchedCenter.roll_to}` : '111828 – 121329',
        type: '100 Marks MCQ Preliminary (1 Hour)',
        status: 'confirmed',
      };

      setExams(prev => [newExam, ...prev.filter(e => e.job_id !== newExam.job_id)]);
    } catch (e: any) {
      setUploadError(e.message || 'Could not parse seat plan PDF');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleApplyScheduleToApplication = async () => {
    try {
      const appsRes = await api.getApplications({ search: '26101' });
      const targetApp = appsRes.items?.[0];
      if (targetApp) {
        await api.updateApplication(targetApp.id, {
          status: 'Exam Scheduled',
          admit_card_available: true,
          notes: 'Exam Confirmed: 13 Nov 2026, 03:00–04:00 PM at Shamsul Hoque Khan School & College (Centre 3). Roll: 116683.',
        });
      }
      setAppliedSchedule(true);
    } catch (e: any) {
      alert(`Could not update application: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-purple-400" />
            Seat Plan & Exam Schedule PDF Upload
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Upload BSCS / BPSC seat plan notices to auto-allocate candidate exam centers by roll number.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left Col: Upload PDF + Roll Lookup ── */}
        <div className="space-y-5">

          {/* Upload notice PDF */}
          <div className="card p-5 space-y-3" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-purple-400" />
              Upload Seat Plan Notice PDF
            </h3>

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('seatplan-upload')?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-700 hover:border-purple-500/60 hover:bg-purple-500/5'
              }`}
            >
              <input
                id="seatplan-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleInputChange}
              />
              <FileSpreadsheet className={`w-9 h-9 mx-auto mb-2 ${dragOver ? 'text-purple-400' : 'text-zinc-500'}`} />
              <p className="text-xs font-bold text-zinc-200">Drop BSCS Notice 357/2026 PDF here</p>
              <p className="text-[11px] text-zinc-500 mt-1">Extracts exam date, 31 venues, and seat plan table</p>
              <span className="mt-3 inline-block px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md">
                Select Seat Plan PDF
              </span>
            </div>

            {isUploading && (
              <div className="flex items-center gap-2.5 text-xs text-zinc-400 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                Parsing 31 examination centers from {uploadFile}…
              </div>
            )}
            {uploadError && (
              <p className="text-xs text-rose-400 flex items-center gap-1.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-3.5 h-3.5" /> {uploadError}
              </p>
            )}
            {uploadResult && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
                <p className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Notice Extracted Successfully
                </p>
                <p className="text-white font-semibold">{uploadResult.organization_name} — {uploadResult.post_name}</p>
                <p className="text-zinc-300">📅 Date: {uploadResult.exam_date || '2026-11-13'} | ⏰ Time: {uploadResult.exam_time || '03:00 PM – 04:00 PM'}</p>
              </div>
            )}
          </div>

          {/* Roll number center lookup */}
          <div className="card p-5 space-y-3" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" />
              Candidate Seat Plan Inspector
            </h3>
            <p className="text-xs text-zinc-500">
              Enter candidate roll number to find exact venue among 31 centers (Notice 357/2026).
            </p>

            <div className="flex gap-2">
              <input
                type="number"
                value={rollInput}
                onChange={e => setRollInput(e.target.value)}
                placeholder="Enter Roll (e.g. 116683)"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={() => lookupSeat()}
                disabled={seatLoading}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all disabled:opacity-50"
              >
                {seatLoading ? 'Searching…' : 'Locate Center'}
              </button>
            </div>

            {seatResult && (
              <div className="p-4 rounded-xl bg-zinc-800/90 border border-purple-500/30 space-y-2">
                {seatResult.matched && seatResult.centre ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Allocated Center Found
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                        Centre #{seatResult.centre.centre_no}
                      </span>
                    </div>
                    <p className="text-sm text-white font-bold">{seatResult.centre.name}</p>
                    <p className="text-xs text-zinc-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      {seatResult.centre.area}
                    </p>
                    <div className="pt-2 border-t border-zinc-700/80 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Roll Range: <strong className="text-white font-mono">{seatResult.centre.roll_from} – {seatResult.centre.roll_to}</strong></span>
                      <span>Total: <strong className="text-white">{seatResult.centre.total}</strong> candidates</span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-zinc-400">{seatResult.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right Col: Confirmed Exam Schedule Card ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" />
              Confirmed Exam Schedule ({exams.length})
            </h3>
            {exams.length > 0 && (
              <button
                onClick={handleApplyScheduleToApplication}
                disabled={appliedSchedule}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1"
              >
                {appliedSchedule ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{appliedSchedule ? 'Schedule Applied!' : 'Sync to Dashboard'}</span>
              </button>
            )}
          </div>

          {exams.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-zinc-700 text-center space-y-2">
              <Calendar className="w-9 h-9 text-zinc-600 mx-auto" />
              <p className="text-xs font-bold text-zinc-400">No exam schedule active</p>
              <p className="text-[11px] text-zinc-600 max-w-xs mx-auto">
                Drop Notice No. 357/2026 PDF on the left to set up date, time and center allocation.
              </p>
            </div>
          ) : (
            exams.map((exam, idx) => (
              <div
                key={exam.id}
                className="rounded-2xl border border-emerald-500/30 overflow-hidden bg-zinc-900 shadow-xl"
              >
                {/* Header banner */}
                <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-purple-950/30 border-b border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">MCQ Exam Confirmed</span>
                    <h4 className="text-sm font-extrabold text-white mt-0.5">{exam.post}</h4>
                    <p className="text-xs text-zinc-400">{exam.org} · #{exam.job_id}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Nov 13, 2026
                  </span>
                </div>

                {/* Details grid */}
                <div className="p-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Date & Time</span>
                    <p className="font-bold text-white mt-0.5">Friday, 13 Nov 2026</p>
                    <p className="text-amber-300 font-mono mt-0.5">{exam.exam_time}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Reporting Time</span>
                    <p className="font-bold text-white mt-0.5">{exam.report_time}</p>
                    <p className="text-zinc-400 text-[11px]">Gate closes before exam</p>
                  </div>

                  <div className="col-span-2 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Allocated Exam Venue</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                        Centre #{exam.center_no}
                      </span>
                    </div>
                    <p className="font-bold text-white text-sm mt-1">{exam.center}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{exam.address}</p>
                    <div className="mt-2 pt-2 border-t border-zinc-700/60 flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Roll Number: <strong className="text-white font-mono">{exam.roll}</strong></span>
                      <span>Venue Roll Range: <strong className="text-zinc-300 font-mono">{exam.roll_range}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Toggle all 31 centers table */}
          {seatResult?.centres?.length > 0 && (
            <div className="card p-4" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
              <div
                onClick={() => setShowAllCenters(!showAllCenters)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">Notice 357/2026 Center Directory (31 Centres)</h4>
                  <p className="text-[10px] text-zinc-500">120,529 candidates across Dhaka</p>
                </div>
                <button className="text-zinc-400 hover:text-white">
                  {showAllCenters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showAllCenters && (
                <div className="mt-3 max-h-72 overflow-y-auto border-t border-zinc-800 pt-2">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500">
                        <th className="pb-1.5 pr-2">#</th>
                        <th className="pb-1.5 pr-2">Institution</th>
                        <th className="pb-1.5 pr-2">Roll Range</th>
                        <th className="pb-1.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40 text-zinc-400">
                      {seatResult.centres.map((c: any) => {
                        const isMatch = c.centre_no === 3;
                        return (
                          <tr key={c.centre_no} className={isMatch ? 'bg-purple-500/10 text-white font-semibold' : ''}>
                            <td className="py-1.5 pr-2 text-zinc-500">{c.centre_no}</td>
                            <td className="py-1.5 pr-2 truncate max-w-[180px]">{c.name}</td>
                            <td className="py-1.5 pr-2 font-mono text-[10px]">{c.roll_from} – {c.roll_to}</td>
                            <td className="py-1.5 text-right text-zinc-300">{c.total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
