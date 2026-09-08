import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Cpu,
  TrendingDown,
  ShieldCheck,
  Play,
  ArrowRight,
  Info,
  RefreshCw
} from 'lucide-react';
import { Disruption, PipelineResult } from '../../types';

interface AlertsPageProps {
  activeDisruption: Disruption | null | undefined;
  pipelineResult: PipelineResult | null;
  onTriggerScenario: (text: string, scenarioId: string) => void;
  onNavigateToRecovery: () => void;
  isTriggering?: boolean;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  activeDisruption,
  pipelineResult,
  onTriggerScenario,
  onNavigateToRecovery,
  isTriggering = false,
}) => {
  // Static history log of recent factory events
  const incidentHistory = [
    {
      id: 'INC-2025-084',
      severity: 'Critical',
      machine: 'CNC-02',
      issue: 'Spindle Bearing Thermal Exceedance (>95°C)',
      time: '10:12:44 AM UTC',
      impact: '3 Orders Delayed, SLA Penalty: $18,400',
      status: activeDisruption ? 'Active' : 'Resolved',
      recommendation: 'Autonomous reroute of ORD-102 to CNC-01 with 0.8mm speed step-down.',
    },
    {
      id: 'INC-2025-083',
      severity: 'Warning',
      machine: 'CELL-04',
      issue: 'Raw Material Delivery Delay: Ti-6Al-4V Billet Supply',
      time: '09:45:12 AM UTC',
      impact: 'ORD-104 buffering risk',
      status: 'Resolved',
      recommendation: 'Buffer consumption sequence modified; standby buffer allocated.',
    },
    {
      id: 'INC-2025-082',
      severity: 'Low',
      machine: 'STORAGE-BAY-A',
      issue: 'Coolant Pressure Variance on Line 3',
      time: '08:32:05 AM UTC',
      impact: 'Zero schedule deviation',
      status: 'Resolved',
      recommendation: 'Pressure valve auto-calibrated to 4.2 bar.',
    },
    {
      id: 'INC-2025-081',
      severity: 'Info',
      machine: 'CNC-01',
      issue: 'Scheduled Preventive Spindle Calibration',
      time: '07:18:20 AM UTC',
      impact: 'Routine Maintenance',
      status: 'Resolved',
      recommendation: 'Completed within scheduled window.',
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none font-sans text-slate-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#FFB95F]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Active Incidents &amp; Disruption Log</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time incident detection, multi-order blast radius assessment, and autonomous recovery recommendations.
          </p>
        </div>

        {/* Quick Simulation Triggers */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium hidden md:inline">Simulate Disruption:</span>
          <button
            type="button"
            disabled={isTriggering}
            onClick={() => onTriggerScenario('CNC-02 spindle gearbox failure with severe thermal vibration', 'SCENARIO_A')}
            className="px-3 py-1.5 rounded-lg bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 text-[#FF5C5C] hover:bg-[#FF5C5C]/25 text-xs font-medium transition"
          >
            SIM-A (CNC-02)
          </button>
          <button
            type="button"
            disabled={isTriggering}
            onClick={() => onTriggerScenario('Shipment delay on incoming Ti-6Al-4V titanium alloy billets', 'SCENARIO_B')}
            className="px-3 py-1.5 rounded-lg bg-[#FFB95F]/15 border border-[#FFB95F]/30 text-[#FFB95F] hover:bg-[#FFB95F]/25 text-xs font-medium transition"
          >
            SIM-B (Delay)
          </button>
          <button
            type="button"
            disabled={isTriggering}
            onClick={() => onTriggerScenario('Critical inventory shortage: raw material depleted below safety buffer', 'SCENARIO_C')}
            className="px-3 py-1.5 rounded-lg bg-[#FF5C5C]/15 border border-[#FF5C5C]/30 text-[#FF5C5C] hover:bg-[#FF5C5C]/25 text-xs font-medium transition"
          >
            SIM-C (Stockout)
          </button>
        </div>
      </div>

      {/* Active Incident Banner if one exists */}
      {activeDisruption ? (
        <div className="p-5 rounded-xl bg-[#0E1726] border border-[#FF5C5C]/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#FF5C5C]/15 text-[#FF5C5C] shrink-0 border border-[#FF5C5C]/30">
              <AlertCircle className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FF5C5C]/20 text-[#FF5C5C]">
                  ACTIVE DISRUPTION
                </span>
                <span className="font-mono text-xs text-white font-bold">{activeDisruption.entity}</span>
                <span className="text-xs text-slate-400">• {activeDisruption.type}</span>
              </div>
              <p className="text-sm font-semibold text-white mt-1">

                {activeDisruption.description || 'Machine operational excursion detected by Sentinel telemetry monitor.'}
              </p>
              {pipelineResult?.impact && (
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span>
                    Orders at risk: <strong className="text-amber-400">{pipelineResult.impact.at_risk_orders.length}</strong>
                  </span>
                  <span>
                    Direct impact: <strong className="text-white">{pipelineResult.impact.disrupted_entity}</strong>
                  </span>

                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToRecovery}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00F2FE] hover:bg-[#38BDF8] text-[#070D17] font-bold text-xs transition shrink-0 cursor-pointer shadow-md"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Review Recovery Plans</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#0B1320] border border-[#132238] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#4EDEA3]/15 text-[#4EDEA3]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">All Workstations Nominal</div>
              <div className="text-[11px] text-slate-400">
                No unresolved disruptions detected. Autonomous Sentinel is continuously scanning.
              </div>
            </div>
          </div>
          <span className="text-xs font-mono text-[#4EDEA3] font-bold px-2 py-1 rounded bg-[#4EDEA3]/10">
            NOMINAL
          </span>
        </div>
      )}

      {/* Incidents Table Log */}
      <div className="rounded-xl bg-[#0B1320] border border-[#132238] overflow-hidden">
        <div className="p-4 border-b border-[#132238] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">Incident History &amp; Root Cause Analysis</h2>
          <span className="text-[11px] text-slate-400 font-mono">Last 24 Hours</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-[#132238] bg-[#0E1726]/60 font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">INCIDENT ID</th>
                <th className="py-3 px-4 font-semibold">SEVERITY</th>
                <th className="py-3 px-4 font-semibold">WORKSTATION</th>
                <th className="py-3 px-4 font-semibold">DETECTED ISSUE</th>
                <th className="py-3 px-4 font-semibold">IMPACT</th>
                <th className="py-3 px-4 font-semibold">AI RECOMMENDATION</th>
                <th className="py-3 px-4 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132238]">
              {incidentHistory.map((inc) => {
                const isCritical = inc.severity === 'Critical';
                const isWarning = inc.severity === 'Warning';

                return (
                  <tr key={inc.id} className="hover:bg-[#0E1726] transition">
                    <td className="py-3 px-4 font-mono font-bold text-white">{inc.id}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isCritical
                            ? 'bg-[#FF5C5C]/20 text-[#FF5C5C]'
                            : isWarning
                            ? 'bg-[#FFB95F]/20 text-[#FFB95F]'
                            : 'bg-[#38BDF8]/20 text-[#38BDF8]'
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#00F2FE]">{inc.machine}</td>
                    <td className="py-3 px-4 text-slate-200">
                      <div>{inc.issue}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{inc.time}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{inc.impact}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">{inc.recommendation}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          inc.status === 'Active'
                            ? 'bg-[#FF5C5C]/20 text-[#FF5C5C] animate-pulse'
                            : 'bg-[#4EDEA3]/15 text-[#4EDEA3]'
                        }`}
                      >
                        {inc.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
