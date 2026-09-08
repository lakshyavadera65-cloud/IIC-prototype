import React from 'react';
import { DisruptionEvent } from '../../types';

interface IncidentBannerProps {
  activeDisruption?: DisruptionEvent | null;
  ordersAtRiskCount?: number;
  isMitigating?: boolean;
}

export const IncidentBanner: React.FC<IncidentBannerProps> = ({
  activeDisruption,
  ordersAtRiskCount = 0,
  isMitigating = false,
}) => {
  const hasIncident = Boolean(activeDisruption);

  return (
    <section className="flex flex-col gap-space-xs select-none">
      {/* Live Disruption Ticker Container */}
      <div className="relative overflow-hidden rounded bg-surface-container-low p-space-sm shadow-md flex flex-wrap items-center justify-between gap-space-md border border-outline-variant/30">
        {/* Left Status Bar */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            hasIncident ? 'bg-error animate-pulse' : 'bg-secondary'
          }`}
        />

        {/* Left: Incident Details */}
        <div className="flex items-center gap-space-md pl-space-xs">
          {hasIncident ? (
            <>
              <div className="flex items-center gap-space-xs bg-error/15 text-error px-space-sm py-space-2xs rounded border border-error/30 shrink-0">
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  sync_problem
                </span>
                <span className="font-mono text-label-caps uppercase tracking-wider font-bold">
                  {activeDisruption?.id ? `ALERT ${activeDisruption.id}` : 'ALERT E-409'}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="font-mono text-headline-sm text-error font-bold tracking-tight">
                    {activeDisruption?.entity} Critical Disruption [{activeDisruption?.type}]
                  </span>
                  <span className="text-on-surface-variant font-mono text-mono-code">
                    · Logged {activeDisruption?.duration_hours ? `${activeDisruption.duration_hours}h estimated downtime` : 'Immediate triage'}
                  </span>
                </div>
                <span className="text-body-sm text-on-surface-variant mt-0.5">
                  {activeDisruption?.description ||
                    'Thermal signature spiked beyond tolerance limits. Multi-agent consensus engine activated for mitigation.'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-space-xs bg-secondary/15 text-secondary px-space-sm py-space-2xs rounded border border-secondary/30 shrink-0">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span className="font-mono text-label-caps uppercase tracking-wider font-bold">
                  SYSTEM NOMINAL
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs">
                  <span className="font-mono text-headline-sm text-secondary font-bold tracking-tight">
                    Cell Pune-04 Operating Within Baseline Tolerances
                  </span>
                  <span className="text-on-surface-variant font-mono text-mono-code">
                    · Zero Active Alarms
                  </span>
                </div>
                <span className="text-body-sm text-on-surface-variant mt-0.5">
                  All 6 CNC and precision workstations running synchronous shop floor dispatch. Continuous telemetry healthy.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right: Quick Telemetry Micro-Pills */}
        <div className="flex items-center gap-space-xs font-mono">
          {/* Uptime */}
          <div className="flex flex-col items-end px-space-sm py-space-2xs bg-surface-container rounded border border-outline-variant/30">
            <span className="text-label-caps text-on-surface-variant">FACTORY UPTIME</span>
            <span className="text-mono-metric-md text-secondary font-bold">99.82%</span>
          </div>

          {/* Throughput */}
          <div className="flex flex-col items-end px-space-sm py-space-2xs bg-surface-container rounded border border-outline-variant/30">
            <span className="text-label-caps text-on-surface-variant">THROUGHPUT</span>
            <span className="text-mono-metric-md text-primary font-bold">
              840 <span className="text-body-sm text-on-surface-variant font-normal">u/h</span>
            </span>
          </div>

          {/* Orders at Risk */}
          <div className="flex flex-col items-end px-space-sm py-space-2xs bg-surface-container rounded border border-outline-variant/30">
            <span className="text-label-caps text-on-surface-variant">ORDERS AT RISK</span>
            <span
              className={`text-mono-metric-md font-bold ${
                ordersAtRiskCount > 0 ? 'text-error animate-pulse' : 'text-secondary'
              }`}
            >
              {ordersAtRiskCount} WOs
            </span>
          </div>

          {/* Autonomous Status */}
          <div className="flex flex-col items-end px-space-sm py-space-2xs bg-surface-container rounded border border-outline-variant/30">
            <span className="text-label-caps text-on-surface-variant">AUTONOMOUS STATUS</span>
            <span
              className={`text-mono-code font-bold flex items-center gap-space-2xs ${
                hasIncident ? 'text-secondary-fixed' : 'text-secondary'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  hasIncident ? 'bg-secondary animate-ping' : 'bg-secondary'
                }`}
              />
              {isMitigating ? 'SOLVING' : hasIncident ? 'MITIGATING' : 'OPTIMAL'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
