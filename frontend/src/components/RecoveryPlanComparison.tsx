import React, { useState } from 'react';
import { RecoveryPlan } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  IndianRupee,
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';

interface RecoveryPlanComparisonProps {
  plans: RecoveryPlan[];
  onExecutePlan: (planId: string) => void;
  isExecuting: boolean;
  executedPlanId?: string | null;
}

export const RecoveryPlanComparison: React.FC<RecoveryPlanComparisonProps> = ({
  plans,
  onExecutePlan,
  isExecuting,
  executedPlanId,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  if (!plans || plans.length === 0) return null;

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800/90 p-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
              Autonomous Recovery Plans & Oracle Simulation
            </h2>
            <span className="text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/60">
              Multi-Criteria Ranked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Deterministic simulation evaluating delay, cost, SLA protection, and machine headroom.
          </p>
        </div>

        <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
          Ranked by Weighted Trade-Off Decision Score
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isRecommended = plan.is_recommended;
          const isExecuted = executedPlanId === plan.id;
          const metrics = plan.metrics;

          return (
            <div
              key={plan.id}
              className={`relative rounded-xl p-4 border flex flex-col justify-between transition-all duration-300 ${
                isExecuted
                  ? 'bg-emerald-950/20 border-emerald-500 shadow-xl shadow-emerald-900/20 ring-1 ring-emerald-500/50'
                  : isRecommended
                  ? 'bg-gradient-to-b from-slate-900 to-[#0F172A] border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Recommended Badge / Executed Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                  {plan.id}
                </span>

                {isExecuted ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/60 animate-pulse">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Active In Production
                  </span>
                ) : isRecommended ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/50 shadow-sm shadow-emerald-500/30">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    Recommended Strategy
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    Alternative Plan
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div className="mb-3">
                <h3 className="text-sm font-bold text-white mb-1 leading-snug">{plan.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{plan.description}</p>
              </div>

              {/* Recommendation Grounded Reason if recommended */}
              {isRecommended && plan.recommendation_reason && (
                <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-200 leading-relaxed">
                  <strong>Why this plan won:</strong> {plan.recommendation_reason}
                </div>
              )}

              {/* Simulation Metrics 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2 mb-3 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs">
                {/* Delay */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Projected Delay</span>
                  <span className={`text-sm font-bold flex items-center gap-1 ${metrics.delay_hours <= 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <Clock className="h-3 w-3" />
                    {metrics.delay_hours}h
                  </span>
                </div>

                {/* Cost */}
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Incremental Cost</span>
                  <span className="text-sm font-bold text-cyan-300 flex items-center">
                    ₹{metrics.cost_inr.toLocaleString()}
                  </span>
                </div>

                {/* Orders Saved */}
                <div className="flex flex-col pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Orders Saved</span>
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    {metrics.orders_saved} Saved
                  </span>
                </div>

                {/* Utilization */}
                <div className="flex flex-col pt-1 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-sans">Peak Utilization</span>
                  <span className="text-sm font-bold text-slate-200">
                    {metrics.machine_utilization_pct.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Transparent Scoring Formula Pill */}
              <div className="mb-4 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                <div className="flex items-center justify-between text-slate-300 font-bold mb-0.5">
                  <span>Decision Score:</span>
                  <span className="text-cyan-400 text-xs">{metrics.score} / 100 pts</span>
                </div>
                <div className="truncate opacity-80" title={metrics.scoring_breakdown}>
                  {metrics.scoring_breakdown}
                </div>
              </div>

              {/* Execute Plan CTA Button */}
              <button
                onClick={() => onExecutePlan(plan.id)}
                disabled={isExecuting || isExecuted}
                className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-all duration-200 active:scale-98 flex items-center justify-center gap-2 ${
                  isExecuted
                    ? 'bg-emerald-800 text-emerald-100 cursor-default'
                    : isRecommended
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold shadow-lg shadow-emerald-500/25'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isExecuted ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Plan Executed & Active</span>
                  </>
                ) : isExecuting ? (
                  <span>Re-allocating Factory State...</span>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Execute {plan.id} Live</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
