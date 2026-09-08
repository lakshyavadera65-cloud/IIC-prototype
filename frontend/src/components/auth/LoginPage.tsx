import React, { useState, useId } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  Building2,
  ArrowRight,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  X,
  Info,
} from 'lucide-react';
import { AuthBackground } from './AuthBackground';
import { useRouter, Link } from '../router/Router';
import { authService, UserProfile, DEMO_PERSONAS } from '../../services/authService';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { navigate } = useRouter();

  const [selectedPersona, setSelectedPersona] = useState<UserProfile>(DEMO_PERSONAS[0]);
  const [email, setEmail] = useState(DEMO_PERSONAS[0].email);
  const [password, setPassword] = useState('pulse-secure-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [facility, setFacility] = useState(DEMO_PERSONAS[0].facility);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // Accessible IDs
  const emailId = useId();
  const passwordId = useId();
  const facilityId = useId();
  const rememberMeId = useId();

  const handleSelectPersona = (p: UserProfile) => {
    setSelectedPersona(p);
    setEmail(p.email);
    setPassword('pulse-secure-2026');
    setFacility(p.facility);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setError('Please provide your operator email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid industrial email format.');
      return;
    }

    if (!cleanPass) {
      setError('Please enter your security passkey.');
      return;
    }

    setIsLoading(true);

    try {
      const user = await authService.login(cleanEmail, cleanPass, rememberMe);
      setIsLoading(false);
      onLogin(user);
      navigate('/');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <AuthBackground>
      <div className="w-full max-w-xl my-4">
        {/* Main Card */}
        <div className="bg-[#0D1322]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-semibold mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Zero-Trust Facility Authentication</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Access Operations Cockpit
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Authenticate your identity to monitor and steer autonomous plant operations.
            </p>
          </div>

          {/* 1-Click Evaluation Personas for Hackathon Judges */}
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor={emailId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                Operator Terminal Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id={emailId}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                  placeholder="operator@pulse.manufacturing"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor={passwordId} className="block text-xs font-semibold text-slate-300">
                  Security Passkey
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                >
                  Forgot passkey?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition font-mono"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Facility Selector */}
            <div>
              <label htmlFor={facilityId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Manufacturing Facility
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="h-4 w-4" />
                </div>
                <select
                  id={facilityId}
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

            {/* Remember Me Checkbox & Security Clearance */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  id={rememberMeId}
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/40 focus:ring-offset-0 focus:ring-1"
                />
                <label htmlFor={rememberMeId} className="text-xs text-slate-400 cursor-pointer select-none">
                  Remember terminal token
                </label>
              </div>

              <div className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{selectedPersona.clearanceLevel.split(':')[0]}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Cryptographic Credentials...</span>
                </span>
              ) : (
                <>
                  <span>Initialize Cockpit Session</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Link to Register */}
            <div className="text-center pt-2 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-400 transition"
                >
                  Create one
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Industrial Recovery Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0D1322] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Passkey Recovery Protocol</h3>
                <p className="text-xs text-slate-400">PULSE Industrial Security Enclave</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-6">
              <p>
                In accordance with Autonomous Plant Security Level 3/4 standards, passkey resets are cryptographically isolated.
              </p>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="text-cyan-400 font-bold">DEFAULT DEMO PASSKEY:</div>
                <div className="text-slate-200">pulse-secure-2026</div>
              </div>
              <div className="flex items-start gap-2 text-slate-400">
                <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  For registered operators, you can create a new terminal profile on the Register page or select an authorized 1-click persona.
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPassword('pulse-secure-2026');
                  setShowForgotPasswordModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition"
              >
                Autofill Demo Passkey
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthBackground>
  );
};
