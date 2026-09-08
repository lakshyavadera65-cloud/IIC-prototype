import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Order } from '../../types';

interface OrdersPageProps {
  orders: Order[];
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'on_schedule' | 'at_risk' | 'delayed' | 'recovered'>('all');

  const displayOrders = orders.length > 0
    ? orders
    : [
        { id: 'ORD-101', product: 'Gear Housing', required_quantity: 500, status: 'on_schedule' as const, customer: 'Apex Aerospace', priority: 'high' as const, deadline_hours: 48, current_stage: 'Milling', material_id: 'MAT-01', material_needed: 500, required_operations: ['milling'], delay_hours: 0, revenue_value: 42000 },
        { id: 'ORD-102', product: 'Shaft Component', required_quantity: 300, status: 'at_risk' as const, customer: 'Vortex Dynamics', priority: 'critical' as const, deadline_hours: 24, current_stage: 'Boring', material_id: 'MAT-02', material_needed: 300, required_operations: ['boring'], delay_hours: 2, revenue_value: 85000 },
        { id: 'ORD-103', product: 'Valve Body', required_quantity: 250, status: 'on_schedule' as const, customer: 'HydraFlow Precision', priority: 'medium' as const, deadline_hours: 72, current_stage: 'Contouring', material_id: 'MAT-03', material_needed: 250, required_operations: ['contouring'], delay_hours: 0, revenue_value: 18000 },
        { id: 'ORD-104', product: 'Bracket Assembly', required_quantity: 400, status: 'at_risk' as const, customer: 'Titan Automotive', priority: 'critical' as const, deadline_hours: 36, current_stage: 'Slotting', material_id: 'MAT-04', material_needed: 400, required_operations: ['slotting'], delay_hours: 3, revenue_value: 60000 },
        { id: 'ORD-105', product: 'Bearing Housing', required_quantity: 200, status: 'on_schedule' as const, customer: 'Nordic Robotics', priority: 'low' as const, deadline_hours: 96, current_stage: 'Lathing', material_id: 'MAT-05', material_needed: 200, required_operations: ['lathing'], delay_hours: 0, revenue_value: 12000 },
        { id: 'ORD-106', product: 'Drive Flange', required_quantity: 350, status: 'on_schedule' as const, customer: 'Siemens Energy', priority: 'medium' as const, deadline_hours: 120, current_stage: 'Turning', material_id: 'MAT-06', material_needed: 350, required_operations: ['turning'], delay_hours: 0, revenue_value: 24000 },
        { id: 'ORD-107', product: 'Titanium Rotor Hub', required_quantity: 150, status: 'delayed' as const, customer: 'General Electric', priority: 'critical' as const, deadline_hours: 12, current_stage: 'Finishing', material_id: 'MAT-07', material_needed: 150, required_operations: ['finishing'], delay_hours: 6, revenue_value: 120000 },
      ];

  const filteredOrders = displayOrders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(term) ||
      order.product.toLowerCase().includes(term) ||
      (order.customer && order.customer.toLowerCase().includes(term));
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });


  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none font-sans text-slate-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-[#38BDF8]" />
            <h1 className="text-xl font-bold text-white tracking-tight">Active Production Orders</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track order fulfillment pipelines, delivery SLAs, machine allocations, and disruption exposure.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-[#0E1726] border border-[#182840] text-xs font-mono text-slate-300">
            Total Orders: <span className="font-bold text-white">{displayOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-xl bg-[#0B1320] border border-[#132238]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, product, customer..."
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-[#0E1726] border border-[#182840] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00F2FE]"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'on_schedule', 'at_risk', 'delayed', 'recovered'] as const).map((filter) => (

            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition whitespace-nowrap ${
                statusFilter === filter
                  ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                  : 'bg-[#0E1726] text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl bg-[#0B1320] border border-[#132238] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-[#132238] bg-[#0E1726]/60 font-mono text-[11px]">
                <th className="py-3 px-4 font-semibold">ORDER ID</th>
                <th className="py-3 px-4 font-semibold">PRODUCT</th>
                <th className="py-3 px-4 font-semibold">CUSTOMER</th>
                <th className="py-3 px-4 font-semibold">QUANTITY</th>
                <th className="py-3 px-4 font-semibold">PROGRESS</th>
                <th className="py-3 px-4 font-semibold">DUE DATE</th>
                <th className="py-3 px-4 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#132238]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No production orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isAtRisk = order.status === 'at_risk';
                  const isDelayed = order.status === 'delayed';
                  const progressVal = (order as any).progress ?? (isDelayed ? 20 : isAtRisk ? 45 : 75);
                  const dueDate = new Date(Date.now() + (order.deadline_hours || 24) * 3600000);
                  const dueDateFormatted = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <tr key={order.id} className="hover:bg-[#0E1726] transition">
                      <td className="py-3 px-4 font-mono font-bold text-white">{order.id}</td>
                      <td className="py-3 px-4 text-slate-200 font-medium">{order.product}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {order.customer || 'Apex Aerospace'}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">{order.required_quantity} units</td>

                      <td className="py-3 px-4 w-36">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 bg-[#16253D] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${progressVal}%`,
                                backgroundColor: isDelayed ? '#FF5C5C' : isAtRisk ? '#FFB95F' : '#00F2FE',
                              }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-400">{progressVal}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                        {(order as any).due_date || dueDateFormatted}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                            isDelayed
                              ? 'bg-[#FF5C5C]/15 text-[#FF5C5C] border border-[#FF5C5C]/30'
                              : isAtRisk
                              ? 'bg-[#FFB95F]/15 text-[#FFB95F] border border-[#FFB95F]/30'
                              : 'bg-[#4EDEA3]/15 text-[#4EDEA3] border border-[#4EDEA3]/30'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isDelayed ? 'bg-[#FF5C5C]' : isAtRisk ? 'bg-[#FFB95F]' : 'bg-[#4EDEA3]'
                            }`}
                          />
                          <span>{order.status.replace('_', ' ')}</span>
                        </span>
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
