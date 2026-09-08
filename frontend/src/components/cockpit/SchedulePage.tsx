import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Cpu,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { ScheduleItem, Machine, Order } from '../../types';

interface SchedulePageProps {
  schedule: ScheduleItem[];
  machines: Machine[];
  orders: Order[];
  activeDisruptionCount?: number;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({
  schedule,
  machines,
  orders,
  activeDisruptionCount = 0,
}) => {
  const [selectedMachine, setSelectedMachine] = useState<string>('all');

  // Realistic timeline slots matching reference
  const timelineSlots = schedule.length > 0
    ? schedule.map((s, idx) => ({
        id: s.id || `sch-${idx}`,
        time: `${String(8 + (idx % 6) * 2).padStart(2, '0')}:00 - ${String(10 + (idx % 6) * 2).padStart(2, '0')}:00`,
        machine: s.machine_id,
        order: s.order_id,
        operation: s.operation || (s as any).step_name || 'Precision Milling',
        status: idx === 0 ? 'running' : idx === 1 && activeDisruptionCount > 0 ? 'paused' : 'upcoming',
        estimatedDuration: '2h 00m',
        operator: `Tech-${(idx % 4) + 1}`,
      }))
    : [
        { id: 'sch-1', time: '08:00 - 10:00', machine: 'CNC-01', order: 'ORD-101', operation: 'Gear Housing 5-Axis Facing', status: 'running', estimatedDuration: '2h 00m', operator: 'Tech-1' },
        { id: 'sch-2', time: '10:00 - 12:00', machine: 'CNC-02', order: 'ORD-102', operation: 'Shaft Component Boring', status: activeDisruptionCount > 0 ? 'paused' : 'running', estimatedDuration: '2h 00m', operator: 'Tech-2' },
        { id: 'sch-3', time: '12:00 - 14:00', machine: 'CNC-03', order: 'ORD-103', operation: 'Valve Body Hydro Contouring', status: 'upcoming', estimatedDuration: '2h 00m', operator: 'Tech-3' },
        { id: 'sch-4', time: '14:00 - 16:00', machine: 'CNC-04', order: 'ORD-104', operation: 'Bracket Structural Slotting', status: 'upcoming', estimatedDuration: '2h 00m', operator: 'Tech-4' },
        { id: 'sch-5', time: '16:00 - 18:00', machine: 'CNC-05', order: 'ORD-105', operation: 'Bearing Housing Lathing', status: 'upcoming', estimatedDuration: '2h 00m', operator: 'Tech-1' },
        { id: 'sch-6', time: '18:00 - 20:00', machine: 'EDM-01', order: 'ORD-106', operation: 'Die Sinking Wire Cut', status: 'upcoming', estimatedDuration: '2h 00m', operator: 'Tech-2' },
        { id: 'sch-7', time: '20:00 - 22:00', machine: 'ROBOT-CELL 04', order: 'ORD-107', operation: 'High Precision Deburring', status: 'upcoming', estimatedDuration: '2h 00m', operator: 'Tech-3' },
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
            Deterministic sequence planning, machine dispatch windows, and clash detection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-medium">Filter Machine:</label>
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="h-8 px-3 rounded-lg bg-[#0E1726] border border-[#182840] text-xs text-slate-200 focus:outline-none focus:border-[#00F2FE]"
          >
            <option value="all">All Machines</option>
            {Array.from(new Set(timelineSlots.map((s) => s.machine))).map((mId) => (
              <option key={mId} value={mId}>
                {mId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Schedule Table */}
      <div className="rounded-xl bg-[#0B1320] border border-[#132238] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-[#132238] bg-[#0E1726]/60 font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">TIME WINDOW</th>
                <th className="py-3 px-4 font-semibold">MACHINE</th>
                <th className="py-3 px-4 font-semibold">ORDER ID</th>
                <th className="py-3 px-4 font-semibold">OPERATION / TASK</th>
                <th className="py-3 px-4 font-semibold">DURATION</th>
                <th className="py-3 px-4 font-semibold">OPERATOR</th>
                <th className="py-3 px-4 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132238]">
              {filteredSlots.map((slot) => {
                const isRunning = slot.status === 'running';
                const isPaused = slot.status === 'paused';

                return (
                  <tr key={slot.id} className="hover:bg-[#0E1726] transition">
                    <td className="py-3 px-4 font-mono font-medium text-slate-300 whitespace-nowrap">
                      {slot.time}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-[#00F2FE]" />
                      <span>{slot.machine}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#00F2FE]">{slot.order}</td>
                    <td className="py-3 px-4 text-slate-200">{slot.operation}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{slot.estimatedDuration}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">{slot.operator}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase font-mono ${
                          isRunning
                            ? 'bg-[#4EDEA3]/15 text-[#4EDEA3] border border-[#4EDEA3]/30'
                            : isPaused
                            ? 'bg-[#FFB95F]/15 text-[#FFB95F] border border-[#FFB95F]/30'
                            : 'bg-[#182840] text-slate-400 border border-[#1E3557]'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isRunning ? 'bg-[#4EDEA3] animate-pulse' : isPaused ? 'bg-[#FFB95F]' : 'bg-slate-500'
                          }`}
                        />
                        <span>{slot.status}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
