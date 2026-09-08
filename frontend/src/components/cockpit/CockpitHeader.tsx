import React, { useState, useEffect } from 'react';
import { PulseLogo } from '../branding/PulseLogo';
import { UserProfile } from '../../services/authService';
import { Bell, ChevronDown, Search, LogOut, RotateCcw, Play, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

interface CockpitHeaderProps {
  currentUser: UserProfile | null;
  onTriggerScenario: (text: string, scenarioId: string) => void;
  onResetFactory: () => void;
  onLogout: () => void;
  onToggleChat?: () => void;
  isTriggering?: boolean;
  isResetting?: boolean;
  activeScenarioId?: string | null;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  unreadAlertCount?: number;
}

export const CockpitHeader: React.FC<CockpitHeaderProps> = ({
  currentUser,
  onTriggerScenario,
  onResetFactory,
  onLogout,
  onToggleChat,
  isTriggering = false,
  isResetting = false,
  activeScenarioId = null,
  searchQuery = '',
  onSearchChange,
  unreadAlertCount = 1,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showSimMenu, setShowSimMenu] = useState<boolean>(false);
  const [headerTime, setHeaderTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setHeaderTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-[#070D17] border-b border-[#132238] px-6 flex items-center justify-between select-none">
      {/* 1. Left: Brand Mark & Subtitle */}
      <div className="flex items-center gap-6 shrink-0 min-w-[240px]">
        <PulseLogo size="sm" showTagline={true} taglineText="Factory Operations Intelligence" />
      </div>

      {/* 2. Center: Global Search Bar matching reference image */}
      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search machines, orders, or anything..."
            className="w-full h-9 pl-10 pr-20 rounded-full bg-[#0B1320] border border-[#182840] text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00F2FE] focus:ring-1 focus:ring-[#00F2FE]/40 transition"
          />
          <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
            <kbd className="text-[10px] font-mono text-slate-400 bg-[#132238] border border-[#1E3354] px-1.5 py-0.5 rounded">
              Ctrl + K
            </kbd>
          </div>
        </div>
      </div>

      {/* 3. Right: Notifications, Factory Online Status, User Profile */}
      <div className="flex items-center gap-3.5 shrink-0">
        {/* Quick Simulation Trigger Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSimMenu((prev) => !prev)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B1320] border border-[#182840] hover:border-[#1E3557] text-xs text-slate-300 transition"
            title="Simulate Disruption Scenarios"
          >
            <Play className={`h-3 w-3 text-[#00F2FE] ${isTriggering ? 'animate-spin' : ''}`} />
            <span className="font-medium text-[11px]">Simulate</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showSimMenu && (
            <div className="absolute right-0 top-10 w-72 bg-[#0B1320] border border-[#182840] rounded-lg shadow-2xl p-2 z-50 animate-fade-in flex flex-col gap-1">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 border-b border-[#132238]">
                Deterministic Disruption Tests
              </div>
              <button
                type="button"
                disabled={isTriggering}
                onClick={() => {
                  setShowSimMenu(false);
                  onTriggerScenario('CNC-02 spindle gearbox failure with severe thermal vibration', 'SCENARIO_A');
                }}
                className={`w-full text-left px-2.5 py-2 rounded text-xs transition flex items-center justify-between ${
                  activeScenarioId === 'SCENARIO_A' ? 'bg-[#00F2FE]/10 text-[#00F2FE]' : 'hover:bg-[#132238] text-slate-200'
                }`}
              >
                <div>
                  <div className="font-medium">SIM-A: CNC-02 Failure</div>
                  <div className="text-[10px] text-slate-400">Spindle gearbox thermal vibration</div>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">CRITICAL</span>
              </button>

              <button
                type="button"
                disabled={isTriggering}
                onClick={() => {
                  setShowSimMenu(false);
                  onTriggerScenario('Shipment delay on incoming Ti-6Al-4V titanium alloy billets', 'SCENARIO_B');
                }}
                className={`w-full text-left px-2.5 py-2 rounded text-xs transition flex items-center justify-between ${
                  activeScenarioId === 'SCENARIO_B' ? 'bg-[#FFB95F]/10 text-[#FFB95F]' : 'hover:bg-[#132238] text-slate-200'
                }`}
              >
                <div>
                  <div className="font-medium">SIM-B: Material Delay</div>
                  <div className="text-[10px] text-slate-400">Ti-6Al-4V shipment delayed 48h</div>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">WARNING</span>
              </button>

              <button
                type="button"
                disabled={isTriggering}
                onClick={() => {
                  setShowSimMenu(false);
                  onTriggerScenario('Critical inventory shortage: raw material depleted below safety buffer', 'SCENARIO_C');
                }}
                className={`w-full text-left px-2.5 py-2 rounded text-xs transition flex items-center justify-between ${
                  activeScenarioId === 'SCENARIO_C' ? 'bg-[#FF5C5C]/10 text-[#FF5C5C]' : 'hover:bg-[#132238] text-slate-200'
                }`}
              >
                <div>
                  <div className="font-medium">SIM-C: Stock Depletion</div>
                  <div className="text-[10px] text-slate-400">Alloy stock below safety buffer</div>
                </div>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">STOCKOUT</span>
              </button>

              <div className="border-t border-[#132238] mt-1 pt-1">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => {
                    setShowSimMenu(false);
                    onResetFactory();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Factory Baseline</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Co-Pilot Chat Button */}
        {onToggleChat && (
          <button
            type="button"
            onClick={onToggleChat}
            className="p-2 rounded-full bg-[#0B1320] border border-[#182840] hover:border-[#1E3557] text-slate-300 hover:text-[#00F2FE] transition"
            title="Open Factory Intelligence Assistant"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        )}

        {/* Notifications Bell matching reference */}
        <div className="relative">
          <button
            type="button"
            className="relative p-2 rounded-full bg-[#0B1320] border border-[#182840] hover:border-[#1E3557] text-slate-300 hover:text-white transition"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-[#FF5C5C] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadAlertCount}
              </span>
            )}
          </button>
        </div>

        {/* Real-time Shop Floor Clock Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1320] border border-[#182840] shadow-sm">
          <Clock className="h-3.5 w-3.5 text-[#00F2FE]" />
          <span className="font-mono text-xs font-semibold text-slate-100 tracking-wide">
            {headerTime || '--:--:--'}
          </span>
        </div>

        {/* Factory Status Pill matching reference: "● Factory Online" */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B1320] border border-[#182840]">
          <span className="h-2 w-2 rounded-full bg-[#4EDEA3] animate-pulse" />
          <span className="text-xs font-medium text-slate-200">Factory Online</span>
        </div>

        {/* User Profile Pill matching reference: "ST Snehansh Tripathy v" */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full bg-[#0B1320] border border-[#182840] hover:border-[#1E3557] transition"
          >
            <div className="h-6 w-6 rounded-full bg-[#0284C7] text-white font-mono text-[11px] font-bold flex items-center justify-center">
              {currentUser?.avatarInitials || 'ST'}
            </div>
            <span className="text-xs font-medium text-slate-200 hidden sm:inline">
              {currentUser?.name || 'Snehansh Tripathy'}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-11 w-64 bg-[#0B1320] border border-[#182840] rounded-lg shadow-2xl p-3 z-50 animate-fade-in font-sans">
              <div className="border-b border-[#132238] pb-2">
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {currentUser?.name || 'Snehansh Tripathy'}
                </div>
                <div className="text-[11px] text-[#00F2FE] truncate mt-0.5">
                  {currentUser?.role || 'Plant Operations Director'}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  CNC Precision Works • Plant CNC-001
                </div>
              </div>

              <div className="py-2 flex flex-col gap-1 border-b border-[#132238]">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => {
                    setShowProfileMenu(false);
                    onResetFactory();
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-[#132238] hover:text-white transition"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                  <span>Reset Factory State</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="mt-2 w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-[#FF5C5C] hover:bg-red-500/10 transition font-medium"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

