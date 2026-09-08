import React from 'react';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight
} from 'lucide-react';
import { RecoveryPlan } from '../../types';

interface RecoveryPlansPageProps {
  plans: RecoveryPlan[];
  onExecutePlan: (planId: string) => void;
  isExecuting?: boolean;
  executedPlanId?: string | null;
}

export const RecoveryPlansPage: React.FC<RecoveryPlansPageProps> = ({
  plans,
  onExecutePlan,
  isExecuting = false,
  executedPlanId = null,
}) => {
  // Default representative candidate plans if none currently active
  const candidatePlans: RecoveryPlan[] = plans.length > 0
    ? plans
    : [
        {
          id: 'PLAN-ALPHA',
          title: 'Option A: Intelligent Machine Reroute & Load Balancing',
          strategy_type: 'REROUTE',
          description: 'Reroute active ORD-102 operations from degraded CNC-02 to redundant CNC-01 workstation with dynamic feed-rate calibration.',
          actions: [
            'Reassign ORD-102 from CNC-02 to CNC-01 (10:15 - 12:45)',
            'Reduce feed rate by 8% to match thermal curve limits',
            'Queue tool inspection routine on CNC-01 prior to start',
          ],
          feasibility: true,
          metrics: {
            delay_hours: 0.4,
            cost_inr: 1420,
            orders_saved: 3,
            orders_violated: 0,
            machine_utilization_pct: 82,
            risk_level: 'Low',
            risk_penalty: 0,
            base_boost: 10,
            score: 94,
            scoring_breakdown: 'Maximal SLA preservation with minimal thermal variance',
          },
          is_recommended: true,
          recommendation_reason: 'Highest confidence score and zero SLA penalty breach',
        },
        {
          id: 'PLAN-BETA',
          title: 'Option B: Overtime Buffer Shift & Split Lot Run',
          strategy_type: 'OVERTIME',
          description: 'Split batch ORD-102 into two smaller lots run concurrently across EDM-01 and CNC-03 with 2h technician overtime buffer.',
          actions: [
            'Divide 300-unit lot: 150 units on CNC-03, 150 units on EDM-01',
            'Authorize 2-hour technician overtime window',
          ],
          feasibility: true,
          metrics: {
            delay_hours: 0.0,
            cost_inr: 3850,
            orders_saved: 3,
            orders_violated: 0,
            machine_utilization_pct: 91,
            risk_level: 'Medium',
            risk_penalty: 5,
            base_boost: 5,
            score: 81,
            scoring_breakdown: 'Overtime overhead introduces moderate cost penalty',
          },
          is_recommended: false,
          recommendation_reason: 'Higher operating cost',
        },
        {
          id: 'PLAN-GAMMA',
          title: 'Option C: Expedited Supplier Sourcing & Buffer Intake',
          strategy_type: 'SPLIT_BUFFER',
          description: 'Authorize emergency hot-shot shipment of semi-finished shaft blanks from secondary qualified supplier.',
          actions: [
            'Trigger emergency PO-8891 for 300 pre-turned blanks',
            'Hold internal machining queue for CNC-03 assembly',
          ],
          feasibility: true,
          metrics: {
            delay_hours: 3.0,
            cost_inr: 6200,
            orders_saved: 1,
            orders_violated: 2,
            machine_utilization_pct: 74,
            risk_level: 'High',
            risk_penalty: 20,
            base_boost: 0,
            score: 68,
            scoring_breakdown: 'Lead time introduces SLA penalty risk',
          },
          is_recommended: false,
          recommendation_reason: 'Delivery lead time breaches customer threshold',
        },
      ];

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none font-sans text-slate-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#4EDEA3]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Autonomous Recovery Plans</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pareto-optimal mitigation options evaluated via 10,000-run Monte Carlo digital twin simulations.
          </p>
        </div>

        {executedPlanId && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#4EDEA3]/15 border border-[#4EDEA3]/30 text-xs font-mono text-[#4EDEA3]">
            <CheckCircle2 className="h-4 w-4" />
            <span>Plan {executedPlanId} Executed &amp; Synced</span>
          </div>
        )}
      </div>

      {/* Grid of Candidate Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {candidatePlans.map((plan) => {
          const isRecommended = plan.is_recommended;
          const isCurrentExecuted = executedPlanId === plan.id;
          const prob = Math.round(plan.metrics?.score ?? 85);
          const cost = plan.metrics?.cost_inr ?? 1420;
          const delayMinutes = Math.round((plan.metrics?.delay_hours ?? 0) * 60);

          return (
            <div
              key={plan.id}
              className={`p-5 rounded-xl bg-[#0B1320] border flex flex-col justify-between transition-all duration-200 ${
                isCurrentExecuted
                  ? 'border-[#4EDEA3] ring-1 ring-[#4EDEA3]/40 shadow-xl'
                  : isRecommended
                  ? 'border-[#00F2FE]/60 shadow-lg'
                  : 'border-[#132238] hover:border-[#1E3557]'
              }`}
            >
              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#132238]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#00F2FE]">{plan.id}</span>
                    {isRecommended && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30">
                        AI RECOMMENDED
                      </span>
                    )}
                    {isCurrentExecuted && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#4EDEA3]/15 text-[#4EDEA3] border border-[#4EDEA3]/30">
                        EXECUTED
                      </span>
                    )}
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-sm font-bold text-white mt-3 leading-snug">{plan.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{plan.description}</p>

                {/* Simulation Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-lg bg-[#0E1726] border border-[#16253D] font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">CONFIDENCE</div>
                    <div className="text-xs font-bold text-[#4EDEA3] mt-0.5">{prob}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">COST DELTA</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">+${cost}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">DELAY</div>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">+{delayMinutes}m</div>
                  </div>
                </div>


                {/* Action steps */}
                <div className="mt-4">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                    Action Sequence:
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {plan.actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00F2FE] mt-1.5 shrink-0" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Execution Action Button */}
              <div className="mt-6 pt-3 border-t border-[#132238]">
                <button
                  type="button"
                  disabled={isExecuting || isCurrentExecuted}
                  onClick={() => onExecutePlan(plan.id)}
                  className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    isCurrentExecuted
                      ? 'bg-[#4EDEA3]/20 text-[#4EDEA3] border border-[#4EDEA3]/40 cursor-default'
                      : isRecommended
                      ? 'bg-[#00F2FE] hover:bg-[#38BDF8] text-[#070D17] shadow-lg'
                      : 'bg-[#132238] hover:bg-[#1E3557] text-white'
                  }`}
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>
                    {isCurrentExecuted
                      ? 'Plan Applied to Digital Twin'
                      : isExecuting
                      ? 'Applying Plan...'
                      : 'Execute Recovery Plan'}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
