import React, { useState } from 'react';
import {
  Activity,
  Lock,
  User,
  ShieldCheck,
  Zap,
  ArrowRight,
  Cpu,
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export interface UserProfile {
  name: string;
  role: string;
  email: string;
  facility: string;
  clearanceLevel: string;
  avatarInitials: string;
}

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

const DEMO_PERSONAS: UserProfile[] = [
  {
    name: 'Snehansh Sharma',
    role: 'Plant Operations Director',
    email: 'snehansh@pulse.manufacturing',
    facility: 'Bengaluru Industrial Hub (FAC-BLR-01)',
    clearanceLevel: 'Level 4: Full Autonomous Override',
    avatarInitials: 'SS',
  },
  {
    name: 'Lakshya Vadera',
    role: 'Chief Dispatch & Scheduling Lead',
    email: 'lakshya@pulse.manufacturing',
    facility: 'Bengaluru Industrial Hub (FAC-BLR-01)',
    clearanceLevel: 'Level 3: Strategic Re-Routing',
    avatarInitials: 'LV',
  },
  {
    name: 'Dr. Evelyn Reed',
    role: 'AI & Automation Systems Architect',
    email: 'evelyn.reed@pulse.ai',
    facility: 'Global Operations Centre',
    clearanceLevel: 'Level 4: Pipeline Telemetry',
    avatarInitials: 'ER',
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedPersona, setSelectedPersona] = useState<UserProfile>(DEMO_PERSONAS[0]);
  const [email, setEmail] = useState(DEMO_PERSONAS[0].email);
  const [password, setPassword] = useState('pulse-secure-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [facility, setFacility] = useState(DEMO_PERSONAS[0].facility);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectPersona = (p: UserProfile) => {
    setSelectedPersona(p);
    setEmail(p.email);
    setFacility(p.facility);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide valid authorization credentials.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Realistic authentication delay for slick UX
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        ...selectedPersona,
        email: email.trim(),
        facility,
      });
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-black relative overflow-hidden font-sans">
      {/* Background Decorative Cockpit Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B10_1px,transparent_1px),linear-gradient(to_bottom,#1E293B10_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-cyan-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <header className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-xl text-white">PULSE</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950/90 text-cyan-400 border border-cyan-800/60">
                  Security Gateway
                </span>
              </div>
              <p className="text-xs text-slate-400">Autonomous Factory Operations Cockpit</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Industrial IoT Gateway: Online</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Center */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-xl">
          {/* Card Container */}
          <div className="bg-[#0D1322]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-semibold mb-3">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Zero-Trust Facility Authentication</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Access Operations Cockpit
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Enter your terminal credentials or choose a quick 1-click demo persona.
              </p>
            </div>

            {/* Quick Demo Persona Selector for Judges */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-cyan-400" />
                  <span>1-Click Hackathon Personas:</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">Instant Autofill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_PERSONAS.map((p) => {
                  const isSelected = selectedPersona.email === p.email;
                  return (
                    <button
                      key={p.email}
                      type="button"
                      onClick={() => handleSelectPersona(p)}
                      className={`text-left p-2.5 rounded-xl border transition-all active:scale-95 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-500/80 ring-1 ring-cyan-500/40 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="h-6 w-6 rounded-md bg-slate-800 flex items-center justify-center font-mono font-bold text-[10px] text-cyan-400">
                          {p.avatarInitials}
                        </span>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />}
                      </div>
                      <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{p.role}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Operator Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Operator Identity / Terminal Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                    placeholder="operator@pulse.factory"
                  />
                </div>
              </div>

              {/* Security Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Security Passkey
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Facility Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Manufacturing Facility
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <select
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                  >
                    <option value="Bengaluru Industrial Hub (FAC-BLR-01)">
                      Bengaluru Industrial Hub (FAC-BLR-01) — 6 Machines Online
                    </option>
                    <option value="Munich Precision Facility (FAC-MUC-02)">
                      Munich Precision Facility (FAC-MUC-02) — Standby Node
                    </option>
                    <option value="Austin Advanced Factory (FAC-ATX-03)">
                      Austin Advanced Factory (FAC-ATX-03) — Synchronized
                    </option>
                  </select>
                </div>
              </div>

              {/* Clearance Badge */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between text-slate-400 font-mono">
                <span className="text-[11px]">Security Clearance:</span>
                <span className="text-cyan-400 font-bold">{selectedPersona.clearanceLevel}</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Cryptographic Tokens...</span>
                  </span>
                ) : (
                  <>
                    <span>Initialize Cockpit Session</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Bottom Telemetry Ticker */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-6 py-3 relative z-10 font-mono text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Cpu className="h-3.5 w-3.5" />
              <span>CORE PIPELINE: SENTINEL • IMPACT • STRATEGIST • ORACLE</span>
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:inline text-slate-400">ENCRYPTION: AES-256-GCM</span>
          </div>
          <div>PULSE Factory OS v1.0.4 • Hackathon Prototype</div>
        </div>
      </footer>
    </div>
  );
};
