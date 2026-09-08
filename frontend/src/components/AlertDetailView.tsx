import React from 'react';
import { DisruptionEvent, ImpactReport, ROOT_CAUSE_BENCHMARKS } from '../types';
import { ShieldAlert, AlertTriangle, ArrowRight, Network, Clock, DollarSign, BarChart3 } from 'lucide-react';

interface AlertDetailViewProps {
  event: DisruptionEvent | null;
  impact: ImpactReport | null;
  onOpenGraph: () => void;
}

export const AlertDetailView: React.FC<AlertDetailViewProps> = ({
  event,
  impact,
  onOpenGraph,
}) => {
  if (!event || !impact) return null;

  const categoryKey = event.root_cause_category || 'equipment_failure';
  const benchmark = event.root_cause_benchmark || ROOT_CAUSE_BENCHMARKS[categoryKey] || ROOT_CAUSE_BENCHMARKS.equipment_failure;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-rose-500/40 p-4 shadow-xl shadow-rose-950/20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 animate-pulse">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wide text-white">
                Active Incident Intelligence
              </h2>
              <span className="text-[10px] font-mono uppercase bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-800 font-bold">
                {event.severity} Severity
              </span>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${benchmark.bg_class} ${benchmark.border_class} ${benchmark.color_class}`}>
                {benchmark.label} ({benchmark.share_pct})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sentinel Extraction & Deterministic Graph Ripple Trace
            </p>
          </div>
        </div>

        {/* View Graph Action */}
        <button
          onClick={onOpenGraph}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700 text-xs font-semibold transition active:scale-95 shadow-sm"
        >
          <Network className="h-3.5 w-3.5" />
          <span>Inspect Dependency Graph (React Flow)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        {/* What Happened? */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>1. What Happened? (Sentinel Analysis)</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${benchmark.border_class} ${benchmark.bg_class} ${benchmark.color_class} font-mono`}>
                {benchmark.share_pct} Downtime Share
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300 italic font-mono text-[11px]">
                "{event.source_text}"
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">Entity:</span>
                  <strong className="text-slate-200">{event.entity}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">Type:</span>
                  <strong className="text-slate-200">{event.type.replace('_', ' ')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">Downtime:</span>
                  <strong className="text-rose-400">{event.duration_hours} hours</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans">Event ID:</span>
                  <strong className="text-slate-400">{event.id}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Real-World Industry Downtime Benchmark Box */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/90 text-[10.5px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
              <BarChart3 className="h-3 w-3 text-cyan-400" />
              <span>Real-World Empirical Industry Pattern:</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              {benchmark.stoppage_share}
            </p>
            <p className="text-emerald-400 font-sans text-[10px]">
              <strong className="text-emerald-300">Early Signature:</strong> {benchmark.early_signature}
            </p>
          </div>
        </div>

        {/* Why Does It Matter? */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
            <Network className="h-3.5 w-3.5" />
            <span>2. Why Does It Matter? (Impact Ripple Chain)</span>
          </div>

          <p className="text-slate-300 leading-relaxed mb-2 text-[11px]">
            {impact.root_cause_summary}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] border-t border-slate-800/80">
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">Affected Ops:</span>
              <strong className="text-amber-400">{impact.affected_operations.length} Stages</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">At-Risk Orders:</span>
              <strong className="text-rose-400">{impact.at_risk_orders.join(', ') || 'None'}</strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block font-sans">SLA Violations:</span>
              <strong className="text-rose-400">{impact.deadline_violations.length} Critical</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
