import React from 'react';
import { OrderState } from '../types';
import { Package, AlertCircle, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

interface OrdersTableProps {
  orders: OrderState[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'high':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'medium':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'at_risk':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-950/90 border border-rose-700 px-2 py-0.5 rounded animate-pulse">
            <AlertCircle className="h-3 w-3 text-rose-400" />
            At Risk
          </span>
        );
      case 'recovered':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/90 border border-emerald-700 px-2 py-0.5 rounded">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            Recovered
          </span>
        );
      case 'delayed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/90 border border-amber-700 px-2 py-0.5 rounded">
            <Clock className="h-3 w-3 text-amber-400" />
            Delayed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded">
            <CheckCircle className="h-3 w-3 text-cyan-400" />
            On Schedule
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-xl border border-slate-800/90 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-200">
            Workorders & SLA Commitment Registry
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {orders.length} Active Workorders
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <th className="pb-2 pl-2">Order / Customer</th>
              <th className="pb-2">Product</th>
              <th className="pb-2">Priority</th>
              <th className="pb-2">Stage</th>
              <th className="pb-2">Deadline</th>
              <th className="pb-2">Status</th>
              <th className="pb-2 text-right pr-2">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {orders.map((o) => (
              <tr
                key={o.id}
                className={`transition-colors hover:bg-slate-800/40 ${
                  o.status === 'at_risk' ? 'bg-rose-950/15' : ''
                }`}
              >
                <td className="py-2.5 pl-2 font-bold text-slate-200">
                  <div>{o.id}</div>
                  <div className="text-[10px] text-slate-400 font-sans font-normal">{o.customer}</div>
                </td>
                <td className="py-2.5 text-slate-300 font-sans">
                  <div>{o.product}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{o.required_quantity} units</div>
                </td>
                <td className="py-2.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(o.priority)}`}>
                    {o.priority}
                  </span>
                </td>
                <td className="py-2.5 text-slate-300 font-sans text-[11px]">
                  {o.current_stage}
                </td>
                <td className="py-2.5 text-slate-300">
                  +{o.deadline_hours.toFixed(1)}h
                </td>
                <td className="py-2.5">
                  {getStatusBadge(o.status)}
                </td>
                <td className="py-2.5 text-right pr-2 text-slate-300">
                  ₹{o.revenue_value.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
