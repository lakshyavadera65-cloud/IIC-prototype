import React, { useState } from 'react';
import { ScheduleSlot, MachineState, OrderState, DisruptionEvent } from '../types';
import { Clock, AlertTriangle, CheckCircle, ArrowRightLeft, ShieldAlert } from 'lucide-react';

interface ProductionScheduleGanttProps {
  schedule: ScheduleSlot[];
  machines: MachineState[];
  orders: OrderState[];
  activeDisruption?: DisruptionEvent;
}

const TOTAL_HOURS = 16;
const HOUR_MARKS = [0, 2, 4, 6, 8, 10, 12, 14, 16];

export const ProductionScheduleGantt: React.FC<ProductionScheduleGanttProps> = ({
  schedule,
  machines,
  orders,
  activeDisruption,
}) => {
  const [hoveredSlot, setHoveredSlot] = useState<ScheduleSlot | null>(null);

  const orderMap = new Map(orders.map((o) => [o.id, o]));

  const getSlotColor = (slot: ScheduleSlot) => {
    switch (slot.status) {
      case 'clash':
        return 'bg-rose-600/80 border-rose-400 text-white font-bold hatch-pattern-danger animate-pulse';
      case 'rerouted':
        return 'bg-emerald-600/90 border-emerald-400 text-white font-semibold shadow-md shadow-emerald-500/20';
      case 'delayed':
        return 'bg-amber-600/80 border-amber-400 text-white font-medium';
      case 'completed':
        return 'bg-slate-700 border-slate-500 text-slate-300';
      default:
        return 'bg-cyan-900/70 border-cyan-500/60 text-cyan-200 hover:bg-cyan-800/80';
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800/90 p-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
              Live Production Schedule (State-Driven Gantt)
            </h2>
            <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              Direct Digital Twin Feed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Machine timeline tracking active workorders, clash collision windows, and dynamic rerouted slots.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-cyan-600 border border-cyan-400"></span>
            <span className="text-slate-300">Scheduled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-rose-600 border border-rose-400 hatch-pattern-danger"></span>
            <span className="text-rose-400 font-semibold">Downtime Clash</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-emerald-600 border border-emerald-400"></span>
            <span className="text-emerald-400 font-semibold">Rerouted / Saved</span>
          </div>
        </div>
      </div>

      {/* Gantt Matrix */}
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          {/* Time Header Scale */}
          <div className="grid grid-cols-12 gap-2 mb-2 items-center">
            <div className="col-span-3 text-xs font-semibold uppercase text-slate-500 pl-1">
              Workstation / Line
            </div>
            <div className="col-span-9 relative flex justify-between text-[11px] font-mono text-slate-400 px-1 border-b border-slate-800 pb-1">
              {HOUR_MARKS.map((hr) => (
                <span key={hr} className="flex flex-col items-center">
                  <span>+{hr}h</span>
                </span>
              ))}
            </div>
          </div>

          {/* Machine Rows */}
          <div className="space-y-2.5">
            {machines.map((machine) => {
              const machineSlots = schedule.filter((s) => s.machine_id === machine.id);
              const isDisruptedMachine = activeDisruption && activeDisruption.entity === machine.id;

              return (
                <div
                  key={machine.id}
                  className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg border transition-colors ${
                    isDisruptedMachine && machine.status === 'failed'
                      ? 'bg-rose-950/20 border-rose-900/50 ring-1 ring-rose-500/30'
                      : 'bg-slate-950/60 border-slate-800/60 hover:border-slate-700/80'
                  }`}
                >
                  {/* Left Label */}
                  <div className="col-span-3 flex items-center justify-between pr-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200">{machine.id}</span>
                        {isDisruptedMachine && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {machine.name}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        machine.status === 'failed'
                          ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {machine.current_utilization.toFixed(0)}%
                    </span>
                  </div>

                  {/* Right Timeline Bar */}
                  <div className="col-span-9 relative h-8 bg-slate-900/70 rounded-md border border-slate-800/80 overflow-hidden flex items-center">
                    {/* Hour grid dividers */}
                    {HOUR_MARKS.map((hr) => (
                      <div
                        key={hr}
                        className="absolute top-0 bottom-0 border-r border-slate-800/40 pointer-events-none"
                        style={{ left: `${(hr / TOTAL_HOURS) * 100}%` }}
                      />
                    ))}

                    {/* Disruption Window Shade if failed */}
                    {isDisruptedMachine && machine.status === 'failed' && (
                      <div
                        className="absolute top-0 bottom-0 bg-rose-950/40 hatch-pattern-danger border-r-2 border-rose-500 flex items-center pl-2 z-0"
                        style={{
                          left: '0%',
                          width: `${((activeDisruption.duration_hours || 6) / TOTAL_HOURS) * 100}%`,
                        }}
                      >
                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-300 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded border border-rose-800/80">
                          <ShieldAlert className="h-2.5 w-2.5" />
                          Downtime: {activeDisruption.duration_hours}h
                        </span>
                      </div>
                    )}

                    {/* Scheduled Slots */}
                    {machineSlots.map((slot) => {
                      const leftPct = (slot.start_hour / TOTAL_HOURS) * 100;
                      const widthPct = (slot.duration_hours / TOTAL_HOURS) * 100;
                      const order = orderMap.get(slot.order_id);

                      return (
                        <div
                          key={slot.id}
                          onMouseEnter={() => setHoveredSlot(slot)}
                          onMouseLeave={() => setHoveredSlot(null)}
                          className={`absolute top-1 bottom-1 rounded border px-1.5 flex items-center justify-between text-[10px] cursor-pointer transition-all duration-200 z-10 ${getSlotColor(
                            slot
                          )}`}
                          style={{
                            left: `${Math.max(0, Math.min(95, leftPct))}%`,
                            width: `${Math.max(4, Math.min(100 - leftPct, widthPct))}%`,
                          }}
                        >
                          <div className="truncate font-mono font-bold flex items-center gap-1">
                            {slot.status === 'clash' && <AlertTriangle className="h-2.5 w-2.5 shrink-0" />}
                            {slot.status === 'rerouted' && <ArrowRightLeft className="h-2.5 w-2.5 shrink-0" />}
                            <span>{slot.order_id}</span>
                          </div>
                          <span className="text-[8px] opacity-80 uppercase hidden md:inline ml-1">
                            {slot.duration_hours}h
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hovered Slot Inspector Tooltip Bar */}
      {hoveredSlot && (
        <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-cyan-400">{hoveredSlot.order_id}</span>
            <span className="text-slate-300">
              Customer: <strong>{orderMap.get(hoveredSlot.order_id)?.customer}</strong>
            </span>
            <span className="text-slate-400">
              Product: <em>{orderMap.get(hoveredSlot.order_id)?.product}</em>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-mono">
              Op: <strong>{hoveredSlot.operation.replace('_', ' ')}</strong>
            </span>
            <span className="text-slate-300 font-mono">
              Window: <strong>+{hoveredSlot.start_hour}h → +{(hoveredSlot.start_hour + hoveredSlot.duration_hours).toFixed(1)}h</strong>
            </span>
            <span
              className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded border ${
                hoveredSlot.status === 'clash'
                  ? 'bg-rose-950 text-rose-400 border-rose-800'
                  : hoveredSlot.status === 'rerouted'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-cyan-950 text-cyan-400 border-cyan-800'
              }`}
            >
              Status: {hoveredSlot.status}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
