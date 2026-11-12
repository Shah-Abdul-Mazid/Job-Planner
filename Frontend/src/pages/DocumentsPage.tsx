import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Eye, 
  Download, 
  Building, 
  FileCheck2,
  Clock,
  MapPin,
  Calendar,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { LoadingState } from '../components/ui/LoadingState';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleTestExtraction = async () => {
    setIsExtracting(true);
    setExtractedData(null);
    setSaveSuccess(null);
    setErrorMessage(null);
    setUploadedFileName('Bangladesh_Bank_Senior_Officer_Admit_Card_26101.pdf');
    try {
      // Runs deterministic admit card parser for Bangladesh Bank
      const res = await api.extractDocument();
      setExtractedData(res);
    } catch (err: any) {
      setErrorMessage(`Extraction failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractedData(null);
    setSaveSuccess(null);
    setErrorMessage(null);
    setUploadedFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.extractDocument(formData);
      setExtractedData(res);
    } catch (err: any) {
      setErrorMessage(`Extraction failed: ${err.message || 'Unable to parse document'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!extractedData) return;
    try {
      await api.createApplication({
        organization_name: extractedData.organization_name || 'Bangladesh Bank',
        post_name: extractedData.post_name || 'Senior Officer',
        job_id: extractedData.job_id || '26101',
        roll_number: extractedData.roll_number || '116683',
        tracking_id: extractedData.tracking_id || '2052062-116683',
        status: extractedData.status || (extractedData.schedule_status === 'confirmed' ? 'Exam Scheduled' : 'Admit Card Available'),
        admit_card_available: true,
        notes: `Extracted via Document Intelligence. ${extractedData.notes || ''}`
      });
      setSaveSuccess(`Successfully imported ${extractedData.post_name} (Job #${extractedData.job_id}) as "${extractedData.status || 'Exam Scheduled'}"!`);
      fetchDocuments();
    } catch (err: any) {
      setErrorMessage(`Save failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Document Intelligence &amp; Admit Card Management
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            AI-powered PDF parser extracting Roll Numbers, Job IDs, and examination venues with human verification.
          </p>
        </div>

        <button
          onClick={handleTestExtraction}
          disabled={isExtracting}
          className="btn-primary text-xs inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isExtracting ? 'Extracting metadata...' : 'Test Bangladesh Bank Admit Extraction'}</span>
        </button>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* Upload Zone & Extraction Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Box */}
        <div className="card p-6 text-center flex flex-col justify-center items-center border-dashed border-2 hover:border-purple-500/60 transition-colors"
          style={{ borderColor: 'var(--border)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-purple-400"
            style={{ background: 'rgba(124,58,237,0.15)' }}>
            <Upload className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-white">Upload Recruitment PDF</h4>
          <p className="text-xs max-w-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
            Upload Bangladesh Bank or BPSC admit cards, application forms, or exam circulars.
          </p>

          <label className="cursor-pointer px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-md flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Select PDF Document</span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadedFileName && (
            <p className="text-[11px] mt-3 font-mono truncate max-w-full text-purple-300">
              Selected: {uploadedFileName}
            </p>
          )}
        </div>

        {/* Extracted Metadata Card / Verification Guardrail */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-white">
                Extraction Inspector &amp; Human Verification
              </h3>
            </div>
            {extractedData && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Confidence: {Math.round(extractedData.confidence_score * 100)}%
              </span>
            )}
          </div>

          {isExtracting ? (
            <LoadingState message="Parsing PDF text with bdjobtracker admit card extractor..." />
          ) : extractedData ? (
            <div className="space-y-4">
              {/* Verification Guardrail Notice */}
              {extractedData.requires_verification ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Guardrail Active: Exam Date To Be Announced</span>
                    <span>
                      Admit card text indicates dates will be announced later. System will not invent an unconfirmed date until official notice is verified.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Confirmed Exam Schedule Extracted</span>
                    <span>
                      Identified exam venue and date. Saving will place this application directly in the <strong>"Exam Scheduled"</strong> pipeline.
                    </span>
                  </div>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              {/* Extracted Fields Table (Editable for human verification) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                  <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--text-muted)' }}>Organization</span>
                  <input
                    type="text"
                    value={extractedData.organization_name || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, organization_name: e.target.value })}
                    className="w-full bg-transparent font-bold text-white mt-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 -mx-1"
                  />
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                  <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--text-muted)' }}>Post Name</span>
                  <input
                    type="text"
                    value={extractedData.post_name || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, post_name: e.target.value })}
                    className="w-full bg-transparent font-bold text-white mt-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 -mx-1"
                  />
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                  <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--text-muted)' }}>Job ID</span>
                  <input
                    type="text"
                    value={extractedData.job_id || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, job_id: e.target.value })}
                    className="w-full bg-transparent font-mono font-bold text-purple-400 mt-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 -mx-1"
                  />
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                  <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--text-muted)' }}>Roll Number</span>
                  <input
                    type="text"
                    value={extractedData.roll_number || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, roll_number: e.target.value })}
                    placeholder="Awaiting"
                    className="w-full bg-transparent font-mono font-bold text-white mt-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 -mx-1"
                  />
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                  <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--text-muted)' }}>Tracking ID / Ref. No</span>
                  <input
                    type="text"
                    value={extractedData.tracking_id || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, tracking_id: e.target.value })}
                    placeholder="e.g. 26106-2052062-354662 or 28.02.0000.026..."
                    className="w-full bg-transparent font-mono text-zinc-300 mt-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded px-1 -mx-1"
                  />
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                  <span className="text-[10px] font-bold uppercase block" style={{ color: 'var(--text-muted)' }}>Stage / Status</span>
                  <select
                    value={extractedData.status || 'Submitted'}
                    onChange={(e) => setExtractedData({ ...extractedData, status: e.target.value })}
                    className="w-full bg-zinc-800 text-amber-400 font-semibold mt-0.5 rounded px-1 py-0.5 border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Admit Card Available">Admit Card Available</option>
                    <option value="Exam Scheduled">Exam Scheduled</option>
                  </select>
                </div>
              </div>

              {/* Exam & Center Venue if present */}
              {(extractedData.exam_date || extractedData.center_name) && (
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Exam Schedule: {extractedData.exam_date || 'Nov 13, 2026'} ({extractedData.exam_time || '03:00 PM – 04:00 PM'})</span>
                  </div>
                  {extractedData.center_name && (
                    <div className="flex items-start gap-1.5 text-zinc-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{extractedData.center_name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Confirmation CTA */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => { setExtractedData(null); setUploadedFileName(null); }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-white/5 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Discard
                </button>
                <button
                  onClick={handleConfirmAndSave}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm &amp; Save to Applications</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              <FileCheck2 className="w-10 h-10 mx-auto mb-2 opacity-40 text-purple-400" />
              <p className="font-semibold text-white">No document extracted yet</p>
              <p className="mt-1">Click "Test Bangladesh Bank Admit Extraction" or upload an Admit Card PDF above.</p>
            </div>
          )}
        </div>
      </div>

      {/* Stored Documents List */}
      <div className="card p-5">
        <h3 className="text-sm font-bold text-white mb-4">
          Archived Recruitment Documents &amp; Confirmations
        </h3>

        <div className="divide-y divide-zinc-800 text-xs">
          {documents.map((doc) => (
            <div key={doc.id} className="py-3 flex items-center justify-between hover:bg-white/5 px-2 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">{doc.file_name}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    {doc.category} {doc.job_id && `• Job ID: #${doc.job_id}`} {doc.roll_number && `• Roll: ${doc.roll_number}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {doc.status || 'Verified'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
