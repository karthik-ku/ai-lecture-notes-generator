import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Mail,
  ShieldCheck,
  Cpu,
  Key,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [healthInfo, setHealthInfo] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealthInfo(res.data);
      } catch (err) {
        console.error('Failed to fetch health info', err);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Account & System Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Review your profile details, AI backend integration status, and system configurations.</p>
      </div>

      {/* User Information Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Student Profile</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold uppercase">Full Name</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{user?.fullName || 'Student'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs text-slate-500 font-semibold uppercase">Email Address</span>
            <p className="text-sm font-bold text-slate-900 mt-1">{user?.email || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 sm:col-span-2">
            <span className="text-xs text-slate-500 font-semibold uppercase">Registration Date</span>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Engine Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          <span>AI Engine & Generation Modes</span>
        </h2>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">Backend API Status</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
              {healthInfo?.status || 'ONLINE'}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The application natively supports both OpenAI-compatible LLM endpoints and an intelligent, deterministic Rule-Based Demo Mode.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
          <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold">
            <Key className="w-4 h-4 text-indigo-600" />
            <span>How to Connect Your OpenAI API Key</span>
          </div>
          <p className="text-xs text-indigo-800 leading-relaxed">
            Configure the following environment variables in your backend environment (or Docker / deployment dashboard):
          </p>
          <pre className="bg-slate-900 text-indigo-200 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`AI_API_KEY=sk-your-openai-api-key-here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini`}
          </pre>
          <p className="text-xs text-indigo-700">
            If no key is configured, the system automatically runs in <strong>Demo Mode</strong>, ensuring 100% functionality with zero setup.
          </p>
        </div>
      </div>

      {/* Security & Isolation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Data Isolation</span>
        </h2>
        <ul className="space-y-2 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Passwords are hashed using industry standard BCrypt.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>User isolation enforced server-side. Notes and quizzes are strictly scoped to the authenticated student.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>API keys are kept strictly on the backend and never transmitted to the browser.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsPage;
