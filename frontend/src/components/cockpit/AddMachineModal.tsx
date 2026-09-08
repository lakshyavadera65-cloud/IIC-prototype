import React, { useState } from 'react';
import { X, Plus, Cpu, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import { MachineFormData } from '../../types';

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MachineFormData) => Promise<void>;
}

const PRESET_TYPES = [
  'Precision CNC',
  'Standard CNC',
  '5-Axis CNC Mill',
  'CNC Lathe',
  'Surface Finishing',
  'Assembly Station',
  'Quality Inspection Station',
  'Packaging Station',
];

const PRESET_DEPTS = [
  'Precision Machining',
  'Assembly',
  'Finishing',
  'Quality Control',
  'Packaging',
];

const PRESET_CAPABILITIES = [
  'Precision Cutting',
  'Gear Machining',
  'Milling',
  'Drilling',
  'Sub-Assembly',
  'Surface Finishing',
  'Quality Inspection',
  'Packaging',
];

export const AddMachineModal: React.FC<AddMachineModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('CNC-03');
  const [customId, setCustomId] = useState('CNC-03');
  const [type, setType] = useState('Precision CNC');
  const [department, setDepartment] = useState('Precision Machining');
  const [status, setStatus] = useState<'operational' | 'idle' | 'maintenance' | 'offline'>('operational');
  const [capacity, setCapacity] = useState<number>(50);
  const [selectedCaps, setSelectedCaps] = useState<string[]>(['Precision Cutting', 'Gear Machining']);
  const [newCapInput, setNewCapInput] = useState('');
  const [utilization, setUtilization] = useState<number>(70);
  const [overtimeAvailable, setOvertimeAvailable] = useState<boolean>(true);
  const [overtimeCost, setOvertimeCost] = useState<number>(2500);
  const [notes, setNotes] = useState('High-speed dynamic buffer workstation for emergency workload absorption.');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleCapability = (cap: string) => {
    setSelectedCaps((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const handleAddCustomCap = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = newCapInput.trim();
    if (trimmed && !selectedCaps.includes(trimmed)) {
      setSelectedCaps((prev) => [...prev, trimmed]);
      setNewCapInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!name.trim()) {
      setErrorMsg('Machine Name is required.');
      return;
    }
    if (!capacity || capacity <= 0) {
      setErrorMsg('Production capacity must be a positive number.');
      return;
    }
    if (utilization < 0 || utilization > 100) {
      setErrorMsg('Utilization must be between 0% and 100%.');
      return;
    }
    if (overtimeCost < 0) {
      setErrorMsg('Overtime cost cannot be negative.');
      return;
    }
    if (selectedCaps.length === 0) {
      setErrorMsg('At least one capability must be selected.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: MachineFormData = {
        name: name.trim(),
        id: customId.trim().toUpperCase() || undefined,
        type,
        department,
        status,
        capacity_per_hour: Number(capacity),
        capabilities: selectedCaps,
        utilization: Number(utilization),
        overtime_available: overtimeAvailable,
        overtime_cost_per_hour: Number(overtimeCost),
        notes: notes.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add machine. Please verify inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-low border border-outline-variant/40 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden font-sans my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-lowest">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded border border-primary/30">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  CONFIG-NODE 01
                </span>
                <span className="font-mono text-xs text-on-surface-variant">
                  // NEW WORKSTATION PROVISIONING
                </span>
              </div>
              <h2 className="text-headline-sm font-mono font-bold text-on-surface mt-0.5 uppercase">
                Add Manufacturing Workstation
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-space-md max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-error/15 border border-error/40 rounded text-xs text-error font-mono">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Name & ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">
                Machine Display Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CNC Machine 03"
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">
                Machine ID <span className="text-on-surface-variant/60">(Uppercase Slug)</span>
              </label>
              <input
                type="text"
                value={customId}
                onChange={(e) => setCustomId(e.target.value.toUpperCase())}
                placeholder="e.g. CNC-03"
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary uppercase"
              />
            </div>
          </div>

          {/* Row 2: Type & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">
                Machine Architecture / Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
              >
                {PRESET_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-surface-container-lowest">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">
                Workstation / Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
              >
                {PRESET_DEPTS.map((d) => (
                  <option key={d} value={d} className="bg-surface-container-lowest">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Initial Status */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5">
              Initial Operational Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['operational', 'idle', 'maintenance', 'offline'] as const).map((s) => {
                const isActive = status === s;
                const colorMap = {
                  operational: 'border-secondary text-secondary bg-secondary/10',
                  idle: 'border-tertiary text-tertiary bg-tertiary/10',
                  maintenance: 'border-amber-400 text-amber-300 bg-amber-500/10',
                  offline: 'border-error text-error bg-error/10',
                };
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-2 px-3 rounded border font-mono text-[11px] uppercase font-bold transition-all text-center ${
                      isActive
                        ? colorMap[s]
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant/60 bg-surface-container-lowest'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 4: Capacity & Utilization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">
                Production Capacity (Units / Hour) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  placeholder="e.g. 50"
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary pr-16"
                  required
                />
                <span className="absolute right-3 top-2 font-mono text-[10px] text-on-surface-variant pointer-events-none">
                  u/hr
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant">
                  Target Utilization Rate
                </label>
                <span className="font-mono text-xs font-bold text-primary">{utilization}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={utilization}
                onChange={(e) => setUtilization(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-lowest rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* Row 5: Capabilities Multi-Select */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1.5">
              Supported Operations &amp; Capabilities <span className="text-error">*</span>
              <span className="text-on-surface-variant/60 ml-2 font-normal normal-case">
                (Used by Multi-Agent Solver to route disruption reroutes)
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_CAPABILITIES.map((cap) => {
                const isSelected = selectedCaps.includes(cap);
                return (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => toggleCapability(cap)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/15 text-primary font-bold'
                        : 'border-outline-variant/30 text-on-surface-variant hover:border-outline-variant bg-surface-container-lowest'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {cap}
                  </button>
                );
              })}
            </div>
            {/* Custom capability write-in */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCapInput}
                onChange={(e) => setNewCapInput(e.target.value)}
                onKeyDown={handleAddCustomCap}
                placeholder="Add custom capability (e.g. Micro-Drilling) + Press Enter"
                className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded px-3 py-1.5 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleAddCustomCap}
                className="px-3 py-1.5 rounded border border-outline-variant/50 bg-surface-container hover:bg-surface-variant text-xs font-mono text-on-surface"
              >
                Add
              </button>
            </div>
          </div>

          {/* Row 6: Overtime Toggle & Cost */}
          <div className="p-3 bg-surface-container-lowest rounded border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOvertimeAvailable(!overtimeAvailable)}
                className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                  overtimeAvailable ? 'bg-secondary' : 'bg-surface-variant'
                }`}
              >
                <div
                  className={`bg-black w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                    overtimeAvailable ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div>
                <span className="font-mono text-xs font-bold text-on-surface block">
                  Overtime Shift Authorization
                </span>
                <span className="font-mono text-[10px] text-on-surface-variant">
                  Allow Strategist Agent to schedule emergency overtime shifts (Plan C)
                </span>
              </div>
            </div>
            {overtimeAvailable && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-on-surface-variant whitespace-nowrap">
                  Overtime Rate:
                </span>
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 font-mono text-xs text-on-surface-variant">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={overtimeCost}
                    onChange={(e) => setOvertimeCost(Number(e.target.value))}
                    className="w-28 bg-surface-container border border-outline-variant/40 rounded pl-6 pr-2 py-1 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                  />
                  <span className="ml-1 font-mono text-[10px] text-on-surface-variant">
                    /hr
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Row 7: Notes */}
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">
              Engineering / Allocation Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dynamic backup workstation for high-priority batches."
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded px-3 py-2 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/30 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded font-mono text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded bg-primary hover:bg-primary-container text-on-primary font-mono text-xs font-bold transition-all glow-cyan disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning Node...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Commit Workstation to Factory</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
