import React, { useState, useId } from 'react';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  Building2,
  Briefcase,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
} from 'lucide-react';
import { AuthBackground } from './AuthBackground';
import { useRouter, Link } from '../router/Router';
import { authService, UserProfile } from '../../services/authService';

interface RegisterPageProps {
  onRegisterSuccess?: (user: UserProfile) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess }) => {
  const { navigate } = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [facility, setFacility] = useState('Bengaluru Industrial Hub (FAC-BLR-01)');
  const [role, setRole] = useState('Operations Engineer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToProtocol, setAgreedToProtocol] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form IDs for accessibility
  const nameId = useId();
  const emailId = useId();
  const facilityId = useId();
  const roleId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const protocolId = useId();

  // Real-time validation checks
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid =
    name.trim().length >= 2 &&
    isEmailValid &&
    hasMinLength &&
    hasNumber &&
    hasUppercase &&
    passwordsMatch &&
    agreedToProtocol;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!isEmailValid) {
      setError('Please enter a valid industrial terminal email address.');
      return;
    }

    if (!hasMinLength || !hasNumber || !hasUppercase) {
      setError('Password does not satisfy industrial security requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreedToProtocol) {
      setError('You must accept the Autonomous Plant Safety & Security Protocols.');
      return;
    }

    setIsLoading(true);

    try {
      const newUser = await authService.register({
        name: name.trim(),
        email: email.trim(),
        passkey: password.trim(),
        role,
        facility,
      });

      setSuccessMessage('Terminal successfully provisioned! Establishing operator session...');

      setTimeout(() => {
        setIsLoading(false);
        if (onRegisterSuccess) {
          onRegisterSuccess(newUser);
        } else {
          // If no direct handler, navigate to dashboard or login
          navigate('/');
        }
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Terminal provisioning failed. Please retry.');
    }
  };

  return (
    <AuthBackground>
      <div className="w-full max-w-xl my-4">
        <div className="bg-[#0D1322]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-xs font-semibold mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Operator Terminal Provisioning</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Create Operations Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Enroll as an authorized operator in the PULSE Factory Intelligence grid.
            </p>
          </div>

          {/* Error & Success Feedback Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-center gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/80 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name & Operator Email in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={nameId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id={nameId}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                    placeholder="Vikram Malhotra"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={emailId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Work Terminal Email <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id={emailId}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full bg-slate-900/90 border rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition font-mono ${
                      email && !isEmailValid
                        ? 'border-rose-500/80 focus:border-rose-500'
                        : 'border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                    }`}
                    placeholder="vikram@pulse.factory"
                  />
                </div>
              </div>
            </div>

            {/* Manufacturing Facility & Operational Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={facilityId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Assigned Facility
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
                      Bengaluru Industrial Hub (FAC-BLR-01)
                    </option>
                    <option value="Munich Precision Facility (FAC-MUC-02)">
                      Munich Precision Facility (FAC-MUC-02)
                    </option>
                    <option value="Austin Advanced Factory (FAC-ATX-03)">
                      Austin Advanced Factory (FAC-ATX-03)
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor={roleId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Operational Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <select
                    id={roleId}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition"
                  >
                    <option value="Operations Engineer">Operations Engineer</option>
                    <option value="Plant Operations Director">Plant Operations Director</option>
                    <option value="Chief Dispatch & Scheduling Lead">Chief Dispatch & Scheduling Lead</option>
                    <option value="AI & Automation Systems Architect">AI & Automation Systems Architect</option>
                    <option value="Quality Assurance Lead">Quality Assurance Lead</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={passwordId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Security Passkey <span className="text-cyan-400">*</span>
                </label>
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
                    placeholder="Min 8 characters"
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

              <div>
                <label htmlFor={confirmPasswordId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Passkey <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id={confirmPasswordId}
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`w-full bg-slate-900/90 border rounded-lg pl-9 pr-10 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition font-mono ${
                      confirmPassword && !passwordsMatch
                        ? 'border-rose-500/80 focus:border-rose-500'
                        : 'border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50'
                    }`}
                    placeholder="Repeat passkey"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((p) => !p)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Validation Feedback Checklist */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 font-mono">
                Security Policy Verification:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {hasMinLength ? (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] shrink-0" />
                  )}
                  <span>At least 8 characters</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 ${
                    hasNumber ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {hasNumber ? (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] shrink-0" />
                  )}
                  <span>Contains a number (0-9)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 ${
                    hasUppercase ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {hasUppercase ? (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] shrink-0" />
                  )}
                  <span>Contains uppercase letter</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 ${
                    passwordsMatch ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                >
                  {passwordsMatch ? (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px] shrink-0" />
                  )}
                  <span>Passkeys match</span>
                </div>
              </div>
            </div>

            {/* Safety Protocol Agreement Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id={protocolId}
                type="checkbox"
                checked={agreedToProtocol}
                onChange={(e) => setAgreedToProtocol(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/40 focus:ring-offset-0 focus:ring-1"
              />
              <label htmlFor={protocolId} className="text-xs text-slate-400 cursor-pointer select-none">
                I agree to adhere to the{' '}
                <span className="text-slate-200 font-semibold">
                  Zero-Trust Autonomous Factory Safety Protocol
                </span>{' '}
                and accept responsibility for operator commands issued from this terminal.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning Terminal Credentials...</span>
                </span>
              ) : (
                <>
                  <span>Create Account & Provision Terminal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Link back to Login */}
            <div className="text-center pt-2 border-t border-slate-800/80">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-400 transition"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </AuthBackground>
  );
};
