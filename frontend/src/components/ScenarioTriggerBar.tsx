import React, { useState } from 'react';
import { AlertTriangle, Zap, Send, ShieldAlert, Sparkles } from 'lucide-react';

interface ScenarioTriggerBarProps {
  onTrigger: (text: string, scenarioId?: string) => void;
  isLoading: boolean;
  activeEntity?: string;
}

const PRESET_SCENARIOS = [
  {
    id: 'SCENARIO_A',
    label: 'Scenario A: CNC-02 Failure',
    tag: 'Equipment (~45%) • 6h',
    color: 'border-rose-500/50 bg-rose-950/30 text-rose-300 hover:bg-rose-900/40',
    dotColor: 'bg-rose-500',
    prompt: 'URGENT: CNC-02 gearbox vibration failure. Estimated downtime: 6 hours.',
  },
  {
    id: 'SCENARIO_B',
    label: 'Scenario B: Aluminum Delay',
    tag: 'Supply Chain (~12%) • 24h',
    color: 'border-blue-500/50 bg-blue-950/30 text-blue-300 hover:bg-blue-900/40',
    dotColor: 'bg-blue-500',
    prompt: 'SUPPLIER DELAY: Inbound shipment of aluminum alloy M-AL delayed by 24 hours.',
  },
  {
    id: 'SCENARIO_C',
    label: 'Scenario C: Fastener Stockout',
    tag: 'Supply Chain (~12%) • Buffer Low',
    color: 'border-amber-500/50 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40',
    dotColor: 'bg-amber-500',
    prompt: 'MATERIAL SHORTAGE: Fastener inventory M-FAST dropped below safety threshold.',
  },
  {
    id: 'SCENARIO_D',
    label: 'Scenario D: MES Sync Failure',
    tag: 'IT / Software (~8%) • 4h',
    color: 'border-purple-500/50 bg-purple-950/30 text-purple-300 hover:bg-purple-900/40',
    dotColor: 'bg-purple-500',
    prompt: 'CRITICAL IT ALERT: MES database synchronization failure on Assembly Line A (ASM-A). Automated workorder dispatch halted for 4 hours due to corrupted inventory telemetry.',
  },
  {
    id: 'SCENARIO_UNSCRIPTED',
    label: 'Unscripted: Line-B Jam',
    tag: 'Mechanical Jam • 4h',
    color: 'border-slate-500/50 bg-slate-900/40 text-slate-300 hover:bg-slate-800/40',
    dotColor: 'bg-slate-400',
    prompt: 'ALERT: Assembly Line B jammed for 4 hours due to conveyor belt failure',
  },
];

export const ScenarioTriggerBar: React.FC<ScenarioTriggerBarProps> = ({
  onTrigger,
  isLoading,
  activeEntity,
}) => {
  const [customText, setCustomText] = useState('');

  const handleSubmitCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim() && !isLoading) {
      onTrigger(customText.trim(), 'CUSTOM');
      setCustomText('');
    }
  };

  return (
    <div className="bg-[#0D1322] border-b border-slate-800/80 px-4 lg:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Preset Action Buttons for Judges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400 font-bold mr-1">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>Demo Injections:</span>
          </div>

          {PRESET_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => onTrigger(sc.prompt, sc.id)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition active:scale-95 disabled:opacity-50 ${sc.color}`}
            >
              <span className={`h-2 w-2 rounded-full ${sc.dotColor} animate-pulse`}></span>
              <span>{sc.label}</span>
              <span className="text-[10px] opacity-70 bg-black/30 px-1.5 py-0.5 rounded font-mono">
                {sc.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Custom Text Disruption Input */}
        <form onSubmit={handleSubmitCustom} className="flex items-center gap-2 min-w-[280px] lg:w-96">
          <div className="relative flex-1">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Inject custom disruption alert..."
              disabled={isLoading}
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!customText.trim() || isLoading}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-900/30"
          >
            <Send className="h-3 w-3" />
            <span>Inject</span>
          </button>
        </form>
      </div>
    </div>
  );
};
