import React from 'react';
import { PipelineResult } from '../../types';

interface AgentCascadeRailProps {
  pipelineResult?: PipelineResult | null;
  revealedStageIndex: number;
  isRunning?: boolean;
}

export const AgentCascadeRail: React.FC<AgentCascadeRailProps> = ({
  pipelineResult,
  revealedStageIndex,
  isRunning = false,
}) => {
  const currentStage = Math.min(4, Math.max(0, revealedStageIndex));

  // Determine stage states
  const isSentinelDone = currentStage >= 1;
  const isImpactDone = currentStage >= 2;
  const isStrategistDone = currentStage >= 3;
  const isOracleDone = currentStage >= 4;

  const eventEntity = pipelineResult?.event?.entity || 'CNC-02';
  const atRiskCount = pipelineResult?.impact?.at_risk_orders?.length || 4;
  const recommendedPlanTitle = pipelineResult?.recommended_plan?.title || 'Plan A';
  const confidenceScore = pipelineResult?.recommended_plan?.metrics?.score || 94.8;

  return (
    <aside className="xl:col-span-4 flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded shadow-sm border border-outline-variant/30 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-space-2xs border-b border-outline-variant/20">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-primary text-[18px]">hub</span>
          <span className="font-mono text-headline-sm text-on-surface uppercase tracking-wide font-bold">
            Multi-Agent Cascade
          </span>
        </div>
        <span
          className={`font-mono text-label-caps px-space-xs py-0.5 rounded font-bold ${
            isRunning
              ? 'bg-primary/20 text-primary animate-pulse'
              : currentStage === 4
              ? 'bg-secondary/20 text-secondary'
              : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          {isRunning ? `STAGE ${currentStage}/4` : currentStage === 4 ? 'STAGE 4/4 COMPLETE' : 'STANDBY'}
        </span>
      </div>

      <p className="text-body-sm text-on-surface-variant">
        Autonomous consensus pipeline addressing {eventEntity} fault event in isolated virtual twin buffer.
      </p>

      {/* Visual Conduit Rail with 4 Agents */}
      <div className="relative flex flex-col gap-space-sm pl-space-sm my-space-xs">
        {/* Vertical glowing pipeline conduit */}
        <div className="absolute left-2.5 top-3 bottom-5 w-0.5 bg-surface-variant">
          <div
            className="w-full bg-gradient-to-b from-secondary via-primary to-secondary transition-all duration-500"
            style={{
              height:
                currentStage === 4
                  ? '100%'
                  : currentStage === 3
                  ? '75%'
                  : currentStage === 2
                  ? '50%'
                  : currentStage === 1
                  ? '25%'
                  : '0%',
            }}
          />
        </div>

        {/* 1. Sentinel Agent */}
        <div className="relative flex items-start gap-space-sm pl-space-md">
          <div
            className={`absolute -left-1 top-0.5 w-4 h-4 rounded-full bg-surface-container-high flex items-center justify-center transition-all ${
              isSentinelDone
                ? 'shadow-[0_0_8px_rgba(78,222,163,0.8)]'
                : 'opacity-40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isSentinelDone ? 'bg-secondary' : 'bg-surface-variant'
              }`}
            />
          </div>
          <div className="flex flex-col w-full bg-surface-container p-space-sm rounded gap-space-2xs shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[16px]">radar</span>
                <span className="font-mono text-headline-sm text-on-surface font-semibold">
                  Sentinel Agent
                </span>
              </div>
              <span
                className={`font-mono text-label-caps px-space-xs py-0.5 rounded font-bold ${
                  isSentinelDone
                    ? 'text-secondary bg-secondary/15'
                    : 'text-on-surface-variant bg-surface-container-high'
                }`}
              >
                {isSentinelDone ? 'DONE · 12ms' : 'IDLE'}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant font-sans">
              Extracted anomaly telemetry: Spindle vibration{' '}
              <span className="text-error font-mono font-semibold">8.4mm/s</span> &gt; threshold{' '}
              <span className="text-on-surface font-mono">(2.5mm/s)</span>; predicted physical lock in 18 min.
            </p>
          </div>
        </div>

        {/* 2. Impact Agent */}
        <div className="relative flex items-start gap-space-sm pl-space-md">
          <div
            className={`absolute -left-1 top-0.5 w-4 h-4 rounded-full bg-surface-container-high flex items-center justify-center transition-all ${
              isImpactDone
                ? 'shadow-[0_0_8px_rgba(78,222,163,0.8)]'
                : 'opacity-40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isImpactDone ? 'bg-secondary' : 'bg-surface-variant'
              }`}
            />
          </div>
          <div className="flex flex-col w-full bg-surface-container p-space-sm rounded gap-space-2xs shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[16px]">
                  account_tree
                </span>
                <span className="font-mono text-headline-sm text-on-surface font-semibold">
                  Impact Agent
                </span>
              </div>
              <span
                className={`font-mono text-label-caps px-space-xs py-0.5 rounded font-bold ${
                  isImpactDone
                    ? 'text-secondary bg-secondary/15'
                    : 'text-on-surface-variant bg-surface-container-high'
                }`}
              >
                {isImpactDone ? 'DONE · 38ms' : 'WAITING'}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant font-sans">
              Calculated blast radius:{' '}
              <span className="text-tertiary font-mono font-semibold">
                {atRiskCount} work orders
              </span>{' '}
              (WO-8821, 8824, 8830, 8845), 2 tier-1 customer SLA breaches threatened.
            </p>
          </div>
        </div>

        {/* 3. Strategist Agent */}
        <div className="relative flex items-start gap-space-sm pl-space-md">
          <div
            className={`absolute -left-1 top-0.5 w-4 h-4 rounded-full bg-surface-container-high flex items-center justify-center transition-all ${
              isStrategistDone
                ? 'shadow-[0_0_8px_rgba(76,215,246,0.8)]'
                : 'opacity-40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isStrategistDone
                  ? 'bg-primary animate-ping'
                  : 'bg-surface-variant'
              }`}
            />
          </div>
          <div
            className={`flex flex-col w-full p-space-sm rounded gap-space-2xs shadow-sm border ${
              isStrategistDone
                ? 'bg-surface-container-high border-primary/40'
                : 'bg-surface-container border-outline-variant/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[16px] animate-spin">
                  memory
                </span>
                <span className="font-mono text-headline-sm text-primary font-semibold">
                  Strategist Agent
                </span>
              </div>
              <span
                className={`font-mono text-label-caps px-space-xs py-0.5 rounded font-bold ${
                  isStrategistDone
                    ? 'text-primary bg-primary/20'
                    : 'text-on-surface-variant bg-surface-container-high'
                }`}
              >
                {isStrategistDone ? 'SYNTHESIZED' : isRunning ? 'PROCESSING' : 'WAITING'}
              </span>
            </div>
            <p className="text-body-sm text-on-surface font-sans">
              Synthesizing 3 candidate recovery permutations via constraint propagation solver (84ms compute).
            </p>
            {/* Progress bar */}
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden mt-space-2xs">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: isStrategistDone ? '100%' : isRunning ? '78%' : '15%' }}
              />
            </div>
            <div className="flex justify-between items-center text-on-surface-variant font-mono text-[10px] pt-space-2xs">
              <span>Branch tree #42</span>
              <span>{isStrategistDone ? '100% complete' : isRunning ? '78% complete' : 'Idle'}</span>
            </div>
          </div>
        </div>

        {/* 4. Oracle Agent */}
        <div className="relative flex items-start gap-space-sm pl-space-md">
          <div
            className={`absolute -left-1 top-0.5 w-4 h-4 rounded-full bg-surface-container-high flex items-center justify-center transition-all ${
              isOracleDone
                ? 'shadow-[0_0_8px_rgba(78,222,163,0.8)]'
                : 'opacity-40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOracleDone ? 'bg-secondary' : 'bg-surface-variant'
              }`}
            />
          </div>
          <div className="flex flex-col w-full bg-surface-container p-space-sm rounded gap-space-2xs shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[16px]">
                  insights
                </span>
                <span className="font-mono text-headline-sm text-on-surface font-semibold">
                  Oracle Agent
                </span>
              </div>
              <span
                className={`font-mono text-label-caps px-space-xs py-0.5 rounded font-bold ${
                  isOracleDone
                    ? 'text-secondary bg-secondary/15'
                    : 'text-on-surface-variant bg-surface-container-high'
                }`}
              >
                {isOracleDone ? 'RECOMMENDED' : 'SIMULATING'}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant font-sans">
              Simulated digital twin 10,000 runs:{' '}
              <span className="text-secondary font-semibold font-mono">
                {recommendedPlanTitle} yields {confidenceScore}% SLA confidence
              </span>
              , ₹42,000 risk reduction over baseline.
            </p>
          </div>
        </div>
      </div>

      {/* Live Agent Compute Telemetry Box */}
      <div className="mt-space-2xs bg-surface-container-lowest p-space-sm rounded flex flex-col gap-space-xs font-mono border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <span className="text-label-caps text-on-surface-variant">INFERENCE LATENCY</span>
          <span className="text-mono-metric-md text-primary font-bold">
            142<span className="text-body-sm text-on-surface-variant">ms</span>
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label-caps text-on-surface-variant">CONSENSUS CONFIDENCE</span>
          <span className="text-mono-metric-md text-secondary font-bold">98.4%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-label-caps text-on-surface-variant">ACTIVE TOKEN BURN</span>
          <span className="text-mono-code text-tertiary">2.4k tok/s</span>
        </div>
        <div className="w-full h-px bg-surface-container-high my-space-2xs" />
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-on-surface-variant">SOLVER SEED</span>
          <span className="text-on-surface font-bold">#0x8F94B10C</span>
        </div>
      </div>
    </aside>
  );
};
