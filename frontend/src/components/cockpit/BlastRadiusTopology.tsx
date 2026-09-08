import React, { useState } from 'react';
import { ImpactReport } from '../../types';

interface BlastRadiusTopologyProps {
  impact?: ImpactReport | null;
  onOpenGraphModal?: () => void;
  isRecovered?: boolean;
}

export const BlastRadiusTopology: React.FC<BlastRadiusTopologyProps> = ({
  impact,
  onOpenGraphModal,
  isRecovered = false,
}) => {
  const [activeView, setActiveView] = useState<'cascade' | 'twin'>('cascade');

  const disruptedMachine = impact?.disrupted_entity || 'CNC-02';
  const affectedOrders = impact?.at_risk_orders || ['WO-8821'];

  return (
    <section className="bg-surface-container-low p-space-md rounded shadow-sm flex flex-col gap-space-sm border border-outline-variant/30 select-none">
      {/* Header and View Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">
            account_tree
          </span>
          <div>
            <span className="font-mono text-headline-sm text-on-surface uppercase tracking-wide font-bold">
              Blast Radius &amp; Reroute Topology
            </span>
            <span className="text-body-sm text-on-surface-variant block">
              Dependency cascade from raw supplier ingot to Airbus Defense delivery SLA
            </span>
          </div>
        </div>

        {/* View switchers */}
        <div className="flex items-center bg-surface-container p-space-2xs rounded gap-space-2xs border border-outline-variant/30 font-mono">
          <button
            type="button"
            onClick={() => setActiveView('cascade')}
            className={`px-space-sm py-space-2xs rounded font-bold text-label-caps transition-all ${
              activeView === 'cascade'
                ? 'bg-surface-container-high text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            CASCADE GRAPH
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveView('twin');
              if (onOpenGraphModal) onOpenGraphModal();
            }}
            className={`px-space-sm py-space-2xs rounded font-bold text-label-caps transition-all flex items-center gap-1 ${
              activeView === 'twin'
                ? 'bg-surface-container-high text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>PHYSICAL DIGITAL TWIN</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>
        </div>
      </div>

      {/* Node & Edge Flow Canvas */}
      <div className="relative w-full bg-surface-container-lowest p-space-lg rounded overflow-x-auto flex flex-col gap-space-lg border border-outline-variant/30 font-mono">
        {/* Primary Disruption Cascade Line */}
        <div className="flex items-center justify-between min-w-[760px] relative py-2">
          {/* Connecting SVG background lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <path
              className="text-secondary/40"
              d="M 120 45 L 200 45"
              stroke="currentColor"
              strokeDasharray="4 2"
              strokeWidth="2"
            />
            <path
              className="text-error"
              d="M 270 45 L 360 45"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <path
              className="text-tertiary"
              d="M 460 45 L 530 45"
              stroke="currentColor"
              strokeDasharray="3 3"
              strokeWidth="2"
            />
            <path
              className="text-tertiary"
              d="M 610 45 L 680 45"
              stroke="currentColor"
              strokeDasharray="3 3"
              strokeWidth="2"
            />
            <path
              className="text-error"
              d="M 760 45 L 830 45"
              stroke="currentColor"
              strokeWidth="2.5"
            />

            {/* Autonomous bypass curved line to CNC-03 */}
            <path
              className="text-secondary animate-pulse"
              d="M 250 45 Q 310 115, 470 115"
              fill="none"
              stroke="currentColor"
              strokeDasharray="6 3"
              strokeWidth="2.5"
            />
            <path
              className="text-secondary animate-pulse"
              d="M 570 115 Q 630 115, 710 50"
              fill="none"
              stroke="currentColor"
              strokeDasharray="6 3"
              strokeWidth="2.5"
            />
          </svg>

          {/* Node 1: Supplier */}
          <div className="relative z-10 flex flex-col items-center gap-space-2xs bg-surface-container p-space-sm rounded shadow-sm w-36 text-center border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_rgba(78,222,163,0.8)]" />
            <span className="text-label-caps text-on-surface-variant font-bold">SUPPLIER</span>
            <span className="text-mono-data text-on-surface font-semibold truncate w-full">
              Tata Steel Alloy
            </span>
            <span className="text-mono-code text-secondary font-bold">LOT-9921 [OK]</span>
          </div>

          {/* Node 2: Raw Material */}
          <div className="relative z-10 flex flex-col items-center gap-space-2xs bg-surface-container p-space-sm rounded shadow-sm w-36 text-center border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_6px_rgba(78,222,163,0.8)]" />
            <span className="text-label-caps text-on-surface-variant font-bold">BILLET STOCK</span>
            <span className="text-mono-data text-on-surface font-semibold truncate w-full">
              Ti-6Al-4V Billet
            </span>
            <span className="text-mono-code text-secondary font-bold">STOCKED (42u)</span>
          </div>

          {/* Node 3: Fault Machine (CRITICAL) */}
          <div className="relative z-10 flex flex-col items-center gap-space-2xs bg-error-container p-space-sm rounded shadow-[0_0_16px_rgba(239,68,68,0.4)] w-40 text-center animate-pulse border border-error">
            <span className="w-2 h-2 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,1)]" />
            <span className="text-label-caps text-on-error-container font-bold">PRIMARY BOTTLENECK</span>
            <span className="text-mono-data text-on-error-container font-bold truncate w-full">
              {disruptedMachine} Spindle
            </span>
            <span className="text-mono-code text-on-error-container bg-error/30 px-space-2xs rounded font-bold">
              OVERHEAT 104°C
            </span>
          </div>

          {/* Node 4: Operation Impacted */}
          <div className="relative z-10 flex flex-col items-center gap-space-2xs bg-surface-container p-space-sm rounded shadow-sm w-36 text-center border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_6px_rgba(255,185,95,0.8)]" />
            <span className="text-label-caps text-on-surface-variant font-bold">OPERATION</span>
            <span className="text-mono-data text-tertiary font-semibold truncate w-full">
              OP-30 Rough Turn
            </span>
            <span className="text-mono-code text-tertiary font-bold">HALTED (+2.4h)</span>
          </div>

          {/* Node 5: Work Order Impacted */}
          <div className="relative z-10 flex flex-col items-center gap-space-2xs bg-surface-container p-space-sm rounded shadow-sm w-36 text-center border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_6px_rgba(255,185,95,0.8)]" />
            <span className="text-label-caps text-on-surface-variant font-bold">ORDER AT RISK</span>
            <span className="text-mono-data text-tertiary font-semibold truncate w-full">
              {affectedOrders[0] || 'WO-8821'} Turbine
            </span>
            <span className="text-mono-code text-tertiary font-bold">4 UNITS HELD</span>
          </div>

          {/* Node 6: Customer Delivery SLA */}
          <div className="relative z-10 flex flex-col items-center gap-space-2xs bg-surface-container-high p-space-sm rounded shadow-sm w-44 text-center border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-error shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
            <span className="text-label-caps text-error font-bold">CONTRACT PENALTY</span>
            <span className="text-mono-data text-on-surface font-semibold truncate w-full">
              Airbus #PO-9912
            </span>
            <span className="text-mono-code text-error font-bold">SLA DUE 18:00 UTC</span>
          </div>
        </div>

        {/* Active Reroute Sub-Branch (CNC-03) */}
        <div className="flex items-center ml-[260px] min-w-[500px] relative z-10">
          <div className="flex items-center gap-space-sm bg-surface-container p-space-sm rounded shadow-[0_0_12px_rgba(78,222,163,0.2)] border border-secondary/40 w-full justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-surface-container-lowest text-[12px] font-bold">
                  check
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs flex-wrap">
                  <span className="text-label-caps text-secondary font-bold uppercase">
                    AUTONOMOUS MITIGATION BYPASS
                  </span>
                  <span className="text-mono-code text-on-surface-variant text-[11px]">
                    · CNC-03 High-Speed Dynamic Buffer
                  </span>
                </div>
                <span className="text-body-sm text-on-surface font-sans">
                  Rerouting {affectedOrders[0] || 'WO-8821'} rough milling stage to CNC-03 slot at 15:00 UTC. Penalty avoided: ₹85,000.
                </span>
              </div>
            </div>
            <span className="text-mono-metric-md text-secondary font-bold ml-space-md shrink-0">
              94.8% SLA
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
