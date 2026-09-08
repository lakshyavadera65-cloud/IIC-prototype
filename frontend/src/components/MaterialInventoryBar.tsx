import React from 'react';
import { MaterialState } from '../types';
import { Boxes, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MaterialInventoryBarProps {
  materials: MaterialState[];
  disruptedMaterialId?: string;
}

export const MaterialInventoryBar: React.FC<MaterialInventoryBarProps> = ({
  materials,
  disruptedMaterialId,
}) => {
  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800/90 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Boxes className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
            Raw Material Buffer & Supplier Logistics
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Safety Stock Thresholds
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {materials.map((mat) => {
          const isLow = mat.available_quantity <= mat.safety_stock;
          const isDisrupted = disruptedMaterialId === mat.id;
          const percentage = Math.min(100, Math.round((mat.available_quantity / (mat.safety_stock * 2.5)) * 100));

          return (
            <div
              key={mat.id}
              className={`p-3 rounded-lg border transition-all ${
                isDisrupted || isLow
                  ? 'bg-amber-950/20 border-amber-500/60 ring-1 ring-amber-500/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-200">{mat.id}</span>
                {isLow ? (
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Low Buffer
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="h-3 w-3" />
                    Optimal
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-300 font-medium truncate mb-2">
                {mat.name}
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>Stock: {mat.available_quantity} {mat.unit}</span>
                  <span>Safety: {mat.safety_stock}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isLow ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.max(10, percentage)}%` }}
                  />
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-800/60 flex justify-between text-[10px] text-slate-500 font-mono">
                <span>{mat.supplier}</span>
                <span>LT: {mat.lead_time_days}d</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
