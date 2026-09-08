import React from 'react';
import {
  Sparkles,
  Search,
  Share2,
  Workflow,
  Cpu,
  CheckCircle2,
  Clock,
  ArrowDown,
  Layers,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { PipelineResult } from '../../types';

interface AgentsPageProps {
  pipelineResult: PipelineResult | null;
  isRunning?: boolean;
  revealedStageIndex?: number;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({
  pipelineResult,
  isRunning = false,
  revealedStageIndex = 4,
}) => {
  const stages = [
    {
      id: 'sentinel',
      name: 'SENTINEL',
      role: 'Anomaly Detection & Ingest Telemetry Filter',
      engine: 'Deterministic Rule Engine + Kalman Filter',
      description: 'Scans high-frequency machine vibration, thermal curves, and cycle drift to detect excursions below safety margins.',
      status: revealedStageIndex >= 1 ? 'Executed' : 'Idle',
      output: pipelineResult?.event
        ? `Entity: ${pipelineResult.event.entity} • Type: ${pipelineResult.event.type} • Severity: ${pipelineResult.event.severity}`
        : 'Nominal telemetry stream. Excursions threshold: <0.02mm runout.',
      icon: Search,
      accentColor: '#00F2FE',
    },
    {
      id: 'impact',
      name: 'IMPACT',
      role: 'Blast Radius & Dependency Graph Solver',
      engine: 'Directed Acyclic Graph (DAG) Traverser',
      description: 'Traverses order bill-of-materials and machine schedule routing to calculate ripple effect delays and customer SLA penalties.',
      status: revealedStageIndex >= 2 ? 'Executed' : 'Idle',
      output: pipelineResult?.impact
        ? `${pipelineResult.impact.at_risk_orders.length} Orders impacted • Direct: ${pipelineResult.impact.disrupted_entity}`
        : 'Zero active schedule clashes. Dependency graph fully synchronized.',
      icon: Share2,
      accentColor: '#38BDF8',
    },
    {
      id: 'strategist',
      name: 'STRATEGIST',
      role: 'Candidate Recovery Plan Synthesizer',
      engine: 'Constrained Heuristic Optimizer',
      description: 'Generates non-conflicting mitigation candidates: machine rerouting, speed step-down, and overtime buffer allocation.',
      status: revealedStageIndex >= 3 ? 'Executed' : 'Idle',
      output: pipelineResult?.plans
        ? `${pipelineResult.plans.length} candidate recovery plans generated with Pareto trade-offs.`
        : 'Standby mode. 3 candidate heuristic templates pre-compiled.',
      icon: Workflow,
      accentColor: '#FFB95F',
    },
    {
      id: 'oracle',
      name: 'ORACLE',
      role: 'Monte Carlo Simulation & Recommendation Ranking',
      engine: '10,000-Run Stochastic Digital Twin Simulator',
      description: 'Simulates stochastic shopfloor outcomes for each plan, scoring recovery confidence, SLA preservation, and financial delta.',
      status: revealedStageIndex >= 4 ? 'Executed' : 'Idle',
      output: pipelineResult?.plans?.[0]
        ? `Recommended: ${pipelineResult.plans[0].title} • Recovery Score: ${Math.round(pipelineResult.plans[0].metrics?.score ?? 94)}%`
        : 'Ready for simulation. Baseline risk distribution nominal.',
      icon: Cpu,
      accentColor: '#4EDEA3',
    },
  ];


  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none font-sans text-slate-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#00F2FE]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Autonomous Intelligence Agents</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            4-Stage deterministic AI pipeline for real-time factory operations disruption detection and recovery.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0E1726] border border-[#182840] text-xs font-mono text-slate-300">
          <span className="h-2 w-2 rounded-full bg-[#4EDEA3] animate-pulse" />
          <span>Local Deterministic Solvers Online</span>
        </div>
      </div>

      {/* Pipeline Explanation Alert */}
      <div className="p-4 rounded-xl bg-[#0E1726] border border-[#16253D] flex items-start gap-3">
        <Info className="h-5 w-5 text-[#00F2FE] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400">
          <span className="text-slate-200 font-semibold">Local Deterministic Operations Architecture:</span>{' '}
          PULSE runs specialized deterministic algorithms directly against the shopfloor digital twin (Kalman filters, Directed Acyclic Graph traversal, and Monte Carlo stochastic simulators). No external non-deterministic black-box models are involved in critical machine path routing.
        </div>
      </div>

      {/* 4-Stage Step Flow */}
      <div className="flex flex-col gap-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isExecuted = stage.status === 'Executed';

          return (
            <React.Fragment key={stage.id}>
              <div className="p-5 rounded-xl bg-[#0B1320] border border-[#132238] hover:border-[#1E3557] transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${stage.accentColor}15`,
                      borderColor: `${stage.accentColor}35`,
                      color: stage.accentColor,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-white tracking-wider">{stage.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">[{stage.engine}]</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          isExecuted
                            ? 'bg-[#4EDEA3]/15 text-[#4EDEA3]'
                            : 'bg-[#182840] text-slate-500'
                        }`}
                      >
                        {stage.status}
                      </span>
                    </div>

                    <div className="text-xs font-medium text-slate-300 mt-1">{stage.role}</div>
                    <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">{stage.description}</p>

                    <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-[#0E1726] border border-[#182840] font-mono text-[11px] text-[#00F2FE]">
                      <span className="text-slate-500 mr-2">OUTPUT:</span>
                      {stage.output}
                    </div>
                  </div>
                </div>

                <div className="self-end md:self-center font-mono text-[10px] text-slate-500">
                  STAGE 0{idx + 1}
                </div>
              </div>

              {idx < stages.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="h-4 w-4 text-slate-600" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
