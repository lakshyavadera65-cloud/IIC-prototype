import React from 'react';
import { Activity, RefreshCw, MessageSquare, ShieldAlert, Cpu, CheckCircle2, LogOut, UserCheck } from 'lucide-react';
import { FactoryState } from '../types';
import { UserProfile } from './LoginPage';

interface NavbarProps {
  factoryState: FactoryState | null;
  currentUser: UserProfile | null;
  onLogout: () => void;
  onReset: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  factoryState,
  currentUser,
  onLogout,
  onReset,
  onToggleChat,
  isChatOpen,
  isResetting,
}) => {
  const healthScore = factoryState?.health_score ?? 94;
  const activeDisruptions = factoryState?.active_disruptions ?? [];
  const hasDisruption = activeDisruptions.length > 0;

  // Determine health color
  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand & Facility */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black tracking-wider text-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                PULSE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                Autonomous Cockpit
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {factoryState?.factory_info.name || 'Bengaluru Manufacturing Hub'}
            </p>
          </div>
        </div>

        {/* Center: System Telemetry & Health */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Health Score Gauge */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Factory Health</div>
              <div className="text-xs text-slate-300 font-medium">
                {healthScore >= 90 ? 'Nominal Operations' : healthScore >= 70 ? 'Degraded State' : 'Critical Disruption'}
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${getHealthColor(healthScore)} transition-all duration-500 shadow-sm`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${healthScore >= 90 ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${healthScore >= 90 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              </span>
              <span className="text-base font-black tracking-tight">{healthScore.toFixed(1)}%</span>
            </div>
          </div>

          {/* Active Disruption Pill */}
          <div className="hidden md:flex items-center">
            {hasDisruption ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-semibold animate-pulse">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>1 Active Disruption ({activeDisruptions[0].entity})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>System Nominal (0 Alerts)</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Reset Factory Button */}
          <button
            onClick={onReset}
            disabled={isResetting}
            title="Reset Factory to pristine seed data (clears all disruptions & mutations)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition text-xs font-medium active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Factory</span>
          </button>

          {/* Grounded Chat Toggle */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition active:scale-95 ${
              isChatOpen
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/30'
                : 'bg-slate-800/80 hover:bg-slate-700 text-cyan-400 border-cyan-500/40'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Factory Co-Pilot</span>
          </button>

          {/* User Profile & Sign Out */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden xl:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">{currentUser.name}</span>
                <span className="text-[10px] text-cyan-400 truncate max-w-[120px]">{currentUser.role}</span>
              </div>
              <button
                onClick={onLogout}
                title={`Signed in as ${currentUser.name} (${currentUser.role}). Click to Sign Out.`}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700 transition text-xs font-medium active:scale-95"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
