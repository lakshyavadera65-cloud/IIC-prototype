import React from 'react';
import { ScheduleSlot, MachineState, OrderState, DisruptionEvent } from '../../types';

interface ShopFloorGanttProps {
  schedule: ScheduleSlot[];
  machines: MachineState[];
  orders: OrderState[];
  activeDisruption?: DisruptionEvent | null;
  executedPlanId?: string | null;
}

export const ShopFloorGantt: React.FC<ShopFloorGanttProps> = ({
  schedule,
  machines,
  orders,
  activeDisruption,
  executedPlanId,
}) => {
  const isCncDisrupted = Boolean(activeDisruption && activeDisruption.entity.includes('CNC-02'));
  const isPlanExecuted = Boolean(executedPlanId);

  // Time axis hours: 08:00 to 19:00 (12 hours total)
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  // Default display rows if machines array has items
  const machineRows = [
    {
      id: 'CNC-01',
      name: 'CNC-01',
      type: 'Milling',
      status: 'operational',
      slots: [
        { label: 'WO-8819 [Batch 240/240]', left: '5%', width: '40%', type: 'nominal' },
        { label: 'WO-8822 [Flange Milling]', left: '48%', width: '45%', type: 'nominal' },
      ],
    },
    {
      id: 'CNC-02',
      name: 'CNC-02',
      type: isCncDisrupted ? 'FAULT' : 'Turning',
      status: isCncDisrupted ? 'failed' : 'operational',
      slots: isCncDisrupted
        ? [
            { label: 'WO-8815 [Complete]', left: '0%', width: '48%', type: 'complete' },
            {
              label: isPlanExecuted
                ? 'WO-8821 [OFFLINE - REROUTED TO CNC-03]'
                : 'WO-8821 [CRITICAL CLASH - SPINDLE DOWN]',
              left: '50%',
              width: '35%',
              type: 'clash',
            },
          ]
        : [
            { label: 'WO-8815 [Rough Turn]', left: '0%', width: '48%', type: 'nominal' },
            { label: 'WO-8821 [Turbine Turn]', left: '50%', width: '45%', type: 'nominal' },
          ],
    },
    {
      id: 'CNC-03',
      name: 'CNC-03',
      type: '5-Axis',
      status: 'operational',
      slots: isPlanExecuted
        ? [
            { label: 'WO-8818 [Impeller Stage 1]', left: '10%', width: '38%', type: 'nominal' },
            {
              label: 'WO-8821 [REROUTED BY STRATEGIST +45m]',
              left: '55%',
              width: '38%',
              type: 'rerouted',
            },
          ]
        : [
            { label: 'WO-8818 [Impeller Stage 1]', left: '10%', width: '38%', type: 'nominal' },
            { label: 'IDLE CAPACITY BUFFER (3.5h)', left: '55%', width: '38%', type: 'idle' },
          ],
    },
    {
      id: 'EDM-01',
      name: 'EDM-01',
      type: 'Wire Cut',
      status: 'operational',
      slots: [
        { label: 'WO-8820 [Nozzle Guide Vane Wire EDM]', left: '20%', width: '50%', type: 'nominal' },
      ],
    },
    {
      id: 'ROBOT-CELL-04',
      name: 'ROBOT-CELL 04',
      type: 'Weld',
      status: 'operational',
      slots: [
        { label: 'WO-8812 [Laser Clad B-09]', left: '0%', width: '35%', type: 'nominal' },
        { label: 'WO-8825 [Exhaust Casing TIG]', left: '40%', width: '45%', type: 'nominal' },
      ],
    },
    {
      id: 'INSPECTION-02',
      name: 'INSPECTION-02',
      type: 'CMM',
      status: 'operational',
      slots: [
        { label: 'QC-Check #411', left: '15%', width: '25%', type: 'nominal' },
        { label: 'QC-Stage Gate 02', left: '60%', width: '30%', type: 'nominal' },
      ],
    },
  ];

  return (
    <section className="bg-surface-container-low p-space-md rounded shadow-sm flex flex-col gap-space-sm border border-outline-variant/30 select-none">
      {/* Header and Legend */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[20px]">
            calendar_view_day
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-headline-sm text-on-surface uppercase tracking-wide font-bold">
              Autonomous Shop Floor Schedule
            </span>
            <span className="text-body-sm text-on-surface-variant">
              Cell Pune-04 · Sub-minute Dispatch Timeline
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-space-xs font-mono">
          <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs bg-surface-container rounded border border-outline-variant/30">
            <span className="w-2.5 h-2.5 bg-error rounded-sm shrink-0" />
            <span className="text-label-caps text-on-surface-variant font-bold">FAULT CLASH</span>
          </div>
          <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs bg-surface-container rounded border border-outline-variant/30">
            <span className="w-2.5 h-2.5 bg-secondary rounded-sm shrink-0" />
            <span className="text-label-caps text-on-surface-variant font-bold">REROUTED BY AI</span>
          </div>
          <div className="flex items-center gap-space-2xs px-space-sm py-space-2xs bg-surface-container rounded border border-outline-variant/30">
            <span className="w-2.5 h-2.5 bg-primary-container rounded-sm shrink-0" />
            <span className="text-label-caps text-on-surface-variant font-bold">NOMINAL</span>
          </div>
        </div>
      </div>

      {/* Gantt Canvas Container */}
      <div className="relative overflow-x-auto bg-surface-container-lowest rounded p-space-sm border border-outline-variant/30 font-mono">
        {/* Timeline Header Axis (08:00 - 19:00) */}
        <div className="grid grid-cols-12 text-center pb-space-xs text-mono-code text-on-surface-variant border-b border-surface-container-high ml-44 min-w-[650px]">
          {hours.map((h, i) => (
            <div key={h} className={h === '14:00' ? 'text-error font-bold' : ''}>
              {h}
            </div>
          ))}
        </div>

        {/* Vertical Time Scrubber ("NOW 14:30") */}
        <div
          className="absolute top-10 bottom-2 pointer-events-none z-20 flex flex-col items-center"
          style={{ left: 'calc(11rem + 54.16%)' }}
        >
          <span className="bg-error text-on-error font-mono text-[9px] px-space-2xs py-0.5 rounded shadow-[0_0_8px_rgba(239,68,68,0.8)] uppercase font-bold">
            NOW 14:30
          </span>
          <div className="w-px h-full bg-error shadow-[0_0_6px_rgba(239,68,68,0.9)] animate-pulse" />
        </div>

        {/* Machine Rows */}
        <div className="flex flex-col gap-space-xs pt-space-xs min-w-[650px]">
          {machineRows.map((row) => {
            const isRowFault = row.status === 'failed';
            const isRowRerouteTarget = isPlanExecuted && row.id === 'CNC-03';

            return (
              <div
                key={row.id}
                className={`flex items-center h-10 rounded transition-colors px-space-2xs ${
                  isRowFault
                    ? 'bg-error/10 border border-error/30'
                    : isRowRerouteTarget
                    ? 'bg-secondary/10 border border-secondary/30'
                    : 'hover:bg-surface-container/50'
                }`}
              >
                {/* Machine Label Column */}
                <div className="w-44 shrink-0 flex items-center justify-between pr-space-sm">
                  <span
                    className={`text-mono-data font-semibold truncate flex items-center gap-1.5 ${
                      isRowFault ? 'text-error font-bold' : 'text-on-surface'
                    }`}
                  >
                    {isRowFault && (
                      <span className="material-symbols-outlined text-[14px] text-error">
                        error
                      </span>
                    )}
                    <span>{row.name}</span>
                    <span className="text-on-surface-variant font-normal text-xs">
                      ({row.type})
                    </span>
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isRowFault ? 'bg-error animate-ping' : 'bg-secondary'
                    }`}
                  />
                </div>

                {/* Job Timeline Slots Track */}
                <div className="relative flex-1 h-7 bg-surface-container-low rounded overflow-hidden">
                  {row.slots.map((slot, sIdx) => {
                    let slotStyle = 'bg-primary-container/40 text-on-primary-container';
                    if (slot.type === 'clash') {
                      slotStyle =
                        'bg-error text-on-error font-bold shadow-[0_0_12px_rgba(239,68,68,0.6)] animate-pulse';
                    } else if (slot.type === 'rerouted') {
                      slotStyle =
                        'bg-secondary text-on-secondary font-bold shadow-[0_0_10px_rgba(78,222,163,0.5)] animate-pulse';
                    } else if (slot.type === 'idle') {
                      slotStyle =
                        'bg-surface-container text-on-surface-variant border border-dashed border-outline-variant/40';
                    } else if (slot.type === 'complete') {
                      slotStyle = 'bg-surface-variant/40 text-on-surface-variant';
                    }

                    return (
                      <div
                        key={sIdx}
                        className={`absolute h-full rounded flex items-center px-space-xs text-mono-code truncate transition-all duration-300 ${slotStyle}`}
                        style={{ left: slot.left, width: slot.width }}
                        title={slot.label}
                      >
                        <span className="truncate">{slot.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
