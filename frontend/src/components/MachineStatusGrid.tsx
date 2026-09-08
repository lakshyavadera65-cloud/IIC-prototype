import React from 'react';
import { MachineState } from '../types';
import { Cpu, Zap, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MachineStatusGridProps {
  machines: MachineState[];
  activeDisruptedEntity?: string;
}

export const MachineStatusGrid: React.FC<MachineStatusGridProps> = ({
  machines,
  activeDisruptedEntity,
}) => {
  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800/90 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
            Workstation Digital Twins (Telemetry)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          6 Active Manufacturing Assets
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {machines.map((mach) => {
          const isFailed = mach.status === 'failed';
          const isDisrupted = activeDisruptedEntity === mach.id;
          const util = mach.current_utilization;

          // Utilization color
          const getUtilColor = (u: number) => {
            if (isFailed) return 'bg-rose-500';
            if (u > 90) return 'bg-amber-500';
            if (u > 70) return 'bg-cyan-500';
            return 'bg-emerald-500';
          };

          return (
            <div
              key={mach.id}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                isFailed
                  ? 'bg-rose-950/20 border-rose-500/60 ring-1 ring-rose-500/30'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200">{mach.id}</span>
                  <span className="text-[10px] text-slate-500 font-mono">[{mach.type}]</span>
                </div>

                {isFailed ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/90 px-2 py-0.5 rounded border border-rose-800 animate-pulse">
                    <ShieldAlert className="h-3 w-3" />
                    Failed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                    <CheckCircle2 className="h-3 w-3" />
                    Online
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 truncate mb-2.5">
                {mach.name}
              </div>

              {/* Utilization Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[11px] font-mono mb-1">
                  <span className="text-slate-400 text-[10px] uppercase font-sans">Utilization</span>
                  <span className={`font-bold ${isFailed ? 'text-rose-400' : 'text-slate-200'}`}>
                    {util.toFixed(0)}% / 100%
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getUtilColor(util)}`}
                    style={{ width: `${Math.min(100, Math.max(5, util))}%` }}
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-400">
                <div>
                  <span className="text-slate-500 block">Throughput:</span>
                  <strong className="text-slate-300">{mach.capacity_per_hour} units/hr</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Rate / OT:</span>
                  <strong className="text-slate-300">₹{mach.operating_cost_per_hour} / ₹{mach.overtime_cost_per_hour}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
