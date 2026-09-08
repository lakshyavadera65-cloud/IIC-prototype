import React from 'react';
import { ShieldAlert, Network, Lightbulb, Calculator, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { PipelineResult } from '../types';

interface PipelineTrackerProps {
  pipelineResult: PipelineResult | null;
  isRunning: boolean;
  revealedStageIndex: number; // 0: none, 1: sentinel, 2: impact, 3: strategist, 4: oracle
}

const AGENTS = [
  {
    id: 'sentinel',
    name: '1. Sentinel',
    role: 'Event Intelligence',
    icon: ShieldAlert,
    color: 'cyan',
  },
  {
    id: 'impact',
    name: '2. Impact',
    role: 'Graph Ripple Engine',
    icon: Network,
    color: 'amber',
  },
  {
    id: 'strategist',
    name: '3. Strategist',
    role: 'Recovery Planning',
    icon: Lightbulb,
    color: 'purple',
  },
  {
    id: 'oracle',
    name: '4. Oracle',
    role: 'Simulation & Decision',
    icon: Calculator,
    color: 'emerald',
  },
];

export const PipelineTracker: React.FC<PipelineTrackerProps> = ({
  pipelineResult,
  isRunning,
  revealedStageIndex,
}) => {
  return (
    <div className="bg-[#0C101C] border-b border-slate-800/80 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
              Autonomous Pipeline Execution Strip
            </span>
            {pipelineResult && revealedStageIndex >= 4 && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                Complete in {pipelineResult.pipeline_latency_ms}ms
              </span>
            )}
            {isRunning && (
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Pipeline Orchestrating...
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Deterministic logic + Targeted LLM Grounding
          </span>
        </div>

        {/* 4 Agent Boxes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {AGENTS.map((agent, index) => {
            const Icon = agent.icon;
            const stageNumber = index + 1;
            const isCompleted = revealedStageIndex >= stageNumber;
            const isCurrentActive = isRunning && revealedStageIndex === index;
            const agentStepData = pipelineResult?.agent_steps[index];

            // Summary text
            let summaryText = 'Awaiting trigger event...';
            let latencyText = '';
            if (isCompleted && agentStepData) {
              summaryText = agentStepData.summary;
              latencyText = `${agentStepData.latency_ms}ms`;
            } else if (isCurrentActive) {
              summaryText = 'Computing deterministic state...';
            }

            return (
              <div
                key={agent.id}
                className={`relative rounded-lg p-2.5 border transition-all duration-300 ${
                  isCompleted
                    ? 'bg-slate-900/90 border-slate-700/80 shadow-md shadow-black/40'
                    : isCurrentActive
                    ? 'bg-cyan-950/20 border-cyan-500/60 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-6 w-6 rounded flex items-center justify-center ${
                        isCompleted
                          ? 'bg-slate-800 text-cyan-400'
                          : isCurrentActive
                          ? 'bg-cyan-500 text-black'
                          : 'bg-slate-900 text-slate-500'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{agent.name}</div>
                      <div className="text-[10px] text-slate-400">{agent.role}</div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {isCompleted ? (
                      <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{latencyText}</span>
                      </div>
                    ) : isCurrentActive ? (
                      <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
                    ) : (
                      <span className="text-[10px] font-mono text-slate-600">IDLE</span>
                    )}
                  </div>
                </div>

                {/* Subtitle / summary */}
                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 min-h-[2.5rem]">
                  {summaryText}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
