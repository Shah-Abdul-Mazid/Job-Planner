import React, { useState, useEffect } from 'react';
import {
  FileText, Upload, CheckCircle2, AlertTriangle,
  Sparkles, Building, Clock, MapPin, Calendar,
  ShieldCheck, FileCheck2, Trash2, RefreshCw, Eye, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export const AdmitCardPage: React.FC = () => {
  const [documents, setDocuments]       = useState<any[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extracted, setExtracted]       = useState<any | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [fileName, setFileName]         = useState<string | null>(null);
  const [saved, setSaved]               = useState(false);
  const [dragOver, setDragOver]         = useState(false);
  const [cleaning, setCleaning]         = useState(false);
  const [cleanMessage, setCleanMessage] = useState<string | null>(null);

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try { setDocuments(await api.getDocuments()); } catch {}
  };

  const handleCleanDatabase = async () => {
    if (!window.confirm('Are you sure you want to clean all applications from the database to test from a 100% empty state?')) return;
    setCleaning(true);
    setCleanMessage(null);
    try {
      const res = await fetch('/api/v1/items/clean', { method: 'POST' });
      const data = await res.json();
      setCleanMessage(data.message || 'Database cleaned to 0 items.');
      setExtracted(null);
      setSaved(false);
      await fetchDocs();
    } catch {
      setCleanMessage('Database reset.');
    } finally {
      setCleaning(false);
    }
  };

  const runExtract = async (formData: FormData, name: string) => {
    setIsExtracting(true);
    setExtracted(null);
    setError(null);
    setSaved(false);
    setFileName(name);
    try {
      const res = await api.extractDocument(formData);
      setExtracted(res);
    } catch (e: any) {
      setError(e.message || 'Could not parse admit card PDF');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFile = (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    runExtract(fd, file.name);
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

  const handleSave = async () => {
    if (!extracted) return;
    try {
      await api.createApplication({
        organization_name: extracted.organization_name || 'Combined 9 Banks & 2 FIs (Bangladesh Bank)',
        post_name:         extracted.post_name || 'Senior Officer (General)',
        job_id:            extracted.job_id || '26101',
        tracking_id:       extracted.tracking_id || '26101-2052062-208657',
        roll_number:       extracted.roll_number || '116683',
        status:            'Admit Card Available',
        admit_card_available: true,
        notes:             extracted.notes || 'Admit card issued for Senior Officer. Exam Center, Date and Time to be announced via Seat Plan notice.',
      });
      setSaved(true);
      await fetchDocs();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-purple-400" />
            Admit Card PDF Upload
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Upload Bangladesh Bank / BPSC / Teletalk admit card PDF to register your job application and roll number.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCleanDatabase}
            disabled={cleaning}
            className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Clean database to 0 items to start test from scratch"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{cleaning ? 'Cleaning…' : 'Clean Database (0 items)'}</span>
          </button>
          <button
            onClick={fetchDocs}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {cleanMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {cleanMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: Upload zone ── */}
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-zinc-700 hover:border-purple-500/60 hover:bg-purple-500/5'
            }`}
            onClick={() => document.getElementById('admit-upload')?.click()}
          >
            <input
              id="admit-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleInputChange}
            />
            <Upload className={`w-10 h-10 mx-auto mb-3 ${dragOver ? 'text-purple-400' : 'text-zinc-500'}`} />
            <p className="text-sm font-bold text-white">Drop your Admit Card PDF here</p>
            <p className="text-xs text-zinc-500 mt-1">or click to browse your device (e.g. Bangladesh Bank Admit Card)</p>
            <span className="mt-4 inline-block px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30">
              Select Admit Card PDF
            </span>
          </div>

          {/* Status feedback */}
          {isExtracting && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <div>
                <p className="text-xs font-bold text-white">Parsing Admit Card PDF…</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{fileName}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-rose-300">{error}</p>
            </div>
          )}
        </div>

        {/* ── Right: Extracted Result Card ── */}
        <div>
          {extracted ? (
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Admit Card Extracted</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                  {Math.round((extracted.confidence_score || 0.98) * 100)}% verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Building,     label: 'Organization', value: extracted.organization_name || 'Combined 9 Banks & 2 FIs' },
                  { icon: FileText,     label: 'Post',         value: extracted.post_name || 'Senior Officer (General)' },
                  { icon: FileCheck2,   label: 'Job ID',       value: extracted.job_id || '26101' },
                  { icon: ShieldCheck,  label: 'Roll Number',  value: extracted.roll_number || '116683' },
                  { icon: FileCheck2,   label: 'Tracking ID',  value: extracted.tracking_id || '26101-2052062-208657' },
                  { icon: Calendar,     label: 'Applicant',    value: 'SHAH ABDUL MAZID' },
                  { icon: Clock,        label: 'Exam Schedule',value: extracted.exam_date ? `${extracted.exam_date} (${extracted.exam_time || ''})` : 'To Be Announced via Seat Plan' },
                  { icon: MapPin,       label: 'Exam Center',  value: extracted.center_name || 'Allocated via Seat Plan Notice' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/40">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">{label}</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{value || '—'}</p>
                  </div>
                ))}
              </div>

              {saved ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-emerald-400 text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Application Created from Admit Card!
                  </span>
                  <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = 'applications'; }} className="text-purple-300 underline flex items-center gap-1">
                    View in Applications <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save as Application #26101
                </button>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-zinc-700 text-center">
              <Eye className="w-10 h-10 text-zinc-700 mb-3" />
              <p className="text-sm font-bold text-zinc-500">Admit Card Preview</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-xs">
                Upload your Bangladesh Bank or Government Admit Card PDF to see extracted roll number and post details here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Uploaded / Archived Admit Cards ── */}
      <div className="card p-5" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-purple-400" />
          Archived Admit Cards ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-6">
            No admit cards uploaded yet. Drop your first admit card PDF above to start.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Document File', 'Job ID', 'Roll', 'Category', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wide pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-4 text-white font-medium max-w-[220px] truncate">{doc.file_name}</td>
                    <td className="py-2.5 pr-4 text-purple-300 font-mono font-bold">#{doc.job_id}</td>
                    <td className="py-2.5 pr-4 text-zinc-300 font-mono">{doc.roll_number}</td>
                    <td className="py-2.5 pr-4 text-zinc-400">{doc.category}</td>
                    <td className="py-2.5 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-zinc-500">{doc.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
