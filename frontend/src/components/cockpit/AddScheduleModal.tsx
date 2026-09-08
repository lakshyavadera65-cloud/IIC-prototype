import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Cpu,
  Layers,
  User,
  AlertCircle,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { Machine, Order, ScheduleFormData } from '../../types';

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScheduleFormData) => Promise<void> | void;
  machines: Machine[];
  orders: Order[];
}

const COMMON_OPERATIONS = [
  'CNC_MACHINING',
  'Precision 5-Axis Milling',
  'Shaft Component Boring',
  'Surface Finishing & Deburring',
  'Wire EDM Cut',
  'Robotic Laser Cladding',
  'Sub-Assembly Stage 1',
  'Final System Assembly',
  'CMM Precision Inspection',
  'Protective Surface Coating',
];

export const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  machines,
  orders,
}) => {
  const [selectedMachine, setSelectedMachine] = useState<string>(machines[0]?.id || 'CNC-01');
  const [selectedOrder, setSelectedOrder] = useState<string>(orders[0]?.id || 'ORD-101');
  const [customOrderId, setCustomOrderId] = useState<string>('');
  const [useCustomOrder, setUseCustomOrder] = useState<boolean>(false);
  const [operation, setOperation] = useState<string>(COMMON_OPERATIONS[0]);
  const [customOperation, setCustomOperation] = useState<string>('');
  const [startHour, setStartHour] = useState<number>(() => {
    const currentHour = new Date().getHours();
    return Math.min(20, Math.max(8, currentHour));
  });
  const [durationHours, setDurationHours] = useState<number>(2);
  const [operator, setOperator] = useState<string>('Tech-1');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<string>('scheduled');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetOrderId = useCustomOrder ? customOrderId.trim().toUpperCase() : selectedOrder;
  const targetOperation = operation === 'custom' ? customOperation.trim() : operation;

  // Calculate live preview window
  const startHourStr = `${String(Math.floor(startHour)).padStart(2, '0')}:${startHour % 1 ? '30' : '00'}`;
  const endHourVal = startHour + durationHours;
  const endHourStr = `${String(Math.floor(endHourVal % 24)).padStart(2, '0')}:${endHourVal % 1 ? '30' : '00'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedMachine) {
      setErrorMsg('Please select a target machine/workstation.');
      return;
    }
    if (!targetOrderId) {
      setErrorMsg('Please select or specify a valid Order ID.');
      return;
    }
    if (!targetOperation) {
      setErrorMsg('Please provide a valid operation or task name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        resource_id: selectedMachine,
        order_id: targetOrderId,
        operation: targetOperation,
        start_hour: Number(startHour),
        duration_hours: Number(durationHours),
        operator: operator.trim() || 'Tech-1',
        status,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create schedule slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-[#0B1320] border border-[#182840] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#132238] bg-[#0E1726]/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Add Production Schedule
              </h2>
              <p className="text-xs text-slate-400">
                Dispatch a work order task slot to a shop-floor machine timeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#132238] transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 flex items-center gap-2 font-mono">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Machine & Order Selection Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Machine */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-[#00F2FE]" />
                <span>Workstation / Machine</span>
              </label>
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(e.target.value)}
                className="h-9 px-3 rounded-lg bg-[#0E1726] border border-[#182840] text-slate-200 focus:outline-none focus:border-[#00F2FE] cursor-pointer"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id} — {m.name} ({m.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Order */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#38BDF8]" />
                  <span>Production Order</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomOrder(!useCustomOrder)}
                  className="text-[10px] text-[#00F2FE] hover:underline"
                >
                  {useCustomOrder ? 'Pick Existing' : '+ Custom ID'}
                </button>
              </div>

              {useCustomOrder ? (
                <input
                  type="text"
                  placeholder="e.g. ORD-109 or WO-9901"
                  value={customOrderId}
                  onChange={(e) => setCustomOrderId(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-[#0E1726] border border-[#182840] text-slate-200 focus:outline-none focus:border-[#00F2FE] font-mono"
                />
              ) : (
                <select
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-[#0E1726] border border-[#182840] text-slate-200 focus:outline-none focus:border-[#00F2FE] cursor-pointer"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.id} — {o.product} ({o.customer || 'Client'})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Operation */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-[#4EDEA3]" />
              <span>Operation / Manufacturing Stage</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="h-9 px-3 rounded-lg bg-[#0E1726] border border-[#182840] text-slate-200 focus:outline-none focus:border-[#00F2FE] cursor-pointer"
              >
                {COMMON_OPERATIONS.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
                <option value="custom">Other (Custom Operation)...</option>
              </select>

              {operation === 'custom' && (
                <input
                  type="text"
                  placeholder="Enter custom operation name"
                  value={customOperation}
                  onChange={(e) => setCustomOperation(e.target.value)}
                  className="h-9 px-3 rounded-lg bg-[#0E1726] border border-[#182840] text-slate-200 focus:outline-none focus:border-[#00F2FE]"
                />
              )}
            </div>
          </div>

          {/* Timing & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-[#070D17]/80 border border-[#132238]">
            {/* Start Hour */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#FFB95F]" />
                  <span>Start Time / Window</span>
                </label>
                <span className="font-mono text-[11px] text-[#00F2FE] font-semibold">
                  {startHourStr}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={23}
                step={1}
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className="accent-[#00F2FE] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>00:00 (Night)</span>
                <span>08:00 (Day)</span>
                <span>16:00 (Eve)</span>
                <span>23:00</span>
              </div>
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 font-medium flex items-center justify-between">
                <span>Allocated Duration</span>
                <span className="font-mono text-[11px] text-[#4EDEA3] font-semibold">
                  {durationHours} Hours
                </span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 4, 8].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDurationHours(d)}
                    className={`py-1.5 rounded-lg border text-xs font-mono transition cursor-pointer ${
                      durationHours === d
                        ? 'bg-[#00F2FE]/20 border-[#00F2FE] text-[#00F2FE] font-bold'
                        : 'bg-[#0E1726] border-[#182840] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {d}h
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Time Window: <span className="font-mono text-white font-medium">{startHourStr} - {endHourStr}</span>
              </div>
            </div>
          </div>

          {/* Operator, Status, Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Assigned Operator</span>
              </label>
              <input
                type="text"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                placeholder="Tech-1, Operator A, etc."
                className="h-9 px-3 rounded-lg bg-[#0E1726] border border-[#182840] text-slate-200 focus:outline-none focus:border-[#00F2FE]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 font-medium">Initial Dispatch Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-9 px-3 rounded-lg bg-[#0E1726] border border-[#182840] text-slate-200 focus:outline-none focus:border-[#00F2FE] cursor-pointer"
              >
                <option value="scheduled">Scheduled (Nominal)</option>
                <option value="running">In Progress (Active Shift)</option>
                <option value="urgent">Urgent / Priority</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-slate-300 font-medium">Shift Notes / Tooling Instructions (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Requires carbide insert verification prior to cycle start"
              className="h-9 px-3 rounded-lg bg-[#0E1726] border border-[#182840] text-slate-200 focus:outline-none focus:border-[#00F2FE]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#132238] mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#132238] hover:bg-[#182840] text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#00F2FE] to-[#0284C7] hover:from-[#38BDF8] hover:to-[#0369A1] text-black text-xs font-bold transition shadow-lg shadow-[#00F2FE]/20 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>{isSubmitting ? 'Scheduling...' : 'Dispatch Schedule Slot'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
