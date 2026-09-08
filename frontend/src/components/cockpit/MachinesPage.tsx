import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Trash2,
  Edit2,
  RefreshCw,
  Power
} from 'lucide-react';
import { Machine, MachineFormData } from '../../types';

interface MachinesPageProps {
  machines: Machine[];
  onOpenAddModal: () => void;
  onStatusChange: (machineId: string, status: string) => void;
  onDeleteMachine: (machineId: string) => void;
}

export const MachinesPage: React.FC<MachinesPageProps> = ({
  machines,
  onOpenAddModal,
  onStatusChange,
  onDeleteMachine,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'operational' | 'maintenance' | 'offline' | 'idle'>('all');

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.name && m.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.type && m.type.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'operational') return m.status === 'operational';
    if (statusFilter === 'maintenance') return m.status === 'maintenance' || m.status === 'degraded';
    if (statusFilter === 'offline') return m.status === 'offline' || m.status === 'failed';
    if (statusFilter === 'idle') return m.status === 'idle';
    return true;

  });

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none font-sans text-slate-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-[#00F2FE]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Machines &amp; Workstations</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, operational status, and health diagnostics for all plant equipment.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00F2FE] hover:bg-[#38BDF8] text-[#070D17] font-semibold text-xs transition shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Machine</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, name, or type..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#0E1726] border border-[#182840] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00F2FE]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'operational', 'maintenance', 'offline', 'idle'] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30'
                  : 'bg-[#0E1726] text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Machines Table */}
      <div className="rounded-xl bg-[#0B1320] border border-[#132238] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-[#132238] bg-[#0E1726]/60 font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">MACHINE ID</th>
                <th className="py-3 px-4 font-semibold">NAME / CELL</th>
                <th className="py-3 px-4 font-semibold">TYPE</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
                <th className="py-3 px-4 font-semibold">UTILIZATION</th>
                <th className="py-3 px-4 font-semibold">TEMPERATURE</th>
                <th className="py-3 px-4 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132238]">
              {filteredMachines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No machines found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMachines.map((machine) => {
                  const isMaintenance = machine.status === 'maintenance' || machine.status === 'degraded';
                  const isOffline = machine.status === 'offline' || machine.status === 'failed';
                  const util = (machine as any).utilization ?? (isOffline ? 0 : isMaintenance ? 24 : 84);

                  const temp = (machine as any).temperature || (isMaintenance ? '88°C' : '48°C');

                  return (
                    <tr key={machine.id} className="hover:bg-[#0E1726] transition">
                      <td className="py-3 px-4 font-mono font-bold text-white">{machine.id}</td>
                      <td className="py-3 px-4 text-slate-200">
                        <div className="font-medium">{machine.name || machine.id}</div>
                        <div className="text-[10px] text-slate-500">Cell 04 • Bay A</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{machine.type || 'CNC Mill'}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            isMaintenance
                              ? 'bg-[#FFB95F]/15 text-[#FFB95F] border border-[#FFB95F]/30'
                              : isOffline
                              ? 'bg-[#FF5C5C]/15 text-[#FF5C5C] border border-[#FF5C5C]/30'
                              : 'bg-[#4EDEA3]/15 text-[#4EDEA3] border border-[#4EDEA3]/30'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isMaintenance ? 'bg-[#FFB95F]' : isOffline ? 'bg-[#FF5C5C]' : 'bg-[#4EDEA3]'
                            }`}
                          />
                          <span className="capitalize">{machine.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 w-32">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-[#16253D] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${util}%`,
                                backgroundColor: isMaintenance ? '#FFB95F' : isOffline ? '#FF5C5C' : '#00F2FE',
                              }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-400">{util}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{temp}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Maintenance / Operational */}
                          <button
                            type="button"
                            onClick={() =>
                              onStatusChange(
                                machine.id,
                                machine.status === 'operational' ? 'maintenance' : 'operational'
                              )
                            }
                            title={machine.status === 'operational' ? 'Set to Maintenance' : 'Set to Operational'}
                            className="p-1.5 rounded bg-[#132238] hover:bg-[#1C2E4A] text-slate-300 hover:text-white transition"
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete / Decommission Machine */}
                          <button
                            type="button"
                            onClick={() => onDeleteMachine(machine.id)}
                            title="Decommission Machine"
                            className="p-1.5 rounded bg-[#132238] hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
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
