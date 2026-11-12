import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Clock, 
  FileSpreadsheet, 
  CheckCircle2, 
  User, 
  BookOpen, 
  ExternalLink 
} from 'lucide-react';
import { api } from '../services/api';
import { SeatPlanModal } from '../components/examinations/SeatPlanModal';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  suggested_actions?: string[];
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'assistant',
    text: "Hello! I am your **Bangladesh Recruitment & Career Assistant**. I track your applications for Bangladesh Bank, BSCS combined banks, and government circulars.\n\n**Urgent Notice:** Your **Bangladesh Bank Senior Officer MCQ Examination** is **tomorrow (Friday, 13 Nov 2026)** at **Shamsul Hoque Khan School & College, Jatrabari** (Roll: `116683`).\n\nHow can I help you prepare today?",
    sources: ['Notice No: 357/2026', 'Bangladesh_Bank_Senior_Officer_26101_Admit_Card.pdf'],
    suggested_actions: [
      'What examinations do I have this month?',
      'Show my seat plan center details',
      'Which applications are waiting for a written exam?',
      'Generate exam preparation checklist'
    ],
    timestamp: 'Just now'
  }
];

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSeatPlanOpen, setIsSeatPlanOpen] = useState(false);

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const res = await api.chatWithAssistant(q);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.response,
        sources: res.sources,
        suggested_actions: res.suggested_actions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: "I couldn't reach the AI backend service right now. Please ensure the FastAPI backend is running.",
        timestamp: 'Error'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.includes('Seat Plan')) {
      setIsSeatPlanOpen(true);
    } else {
      handleSend(action);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              AI Recruitment Assistant & Career Advisor
            </h3>
            <p className="text-xs text-slate-500">
              RAG-based search over your circulars, admit cards, and examination schedules.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSeatPlanOpen(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Quick Seat Plan (116683)</span>
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 min-h-[460px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-3 ${
              m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                m.sender === 'user' ? 'bg-indigo-600' : 'bg-purple-600 shadow-sm'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none space-y-2.5'
              }`}
            >
              {/* Formatted Text */}
              <div className="whitespace-pre-wrap">{m.text}</div>

              {/* Source citations */}
              {m.sources && m.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5">
                  <span className="font-bold text-slate-400 uppercase text-[9px]">Sources:</span>
                  {m.sources.map((s, idx) => (
                    <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Suggested Action Pills */}
              {m.suggested_actions && m.suggested_actions.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {m.suggested_actions.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(act)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-indigo-700 text-[11px] font-semibold transition-colors flex items-center space-x-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{act}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 pl-11">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span>AI is querying recruitment database and circulars...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI: 'What exams do I have this month?' or 'Show my seat plan'..."
          className="flex-1 px-4 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none bg-transparent"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-40 transition-colors shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <SeatPlanModal
        isOpen={isSeatPlanOpen}
        onClose={() => setIsSeatPlanOpen(false)}
        defaultRoll={116683}
      />
    </div>
  );
};
