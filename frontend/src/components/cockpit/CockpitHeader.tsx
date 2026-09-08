import React, { useState, useEffect } from 'react';
import { PulseLogo } from '../branding/PulseLogo';
import { UserProfile } from '../../services/authService';

interface CockpitHeaderProps {
  healthScore: number;
  currentUser: UserProfile | null;
  onTriggerScenario: (text: string, scenarioId: string) => void;
  onResetFactory: () => void;
  onLogout: () => void;
  onToggleChat?: () => void;
  isTriggering?: boolean;
  isResetting?: boolean;
  activeScenarioId?: string | null;
}

export const CockpitHeader: React.FC<CockpitHeaderProps> = ({
  healthScore,
  currentUser,
  onTriggerScenario,
  onResetFactory,
  onLogout,
  onToggleChat,
  isTriggering = false,
  isResetting = false,
  activeScenarioId = null,
}) => {
  // Live UTC Clock
  const [utcTime, setUtcTime] = useState<string>('');
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${mins}:${secs} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Gauge calculations
  const normalizedHealth = Math.max(0, Math.min(100, healthScore));
  const healthColor =
    normalizedHealth >= 90
      ? 'text-secondary stroke-secondary'
      : normalizedHealth >= 70
      ? 'text-tertiary stroke-tertiary'
      : 'text-error stroke-error';

  return (
    <header className="fixed top-0 left-64 right-0 z-40 bg-surface-container-low border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.5)] select-none">
      <div className="h-16 w-full px-space-lg flex items-center justify-between gap-space-md">
        {/* Left: Brand & Telemetry Badges */}
        <div className="flex items-center gap-space-lg">
          <PulseLogo size="sm" taglineText="Autonomous OS" />

          <div className="hidden lg:block h-6 w-px bg-surface-variant" />

          {/* Time & Factory Telemetry */}
          <div className="hidden md:flex items-center gap-space-xs font-mono">
            {/* UTC Clock */}
            <div className="px-space-sm py-space-2xs bg-surface-container rounded flex items-center gap-space-xs border border-outline-variant/30">
              <span className="material-symbols-outlined text-primary text-[14px]">schedule</span>
              <span className="text-mono-code text-on-surface">{utcTime || '14:28:09 UTC'}</span>
            </div>

            {/* Cell Active Status */}
            <div className="px-space-sm py-space-2xs bg-surface-container rounded flex items-center gap-space-xs border border-outline-variant/30">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <span className="text-label-caps text-on-surface-variant">PUNE-04:</span>
              <span className="text-mono-code text-secondary font-semibold">ACTIVE AUTONOMOUS</span>
            </div>

            {/* Sensor Ingest Speed */}
            <div className="hidden xl:flex px-space-sm py-space-2xs bg-surface-container rounded items-center gap-space-xs border border-outline-variant/30">
              <span className="material-symbols-outlined text-on-surface-variant text-[14px]">sensors</span>
              <span className="text-mono-code text-on-surface-variant">12.4k msg/s</span>
            </div>
          </div>
        </div>

        {/* Right: Health Gauge, Scenario Triggers, Reset & Profile */}
        <div className="flex items-center gap-space-md">
          {/* Concentric Circular SVG Factory Health Gauge */}
          <div className="flex items-center gap-space-sm px-space-md py-space-2xs bg-surface-container rounded border border-outline-variant/30 shadow-[0_0_12px_rgba(78,222,163,0.12)]">
            <div className="relative flex items-center justify-center w-9 h-9">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-high stroke-current"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeWidth="3"
                />
                <path
                  className={`${healthColor} transition-all duration-700`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  strokeDasharray={`${normalizedHealth}, 100`}
                  strokeLinecap="square"
                  strokeWidth="3"
                />
              </svg>
              <span className="absolute font-mono text-[9px] text-secondary font-bold">
                {Math.round(normalizedHealth)}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] text-on-surface-variant leading-none uppercase">
                Factory Health
              </span>
              <span className={`font-mono text-mono-metric-md font-bold leading-tight ${healthColor}`}>
                {normalizedHealth.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Quick Simulation Triggers */}
          <div className="hidden sm:flex items-center gap-space-2xs bg-surface-container-lowest p-space-2xs rounded border border-outline-variant/30">
            <button
              type="button"
              disabled={isTriggering}
              onClick={() => onTriggerScenario('CNC-02 spindle gearbox failure with severe thermal vibration', 'SCENARIO_A')}
              className={`px-space-sm py-space-2xs rounded transition-all flex items-center gap-space-2xs text-left ${
                activeScenarioId === 'SCENARIO_A'
                  ? 'bg-surface-container-high text-on-surface ring-1 ring-primary shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant'
              }`}
            >
              <span className="font-mono text-label-caps bg-surface-container-high px-space-2xs py-0.5 rounded text-primary font-bold">
                SIM-A
              </span>
              <span className="text-body-sm whitespace-nowrap">CNC-02 Failure</span>
            </button>

            <button
              type="button"
              disabled={isTriggering}
              onClick={() => onTriggerScenario('Shipment delay on incoming Ti-6Al-4V titanium alloy billets', 'SCENARIO_B')}
              className={`px-space-sm py-space-2xs rounded transition-all flex items-center gap-space-2xs text-left ${
                activeScenarioId === 'SCENARIO_B'
                  ? 'bg-surface-container-high text-on-surface ring-1 ring-tertiary shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant'
              }`}
            >
              <span className="font-mono text-label-caps bg-surface-container-high px-space-2xs py-0.5 rounded text-tertiary font-bold">
                SIM-B
              </span>
              <span className="text-body-sm whitespace-nowrap">Shipment Delay</span>
            </button>

            <button
              type="button"
              disabled={isTriggering}
              onClick={() => onTriggerScenario('Critical inventory shortage: raw material depleted below safety buffer', 'SCENARIO_C')}
              className={`px-space-sm py-space-2xs rounded transition-all flex items-center gap-space-2xs text-left ${
                activeScenarioId === 'SCENARIO_C'
                  ? 'bg-surface-container-high text-on-surface ring-1 ring-error shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant'
              }`}
            >
              <span className="font-mono text-label-caps bg-surface-container-high px-space-2xs py-0.5 rounded text-error font-bold">
                SIM-C
              </span>
              <span className="text-body-sm whitespace-nowrap">Inventory Shortage</span>
            </button>
          </div>

          {/* Reset Factory Button */}
          <button
            type="button"
            onClick={onResetFactory}
            disabled={isResetting}
            title="Reset Factory to initial nominal baseline"
            className="flex items-center gap-space-xs px-space-sm py-space-2xs bg-error-container text-on-error-container rounded hover:bg-error hover:text-on-error transition-all shadow-[0_0_8px_rgba(255,180,171,0.2)] disabled:opacity-50 active:scale-95"
          >
            <span className={`material-symbols-outlined text-[16px] ${isResetting ? 'animate-spin' : ''}`}>
              restart_alt
            </span>
            <span className="font-mono text-label-caps uppercase font-bold hidden md:inline">
              Reset Factory
            </span>
          </button>

          {/* Co-Pilot Chat Toggle Button */}
          {onToggleChat && (
            <button
              type="button"
              onClick={onToggleChat}
              title="Open Grounded Factory Intelligence Co-Pilot"
              className="flex items-center gap-1.5 px-space-sm py-space-2xs bg-surface-container hover:bg-surface-container-high text-primary border border-primary/30 rounded transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
              <span className="font-mono text-label-caps uppercase font-bold hidden xl:inline">
                Co-Pilot
              </span>
            </button>
          )}

          <div className="h-6 w-px bg-surface-variant" />

          {/* Operator Profile / Sign Out Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-mono font-bold text-xs shadow-sm hover:ring-2 hover:ring-primary/50 transition"
              title={currentUser ? `${currentUser.name} (${currentUser.role})` : 'Operator Profile'}
            >
              {currentUser?.avatarInitials || 'OP'}
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-11 w-60 bg-surface-container border border-outline-variant/40 rounded shadow-2xl p-3 flex flex-col gap-2 z-50 animate-fade-in font-sans">
                <div className="border-b border-outline-variant/30 pb-2">
                  <div className="text-xs font-bold text-on-surface truncate">
                    {currentUser?.name || 'Operator'}
                  </div>
                  <div className="text-[10px] text-primary truncate font-mono">
                    {currentUser?.role || 'Plant Operations Director'}
                  </div>
                  <div className="text-[10px] text-on-surface-variant font-mono truncate mt-0.5">
                    {currentUser?.clearanceLevel || 'Level 4: Full Autonomous Override'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-error hover:bg-error-container hover:text-on-error-container transition font-mono font-bold"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out Terminal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
