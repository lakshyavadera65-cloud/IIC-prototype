import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Cpu,
  Plus,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Trash2,
  Activity,
  Layers,
  Radio,
} from 'lucide-react';
import { ScheduleItem, Machine, Order } from '../../types';

interface SchedulePageProps {
  schedule: ScheduleItem[];
  machines: Machine[];
  orders: Order[];
  activeDisruptionCount?: number;
  onOpenAddSchedule?: () => void;
  onDeleteSchedule?: (id: string) => Promise<void>;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  schedule,
  machines,
  orders,
  activeDisruptionCount = 0,
  onOpenAddSchedule,
  onDeleteSchedule,
}) => {
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const currentDecimalHour = currentHours + currentMinutes / 60;

  // Determine current active shift
  let activeShiftName = 'Shift 1 (Day Operations)';
  let activeShiftWindow = '06:00 - 14:00';
  if (currentHours >= 14 && currentHours < 22) {
    activeShiftName = 'Shift 2 (Afternoon / Evening)';
    activeShiftWindow = '14:00 - 22:00';
  } else if (currentHours >= 22 || currentHours < 6) {
    activeShiftName = 'Shift 3 (Overnight Continuous)';
    activeShiftWindow = '22:00 - 06:00';
  }

  // Format real-time slots
  const formatSlotTime = (startH: number, durH: number) => {
    const sH = Math.floor(startH) % 24;
    const sM = startH % 1 !== 0 ? '30' : '00';
    const sPeriod = sH >= 12 ? 'PM' : 'AM';
    const s12 = sH % 12 || 12;

    const endVal = startH + durH;
    const eH = Math.floor(endVal) % 24;
    const eM = endVal % 1 !== 0 ? '30' : '00';
    const ePeriod = eH >= 12 ? 'PM' : 'AM';
    const e12 = eH % 12 || 12;

    return `${String(s12).padStart(2, '0')}:${sM} ${sPeriod} - ${String(e12).padStart(2, '0')}:${eM} ${ePeriod}`;
  };

  const timelineSlots = schedule.length > 0
    ? schedule.map((s, idx) => {
        const startH = s.start_hour ?? (8 + (idx % 6) * 2);
        const durH = s.duration_hours ?? 2;
        const endH = startH + durH;

        // Determine dynamic real-time status
        let dynamicStatus: 'running' | 'paused' | 'upcoming' | 'completed' | 'clash' | 'rerouted' = 'upcoming';
        if (s.status === 'clash') {
          dynamicStatus = 'clash';
        } else if (s.status === 'rerouted') {
          dynamicStatus = 'rerouted';
        } else if (activeDisruptionCount > 0 && (s.machine_id === 'CNC-02' || (s as any).resource_id === 'CNC-02')) {
          dynamicStatus = 'paused';
        } else if (currentDecimalHour >= startH && currentDecimalHour < endH) {
          dynamicStatus = 'running';
        } else if (currentDecimalHour >= endH) {
          dynamicStatus = 'completed';
        } else {
          dynamicStatus = 'upcoming';
        }

        return {
          id: s.id || `SCH-${String(idx + 1).padStart(3, '0')}`,
          time: formatSlotTime(startH, durH),
          machine: s.machine_id || (s as any).resource_id || 'CNC-01',
          order: s.order_id || 'ORD-101',
          operation: s.operation || (s as any).step_name || 'Precision Machining',
          status: dynamicStatus,
          estimatedDuration: `${durH}h 00m`,
          operator: (s as any).operator || `Tech-${(idx % 4) + 1}`,
          isCustom: Boolean((s as any).is_custom || s.id?.startsWith('SCH-') && Number(s.id.replace('SCH-', '')) > 6),
        };
      })
    : [
        { id: 'SCH-001', time: '08:00 AM - 10:00 AM', machine: 'CNC-01', order: 'ORD-101', operation: 'Gear Housing 5-Axis Facing', status: 'completed' as const, estimatedDuration: '2h 00m', operator: 'Tech-1', isCustom: false },
        { id: 'SCH-002', time: '10:00 AM - 12:00 PM', machine: 'CNC-02', order: 'ORD-102', operation: 'Shaft Component Boring', status: activeDisruptionCount > 0 ? ('paused' as const) : ('running' as const), estimatedDuration: '2h 00m', operator: 'Tech-2', isCustom: false },
        { id: 'SCH-003', time: '12:00 PM - 02:00 PM', machine: 'CNC-03', order: 'ORD-103', operation: 'Valve Body Hydro Contouring', status: 'upcoming' as const, estimatedDuration: '2h 00m', operator: 'Tech-3', isCustom: false },
        { id: 'SCH-004', time: '02:00 PM - 04:00 PM', machine: 'CNC-04', order: 'ORD-104', operation: 'Bracket Structural Slotting', status: 'upcoming' as const, estimatedDuration: '2h 00m', operator: 'Tech-4', isCustom: false },
        { id: 'SCH-005', time: '04:00 PM - 06:00 PM', machine: 'CNC-05', order: 'ORD-105', operation: 'Bearing Housing Lathing', status: 'upcoming' as const, estimatedDuration: '2h 00m', operator: 'Tech-1', isCustom: false },
        { id: 'SCH-006', time: '06:00 PM - 08:00 PM', machine: 'EDM-01', order: 'ORD-106', operation: 'Die Sinking Wire Cut', status: 'upcoming' as const, estimatedDuration: '2h 00m', operator: 'Tech-2', isCustom: false },
      ];

  const filteredSlots = selectedMachine === 'all'
    ? timelineSlots
    : timelineSlots.filter((slot) => slot.machine === selectedMachine);

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none font-sans text-slate-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#38BDF8]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Production Schedule Timeline</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic sequence planning, machine dispatch windows, and clash collision mitigation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Add Schedule Button */}
          {onOpenAddSchedule && (
            <button
              type="button"
              onClick={onOpenAddSchedule}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00F2FE] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0369A1] text-black text-xs font-bold transition shadow-lg shadow-[#00F2FE]/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Schedule</span>
            </button>
          )}

          {/* Machine Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="h-8 px-3 rounded-lg bg-[#0E1726] border border-[#182840] text-xs text-slate-200 focus:outline-none focus:border-[#00F2FE] cursor-pointer"
            >
              <option value="all">All Machines ({machines.length || 6})</option>
              {Array.from(new Set(timelineSlots.map((s) => s.machine))).map((mId) => (
                <option key={mId} value={mId}>
                  {mId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Real-time Shift & Floor Clock Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#0B1320] border border-[#132238]">
        {/* Real-Time Digital Clock */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE]">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Live Shop Floor Clock
            </div>
            <div className="text-base font-mono font-bold text-white">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
            <div className="text-[10px] text-slate-400">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Current Active Shift */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#4EDEA3]/10 border border-[#4EDEA3]/30 flex items-center justify-center text-[#4EDEA3]">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Active Operational Shift
            </div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{activeShiftName}</span>
            </div>
            <div className="text-[10px] font-mono text-[#4EDEA3]">
              Window: {activeShiftWindow}
            </div>
          </div>
        </div>

        {/* Dispatch Summary */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Timeline Allocation
            </div>
            <div className="text-xs font-bold text-white">
              {filteredSlots.length} Task Slots Active
            </div>
            <div className="text-[10px] text-slate-400">
              {filteredSlots.filter((s) => s.status === 'running').length} in progress • {filteredSlots.filter((s) => s.status === 'upcoming').length} queued
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Schedule Table */}
      <div className="rounded-xl bg-[#0B1320] border border-[#132238] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-[#132238] bg-[#0E1726]/60 font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">SCHEDULED WINDOW</th>
                <th className="py-3 px-4 font-semibold">WORKSTATION</th>
                <th className="py-3 px-4 font-semibold">ORDER ID</th>
                <th className="py-3 px-4 font-semibold">OPERATION / TASK</th>
                <th className="py-3 px-4 font-semibold">DURATION</th>
                <th className="py-3 px-4 font-semibold">OPERATOR</th>
                <th className="py-3 px-4 font-semibold text-center">STATUS</th>
                {onDeleteSchedule && <th className="py-3 px-4 font-semibold text-right">ACTION</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132238]">
              {filteredSlots.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No scheduled operations matching filter. Click "+ Add Schedule" to dispatch a work order task.
                  </td>
                </tr>
              ) : (
                filteredSlots.map((slot) => {
                  const isRunning = slot.status === 'running';
                  const isPaused = slot.status === 'paused';
                  const isClash = slot.status === 'clash';
                  const isRerouted = slot.status === 'rerouted';
                  const isCompleted = slot.status === 'completed';

                  return (
                    <tr key={slot.id} className="hover:bg-[#0E1726] transition group">
                      <td className="py-3 px-4 font-mono font-medium text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>{slot.time}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-1.5">
                        <Cpu className="h-3.5 w-3.5 text-[#00F2FE]" />
                        <span>{slot.machine}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#00F2FE] font-semibold">{slot.order}</td>
                      <td className="py-3 px-4 text-slate-200">{slot.operation}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{slot.estimatedDuration}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{slot.operator}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase font-mono ${
                            isRunning
                              ? 'bg-[#4EDEA3]/15 text-[#4EDEA3] border border-[#4EDEA3]/30'
                              : isPaused || isClash
                              ? 'bg-[#FF5C5C]/15 text-[#FF5C5C] border border-[#FF5C5C]/30'
                              : isRerouted
                              ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30'
                              : isCompleted
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-[#182840] text-slate-400 border border-[#1E3557]'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isRunning
                                ? 'bg-[#4EDEA3] animate-pulse'
                                : isPaused || isClash
                                ? 'bg-[#FF5C5C] animate-pulse'
                                : isRerouted
                                ? 'bg-[#00F2FE]'
                                : isCompleted
                                ? 'bg-slate-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span>{slot.status}</span>
                        </span>
                      </td>
                      {onDeleteSchedule && (
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteSchedule(slot.id)}
                            title="Delete Schedule Task"
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-60 group-hover:opacity-100 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
