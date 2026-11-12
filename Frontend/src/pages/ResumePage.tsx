import React, { useState } from 'react';
import { 
  FileText, Download, CheckCircle2, Award, Briefcase, 
  GraduationCap, Sparkles, Eye, Upload, Plus, AlertCircle, Copy
} from 'lucide-react';

export const ResumePage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const candidateProfile = {
    name: 'Shah Abdul Mazid',
    banglaName: 'শাহ আব্দুল মাজীদ',
    father: 'Shah Mohammad Monir Uddin',
    mother: 'Yesmin Khanom',
    dob: '01 June, 2001 (25 Years 3 Months 1 Days)',
    phone: '01531329222',
    email: 'shahabdulmazid.ezan@yahoo.com',
    cvId: '2052062-338528',
    address: '14/14, Block-C, Tajmohol Road, Mohammadpur, Dhaka-1207',
    nid: '1511276758',
    degrees: [
      {
        level: 'B.Sc. in Computer Science & Engineering',
        institution: 'East West University (EWU)',
        year: '2026',
        result: 'CGPA 2.56 / 4.00',
        field: 'Computer Science & Engineering',
      },
      {
        level: 'Higher Secondary Certificate (H.S.C)',
        institution: 'Dhaka Board',
        year: '2020',
        result: 'GPA 4.08 / 5.00',
        field: 'Science',
      },
      {
        level: 'Secondary School Certificate (S.S.C)',
        institution: 'Dhaka Board',
        year: '2018',
        result: 'GPA 4.00 / 5.00',
        field: 'Science',
      }
    ],
    skills: [
      'Python / FastAPI', 'TypeScript / React', 'SQL / Database Admin',
      'Computer Networking', 'Cloud Computing', 'Git / CI/CD',
      'System Architecture', 'Information Security'
    ]
  };

  const handleCopyCvId = () => {
    navigator.clipboard.writeText(candidateProfile.cvId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Resume &amp; Candidate CV Profile
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Central resume data synchronized across Bangladesh Bank eRecruitment and Teletalk recruitment forms.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCvId}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-purple-400" />
            <span>{copied ? 'Copied CV ID!' : `Copy CV ID (${candidateProfile.cvId})`}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Personal Information & Identification */}
        <div className="card p-6 space-y-5" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-purple-600/30">
              SM
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{candidateProfile.name}</h3>
              <p className="text-xs text-zinc-400 font-bengali">{candidateProfile.banglaName}</p>
              <span className="inline-block mt-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                CV ID: #{candidateProfile.cvId}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Father's Name</span>
              <span className="text-zinc-200 font-medium">{candidateProfile.father}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Mother's Name</span>
              <span className="text-zinc-200 font-medium">{candidateProfile.mother}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Date of Birth</span>
              <span className="text-zinc-200 font-medium">{candidateProfile.dob}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">National ID / NID</span>
              <span className="text-zinc-200 font-mono">{candidateProfile.nid}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Contact Info</span>
              <span className="text-zinc-200 block font-mono">{candidateProfile.phone}</span>
              <span className="text-zinc-400 block truncate">{candidateProfile.email}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-500 block">Permanent Address</span>
              <span className="text-zinc-300 leading-snug block">{candidateProfile.address}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>Verified with BB eRecruitment Portal</span>
          </div>
        </div>

        {/* Right Columns: Education & Skills */}
        <div className="lg:col-span-2 space-y-6">

          {/* Educational Background */}
          <div className="card p-6" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-400" />
                Educational Qualifications
              </h3>
              <span className="text-[11px] text-zinc-500">3 Degrees Recorded</span>
            </div>

            <div className="space-y-4">
              {candidateProfile.degrees.map((deg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{deg.level}</p>
                    <p className="text-xs text-zinc-400">{deg.institution} · {deg.field}</p>
                  </div>
                  <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end">
                    <span className="text-xs font-mono font-bold text-emerald-400">{deg.result}</span>
                    <span className="text-[10px] text-zinc-500">Year {deg.year}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical & Core Skills */}
          <div className="card p-6" style={{ background: '#121217', border: '1px solid #1f1f28' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Technical Competencies for IT &amp; Engineering Posts
              </h3>
              <span className="text-[11px] text-zinc-500">Grade-9 Officer Alignment</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {candidateProfile.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium hover:border-purple-500/50 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
