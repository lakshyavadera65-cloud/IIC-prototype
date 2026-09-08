import React, { useState } from 'react';
import { MachineState } from '../types';
import { Cpu, Plus, CheckCircle2, ShieldAlert, Wrench, Clock, Trash2, PowerOff, ShieldCheck, AlertTriangle, Upload } from 'lucide-react';

interface MachineStatusGridProps {
  machines: MachineState[];
  activeDisruptedEntity?: string;
  onOpenAddModal?: () => void;
  onOpenImportModal?: () => void;
  onStatusChange?: (machineId: string, status: string) => Promise<void>;
  onDeleteMachine?: (machineId: string) => Promise<void>;
}

export const MachineStatusGrid: React.FC<MachineStatusGridProps> = ({
  machines,
  activeDisruptedEntity,
  onOpenAddModal,
  onOpenImportModal,
  onStatusChange,
  onDeleteMachine,
}) => {
  const [deletingMachineId, setDeletingMachineId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deletingMachineId || !onDeleteMachine) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await onDeleteMachine(deletingMachineId);
      setDeletingMachineId(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete machine.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusToggle = async (mach: MachineState) => {
    if (!onStatusChange) return;
    setUpdatingId(mach.id);
    try {
      // Cycle: operational -> maintenance -> offline -> operational
      const nextStatus =
        mach.status === 'operational'
          ? 'maintenance'
          : mach.status === 'maintenance'
          ? 'offline'
          : 'operational';
      await onStatusChange(mach.id, nextStatus);
    } catch (err: any) {
      console.error('Status change error:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-surface-container-low/90 rounded-lg border border-outline-variant/40 p-4 shadow-xl font-sans relative">
      {/* Grid Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded border border-primary/30">
            <Cpu className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-on-surface font-mono">
              Workstation Digital Twins &amp; Hardware Telemetry
            </h2>
            <p className="text-[11px] font-mono text-on-surface-variant">
              Live Edge Sensor Feed • Continuous Ingest 12.4k msg/s
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-on-surface-variant bg-surface-container-lowest px-2.5 py-1 rounded border border-outline-variant/30">
            {machines.length} Total Workstations
          </span>
          {onOpenImportModal && (
            <button
              onClick={onOpenImportModal}
              id="btn-import-factory-data"
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface-container-high border border-primary/40 text-primary font-mono text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer shadow-sm"
              title="Upload CSV or Excel file to batch import machines, orders, and schedules"
            >
              <Upload className="h-3.5 w-3.5 text-primary" />
              <span>Import Factory Data</span>
            </button>
          )}
          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              id="btn-add-machine"
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-primary text-on-primary font-mono text-xs font-bold hover:bg-primary-container transition-all glow-cyan cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>+ Add Machine</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Machines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {machines.map((mach) => {
          const isFailed = mach.status === 'failed' || mach.status === 'offline';
          const isMaintenance = mach.status === 'maintenance';
          const isIdle = mach.status === 'idle';
          const isDegraded = mach.status === 'degraded';
          const isDisrupted = activeDisruptedEntity === mach.id;
          const util = mach.current_utilization ?? mach.utilization ?? 75;

          // Utilization color
          const getUtilColor = (u: number) => {
            if (isFailed) return 'bg-error';
            if (u > 90) return 'bg-tertiary';
            if (u > 70) return 'bg-primary';
            return 'bg-secondary';
          };

          return (
            <div
              key={mach.id}
              className={`p-3 rounded border transition-all duration-200 flex flex-col justify-between ${
                isFailed || isDisrupted
                  ? 'bg-error-container/20 border-error/60 ring-1 ring-error/30'
                  : isMaintenance
                  ? 'bg-amber-950/20 border-amber-500/50'
                  : 'bg-surface-container-lowest border-outline-variant/30 hover:border-outline-variant/60'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono text-on-surface">{mach.id}</span>
                      {mach.is_custom && (
                        <span className="text-[9px] font-mono uppercase bg-primary/10 text-primary border border-primary/30 px-1 rounded">
                          CUSTOM
                        </span>
                      )}
                      <span className="text-[10px] text-on-surface-variant font-mono">[{mach.type}]</span>
                    </div>
                    <div className="text-[10px] font-mono text-on-surface-variant/80">
                      {mach.department || 'Precision Machining'}
                    </div>
                  </div>

                  {/* Status Badge */}
                  {isFailed ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-error bg-error-container/80 px-2 py-0.5 rounded border border-error animate-pulse">
                      <ShieldAlert className="h-3 w-3" />
                      Offline
                    </span>
                  ) : isMaintenance ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50">
                      <Wrench className="h-3 w-3" />
                      Maint
                    </span>
                  ) : isIdle ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-tertiary bg-surface-container-high px-2 py-0.5 rounded border border-tertiary/40">
                      <Clock className="h-3 w-3" />
                      Idle
                    </span>
                  ) : isDegraded ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-500/50">
                      Degraded
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary bg-secondary/15 px-2 py-0.5 rounded border border-secondary/40">
                      <CheckCircle2 className="h-3 w-3" />
                      Online
                    </span>
                  )}
                </div>

                <div className="text-xs text-on-surface truncate mb-2">
                  {mach.name}
                </div>

                {/* Capabilities Chips */}
                {mach.capabilities && mach.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {mach.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/20 text-on-surface-variant"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                )}

                {/* Utilization Bar */}
                <div className="mb-2.5">
                  <div className="flex justify-between text-[11px] font-mono mb-1">
                    <span className="text-on-surface-variant text-[10px] uppercase">Utilization</span>
                    <span className={`font-bold ${isFailed ? 'text-error' : 'text-on-surface'}`}>
                      {util.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getUtilColor(util)}`}
                      style={{ width: `${Math.min(100, Math.max(5, util))}%` }}
                    />
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant/20 text-[10px] font-mono text-on-surface-variant mb-2">
                  <div>
                    <span className="text-on-surface-variant/60 block">Throughput:</span>
                    <strong className="text-on-surface">{mach.capacity_per_hour} u/hr</strong>
                  </div>
                  <div>
                    <span className="text-on-surface-variant/60 block">Overtime Shift:</span>
                    <strong className="text-on-surface">
                      {mach.overtime_available ? `₹${mach.overtime_cost_per_hour}/hr` : 'Disabled'}
                    </strong>
                  </div>
                </div>

                {mach.notes && (
                  <p className="text-[10px] text-on-surface-variant/70 italic border-l-2 border-outline-variant/30 pl-1.5 mb-2 line-clamp-1">
                    "{mach.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons: Toggle Status & Delete */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => handleStatusToggle(mach)}
                  disabled={updatingId === mach.id}
                  title="Cycle status: Operational -> Maintenance -> Offline"
                  className="flex items-center gap-1 text-[10px] text-on-surface-variant hover:text-primary transition-colors py-0.5 px-1.5 rounded hover:bg-surface-container"
                >
                  <Wrench className="h-3 w-3" />
                  <span>Toggle Status</span>
                </button>

                {mach.is_custom && onDeleteMachine && (
                  <button
                    type="button"
                    onClick={() => setDeletingMachineId(mach.id)}
                    title="Decommission custom machine"
                    className="flex items-center gap-1 text-[10px] text-on-surface-variant hover:text-error transition-colors py-0.5 px-1.5 rounded hover:bg-surface-container"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingMachineId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-error/50 rounded-lg max-w-md w-full p-5 shadow-2xl font-mono text-on-surface">
            <div className="flex items-center gap-3 mb-3 text-error">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-sm font-bold uppercase">Decommission Workstation?</h3>
            </div>

            <p className="text-xs text-on-surface-variant mb-4 font-sans leading-relaxed">
              Are you sure you want to permanently remove workstation{' '}
              <strong className="text-on-surface font-mono">[{deletingMachineId}]</strong> from the factory digital twin?
              The system will verify that no active scheduled tasks are running on this node before deletion.
            </p>

            {deleteError && (
              <div className="mb-4 p-2.5 bg-error/15 border border-error/40 rounded text-xs text-error">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingMachineId(null);
                  setDeleteError(null);
                }}
                className="px-3 py-1.5 rounded text-xs text-on-surface-variant hover:bg-surface-variant"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-1.5 rounded bg-error text-black font-bold text-xs hover:bg-error/80 transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Decommission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
