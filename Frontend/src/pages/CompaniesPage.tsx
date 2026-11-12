import React, { useState } from 'react';
import { 
  Building2, Search, ExternalLink, MapPin, Users, Briefcase, 
  CheckCircle2, ArrowUpRight, Filter, Globe, Phone, Mail
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  banglaName?: string;
  category: 'Central Bank' | 'Scheduled Bank' | 'Specialized Bank' | 'Autonomous / Govt' | 'Financial Institution';
  headquarters: string;
  website: string;
  activeOpenings: number;
  totalPositions: string;
  appliedCount: number;
  description: string;
  circularRef: string;
}

const COMPANIES_DATA: Company[] = [
  {
    id: 'bb',
    name: 'Bangladesh Bank',
    banglaName: 'বাংলাদেশ ব্যাংক',
    category: 'Central Bank',
    headquarters: 'Motijheel, Dhaka-1000',
    website: 'https://erecruitment.bb.org.bd',
    activeOpenings: 3,
    totalPositions: '903+ Posts',
    appliedCount: 1,
    description: 'Central bank of Bangladesh responsible for monetary policy and conducting recruitment for BSCS member banks.',
    circularRef: 'BSCS Notice No. 348/2026'
  },
  {
    id: 'sonali',
    name: 'Sonali Bank PLC',
    banglaName: 'সোনালী ব্যাংক পিএলসি',
    category: 'Scheduled Bank',
    headquarters: 'Motijheel C/A, Dhaka',
    website: 'https://sonalibank.com.bd',
    activeOpenings: 2,
    totalPositions: 'Assistant Database Administrator, Officer',
    appliedCount: 1,
    description: 'Largest state-owned commercial bank in Bangladesh with countrywide network.',
    circularRef: 'Job ID: 26109'
  },
  {
    id: 'petrobangla',
    name: 'Bangladesh Oil, Gas & Mineral Corporation (Petrobangla)',
    banglaName: 'বাংলাদেশ তৈল, গ্যাস ও খনিজ সম্পদ করপোরেশন',
    category: 'Autonomous / Govt',
    headquarters: 'Petrocenter, 3 Kawran Bazar, Dhaka',
    website: 'https://petrobangla.org.bd',
    activeOpenings: 1,
    totalPositions: 'Assistant Manager (CSE/IT)',
    appliedCount: 1,
    description: 'National state-owned oil and gas company of Bangladesh managing energy, minerals and affiliated companies.',
    circularRef: 'Ref: 28.02.0000.000.011.26.0027.26.453'
  },
  {
    id: 'bhtpa',
    name: 'Bangladesh Hi-Tech Park Authority (BHTPA)',
    banglaName: 'বাংলাদেশ হাই-টেক পার্ক কর্তৃপক্ষ',
    category: 'Autonomous / Govt',
    headquarters: 'ICT Tower, Agargaon, Dhaka',
    website: 'https://bhtpa.gov.bd',
    activeOpenings: 1,
    totalPositions: 'Assistant Programmer (Grade-9)',
    appliedCount: 1,
    description: 'Government agency under ICT Division establishing hi-tech parks and fostering technology ecosystem.',
    circularRef: 'Ref: 56.02.0000.003.11.0004.26-150'
  },
  {
    id: 'combined-8',
    name: 'Combined 8 Banks & FIs',
    banglaName: 'সমন্বিত ৮ ব্যাংক ও আর্থিক প্রতিষ্ঠান',
    category: 'Scheduled Bank',
    headquarters: 'Bankers Selection Committee Secretariat, Dhaka',
    website: 'https://erecruitment.bb.org.bd',
    activeOpenings: 3,
    totalPositions: 'Senior Officer (IT), Assistant Programmer, Assistant Engineer',
    appliedCount: 3,
    description: 'Unified recruitment body covering Janata, Agrani, Rupali, BKB, RAKUB, BASIC, BDBL, and Karmasangsthan Bank.',
    circularRef: 'Job IDs: 26104, 26106, 26107'
  },
  {
    id: 'bpsc',
    name: 'Bangladesh Public Service Commission (BPSC)',
    banglaName: 'বাংলাদেশ সরকারি কর্ম কমিশন',
    category: 'Autonomous / Govt',
    headquarters: 'Agargaon, Sher-e-Bangla Nagar, Dhaka',
    website: 'https://bpsc.gov.bd',
    activeOpenings: 2,
    totalPositions: 'Assistant Network Engineer (Non-Cadre Grade-9)',
    appliedCount: 1,
    description: 'Constitutional body responsible for recruiting civil service cadres and non-cadre government officers.',
    circularRef: 'Circular: BPSC-702'
  },
  {
    id: 'karmasangsthan',
    name: 'Karmasangsthan Bank',
    banglaName: 'কর্মসংস্থান ব্যাংক',
    category: 'Specialized Bank',
    headquarters: '1 Rajuk Avenue, Dhaka',
    website: 'https://karmasangsthanbank.gov.bd',
    activeOpenings: 1,
    totalPositions: 'Assistant System Engineer (Grade-9)',
    appliedCount: 1,
    description: 'Specialized state financial institution providing employment support loans and banking services.',
    circularRef: 'Job ID: 26108'
  },
  {
    id: 'combined-10',
    name: 'Combined 10 Banks & FIs',
    banglaName: 'সমন্বিত ১০ ব্যাংক',
    category: 'Scheduled Bank',
    headquarters: 'BSCS, Motijheel, Dhaka',
    website: 'https://erecruitment.bb.org.bd',
    activeOpenings: 1,
    totalPositions: 'Officer (IT)/MIS and ICT Officer (Grade-10)',
    appliedCount: 1,
    description: 'Recruitment portal for general IT officers across 10 state-sponsored banks.',
    circularRef: 'Job ID: 26105'
  }
];

export const CompaniesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredCompanies = COMPANIES_DATA.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.headquarters.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.totalPositions.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Target Organizations &amp; Companies
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Track recruitment authorities, scheduled banks, ministries, and autonomous corporations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {COMPANIES_DATA.length} Tracked Authorities
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by organization name, headquarters, or post..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
        >
          <option value="All">All Categories</option>
          <option value="Central Bank">Central Bank</option>
          <option value="Scheduled Bank">Scheduled Bank</option>
          <option value="Specialized Bank">Specialized Bank</option>
          <option value="Autonomous / Govt">Autonomous / Govt</option>
        </select>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((c) => (
          <div
            key={c.id}
            className="card p-5 flex flex-col justify-between space-y-4 hover:border-purple-500/40 transition-all group"
            style={{ background: '#121217', border: '1px solid #1f1f28' }}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400 font-bold text-sm">
                  {c.name.charAt(0)}
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {c.category}
                </span>
              </div>

              <div className="mt-3">
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                  {c.name}
                </h3>
                {c.banglaName && (
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-bengali">
                    {c.banglaName}
                  </p>
                )}
                <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-zinc-800/80 text-[11px]">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">{c.headquarters}</span>
              </div>

              <div className="flex items-center gap-1.5 text-zinc-400">
                <Briefcase className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="truncate">{c.totalPositions}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono text-purple-400 font-medium">
                  {c.appliedCount} Active Applications
                </span>
                <a
                  href={c.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
