import React, { useState } from 'react';
import {
  Settings,
  Building2,
  Sliders,
  RotateCcw,
  CheckCircle2,
  Server,
  Database,
  Lock,
  RefreshCw
} from 'lucide-react';
import { FactoryState } from '../../types';

interface SettingsPageProps {
  factoryState: FactoryState | null;
  onResetFactory: () => void;
  isResetting?: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  factoryState,
  onResetFactory,
  isResetting = false,
}) => {
  const [autonomousThreshold, setAutonomousThreshold] = useState<number>(85);
  const [thermalTolerance, setThermalTolerance] = useState<number>(90);
  const [autoRerouteEnabled, setAutoRerouteEnabled] = useState<boolean>(true);

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none font-sans text-slate-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-300" />
            <h1 className="text-xl font-bold text-white tracking-tight">Plant &amp; System Configuration</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Facility parameters, autonomous mitigation bounds, and digital twin baseline management.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Plant Metadata */}
        <div className="p-5 rounded-xl bg-[#0B1320] border border-[#132238] flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#132238]">
            <Building2 className="h-4 w-4 text-[#00F2FE]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Facility Profile</h2>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-[#132238]/60">
              <span className="text-slate-400">Facility Name</span>
              <span className="font-semibold text-white">CNC Precision Works</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#132238]/60">
              <span className="text-slate-400">Plant Node ID</span>
              <span className="font-mono text-slate-200">CNC-001</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#132238]/60">
              <span className="text-slate-400">Location</span>
              <span className="text-slate-200">Sector 4, Precision Engineering Zone</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#132238]/60">
              <span className="text-slate-400">Backend Engine</span>
              <span className="font-mono text-[#4EDEA3]">FastAPI + Deterministic Solver v1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-400">Telemetry Ingest</span>
              <span className="font-mono text-slate-200">12,400 msg/s • Active Sync</span>
            </div>
          </div>
        </div>

        {/* Autonomous Mitigation Controls */}
        <div className="p-5 rounded-xl bg-[#0B1320] border border-[#132238] flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#132238]">
            <Sliders className="h-4 w-4 text-[#38BDF8]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">Autonomous Policy Bounds</h2>
          </div>

          <div className="flex flex-col gap-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-300 font-medium">Auto-Recovery Confidence Threshold</span>
                <span className="font-mono text-[#00F2FE] font-bold">{autonomousThreshold}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={99}
                value={autonomousThreshold}
                onChange={(e) => setAutonomousThreshold(Number(e.target.value))}
                className="w-full accent-[#00F2FE]"
              />
              <span className="text-[10px] text-slate-500">
                Plans with simulation confidence above this threshold can execute autonomously.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-300 font-medium">Thermal Vibration Cutoff</span>
                <span className="font-mono text-[#FFB95F] font-bold">{thermalTolerance}°C</span>
              </div>
              <input
                type="range"
                min={70}
                max={110}
                value={thermalTolerance}
                onChange={(e) => setThermalTolerance(Number(e.target.value))}
                className="w-full accent-[#FFB95F]"
              />
              <span className="text-[10px] text-slate-500">
                Spindle temperature triggering automatic Sentinel excursion warning.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#132238]/60">
              <span className="text-slate-300 font-medium">Enable Autonomous Rerouting</span>
              <input
                type="checkbox"
                checked={autoRerouteEnabled}
                onChange={(e) => setAutoRerouteEnabled(e.target.checked)}
                className="h-4 w-4 rounded bg-[#0E1726] border-[#182840] accent-[#00F2FE]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Baseline Reset Section */}
      <div className="p-5 rounded-xl bg-[#0B1320] border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-red-400" />
            <span>Reset Factory Baseline</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Clears all simulated disruptions, restores nominal machine cycle states, and resets order progression to pristine baseline while preserving customized machines.
          </p>
        </div>

        <button
          type="button"
          disabled={isResetting}
          onClick={onResetFactory}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 text-xs font-bold transition self-start md:self-auto cursor-pointer"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting...' : 'Reset Factory Baseline'}</span>
        </button>
      </div>
    </div>
  );
};
