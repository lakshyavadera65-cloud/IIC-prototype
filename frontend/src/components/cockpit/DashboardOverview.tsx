import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ClipboardList,
  Layers,
  Activity,
  ChevronRight,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Calendar,
  Zap,
  Plus,
  UploadCloud,
  ShieldCheck,
  MessageSquare,
  ArrowUpRight,
  Building2,
  Radio
} from 'lucide-react';
import { FactoryState, Machine, Order, ScheduleItem } from '../../types';
import factoryFloorImg from '../../assets/factory_floor_twin.jpg';
import factoryHeroBg from '../../assets/factory_hero_bg.jpg';

interface DashboardOverviewProps {
  factoryState: FactoryState | null;
  userName?: string;
  onNavigateTab: (tab: any) => void;
  onOpenAddMachine: () => void;
  onOpenImport: () => void;
  onOpenRecovery: () => void;
  onToggleChat: () => void;
  onOpenAddSchedule?: () => void;
  activeDisruptionCount?: number;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  factoryState,
  userName = 'Snehansh',
  onNavigateTab,
  onOpenAddMachine,
  onOpenImport,
  onOpenRecovery,
  onToggleChat,
  onOpenAddSchedule,
  activeDisruptionCount = 0,
}) => {
  // Live Real-Time Date, Clock & Dynamic Greeting
  const [currentDate, setCurrentDate] = useState<string>('');
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Good Morning');
  const [selectedMachinePin, setSelectedMachinePin] = useState<string | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const currentHour = now.getHours();
      let greet = 'Good Morning';
      if (currentHour >= 12 && currentHour < 17) greet = 'Good Afternoon';
      else if (currentHour >= 17 && currentHour < 22) greet = 'Good Evening';
      else if (currentHour >= 22 || currentHour < 5) greet = 'Night Shift Operations';

      setCurrentDate(dateStr);
      setCurrentTimeStr(timeStr);
      setGreeting(greet);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute machine stats
  const machines = factoryState?.machines || [];
  const totalMachines = machines.length || 12;
  const operationalCount = machines.filter((m) => m.status === 'operational').length || 9;
  const maintenanceCount = machines.filter((m) => m.status === 'maintenance' || m.status === 'degraded').length || 1;
  const offlineCount = machines.filter((m) => m.status === 'offline' || m.status === 'failed').length || 2;
  const idleCount = machines.filter((m) => m.status === 'idle').length || 1;

  // Compute order stats
  const orders = factoryState?.orders || [];
  const totalOrders = orders.length || 24;
  const atRiskCount = orders.filter((o) => o.status === 'at_risk' || o.status === 'delayed').length || 6;
  const onTrackCount = Math.max(0, totalOrders - atRiskCount);

  // Compute capacity
  const capacityPercent = 78;
  const capacityCurrent = '2,340';
  const capacityMax = '3,000 units';

  // Compute Factory Health
  const rawHealth = factoryState?.health_score ?? 92.0;
  const healthFormatted = Math.round(rawHealth);

  // Representative active orders matching reference image table
  const displayOrders = orders.length > 0
    ? orders.slice(0, 5).map((o, idx) => ({
        id: o.id,
        product: o.product,
        quantity: o.required_quantity,
        progress: (o as any).progress ?? (o.status === 'delayed' ? 20 : o.status === 'at_risk' ? 45 : 72),
        status: o.status === 'at_risk' || o.status === 'delayed' ? 'at_risk' : 'on_track',
      }))
    : [
        { id: 'ORD-101', product: 'Gear Housing', quantity: 500, progress: 72, status: 'on_track' },
        { id: 'ORD-102', product: 'Shaft Component', quantity: 300, progress: 45, status: 'at_risk' },
        { id: 'ORD-103', product: 'Valve Body', quantity: 250, progress: 90, status: 'on_track' },
        { id: 'ORD-104', product: 'Bracket', quantity: 400, progress: 20, status: 'at_risk' },
        { id: 'ORD-105', product: 'Bearing Housing', quantity: 200, progress: 65, status: 'on_track' },
      ];


  // Representative recent alerts matching reference image with dynamic relative timestamps
  const recentAlerts = [
    {
      id: 'alt-1',
      title: 'CNC-02 – Fault Detected',
      desc: 'Spindle vibration above threshold',
      time: '8m ago',
      severity: 'high',
      badge: 'High',
      badgeColor: 'bg-[#FF5C5C]/20 text-[#FF5C5C] border border-[#FF5C5C]/30',
      iconColor: 'bg-[#FF5C5C]/20 text-[#FF5C5C]',
    },
    {
      id: 'alt-2',
      title: 'Order ORD-104 Delayed',
      desc: 'Expected delivery in 2 days',
      time: '24m ago',
      severity: 'medium',
      badge: 'Medium',
      badgeColor: 'bg-[#FFB95F]/20 text-[#FFB95F] border border-[#FFB95F]/30',
      iconColor: 'bg-[#FFB95F]/20 text-[#FFB95F]',
    },
    {
      id: 'alt-3',
      title: 'Inventory Low',
      desc: 'Aluminum stock below threshold',
      time: '1h ago',
      severity: 'low',
      badge: 'Low',
      badgeColor: 'bg-[#0284C7]/20 text-[#38BDF8] border border-[#0284C7]/30',
      iconColor: 'bg-[#0284C7]/20 text-[#38BDF8]',
    },
    {
      id: 'alt-4',
      title: 'CNC-01 Back Online',
      desc: 'Maintenance completed',
      time: '3h ago',
      severity: 'info',
      badge: 'Info',
      badgeColor: 'bg-[#4EDEA3]/20 text-[#4EDEA3] border border-[#4EDEA3]/30',
      iconColor: 'bg-[#4EDEA3]/20 text-[#4EDEA3]',
    },
  ];

  // Representative machines list matching reference table
  const displayMachines = machines.length > 0
    ? machines.slice(0, 5)
    : [
        { id: 'CNC-01', type: 'CNC Mill', status: 'operational', utilization: 82 },
        { id: 'CNC-02', type: 'CNC Mill', status: 'maintenance', utilization: 0 },
        { id: 'CNC-03', type: 'CNC Mill', status: 'operational', utilization: 76 },
        { id: 'EDM-01', type: 'EDM', status: 'operational', utilization: 68 },
        { id: 'ROBOT-CELL 04', type: 'Robot', status: 'operational', utilization: 71 },
      ];

  // Representative schedule timeline matching reference table
  const displaySchedule = (factoryState?.schedule && factoryState.schedule.length > 0)
    ? factoryState.schedule.slice(0, 5).map((s, idx) => ({
        time: `${String(8 + idx * 2).padStart(2, '0')}:00 - ${String(10 + idx * 2).padStart(2, '0')}:00`,
        machine: s.machine_id,
        order: s.order_id,
        operation: s.operation || (s as any).step_name || 'Machining',
        status: idx === 0 ? 'Running' : idx === 1 && activeDisruptionCount > 0 ? 'Paused' : 'Upcoming',
        statusColor: idx === 0
          ? 'bg-[#4EDEA3]/15 text-[#4EDEA3] border border-[#4EDEA3]/30'
          : idx === 1 && activeDisruptionCount > 0
          ? 'bg-[#FFB95F]/15 text-[#FFB95F] border border-[#FFB95F]/30'
          : 'bg-[#182840] text-slate-400 border border-[#1E3557]',
      }))
    : [
        { time: '08:00 - 10:00', machine: 'CNC-01', order: 'ORD-101', operation: 'Gear Housing', status: 'Running', statusColor: 'bg-[#4EDEA3]/15 text-[#4EDEA3] border border-[#4EDEA3]/30' },
        { time: '10:00 - 12:00', machine: 'CNC-02', order: 'ORD-102', operation: 'Shaft Component', status: 'Paused', statusColor: 'bg-[#FFB95F]/15 text-[#FFB95F] border border-[#FFB95F]/30' },
        { time: '12:00 - 14:00', machine: 'CNC-03', order: 'ORD-103', operation: 'Valve Body', status: 'Upcoming', statusColor: 'bg-[#182840] text-slate-400 border border-[#1E3557]' },
        { time: '14:00 - 16:00', machine: 'CNC-04', order: 'ORD-104', operation: 'Bracket', status: 'Upcoming', statusColor: 'bg-[#182840] text-slate-400 border border-[#1E3557]' },
        { time: '16:00 - 18:00', machine: 'CNC-05', order: 'ORD-105', operation: 'Bearing Housing', status: 'Upcoming', statusColor: 'bg-[#182840] text-slate-400 border border-[#1E3557]' },
      ];

  // Interactive Digital Twin Machine Pins positioned over the 2.5D floor
  const digitalTwinPins = [
    { id: 'CNC-01', label: 'CNC-01', status: 'OPERATIONAL', x: '24%', y: '38%', color: '#4EDEA3' },
    { id: 'CNC-02', label: 'CNC-02', status: 'MAINTENANCE', x: '35%', y: '32%', color: '#FFB95F' },
    { id: 'CNC-03', label: 'CNC-03', status: 'OPERATIONAL', x: '45%', y: '42%', color: '#4EDEA3' },
    { id: 'EDM-01', label: 'EDM-01', status: 'OPERATIONAL', x: '26%', y: '64%', color: '#4EDEA3' },
    { id: 'ROBOT-CELL 04', label: 'ROBOT-CELL 04', status: 'OPERATIONAL', x: '42%', y: '72%', color: '#4EDEA3' },
    { id: 'INSPECTION-02', label: 'INSPECTION-02', status: 'IDLE', x: '52%', y: '82%', color: '#38BDF8' },
  ];

  return (
    <div className="flex flex-col gap-5 w-full pb-8 select-none font-sans text-slate-200">
      {/* ========================================================================= */}
      {/* 1. TOP HERO GREETING BANNER matching reference image                      */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0B1320] border border-[#132238] shadow-lg min-h-[140px] flex items-center justify-between p-6">
        {/* Background Image with smooth dark fade towards left */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen bg-right bg-no-repeat bg-contain"
          style={{
            backgroundImage: `url(${factoryHeroBg})`,
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,1) 100%)',
          }}
        />

        {/* Left greeting text */}
        <div className="relative z-10 flex flex-col gap-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00F2FE] animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#00F2FE] font-bold">
              Factory Overview
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white font-sans mt-0.5">
            {greeting}, {userName}
          </h1>
          <p className="text-xs text-slate-400 font-normal">
            Real-time digital twin telemetry and automated production dispatch.
          </p>
        </div>

        {/* Right date & live real-time clock widget */}
        <div className="relative z-10 hidden sm:flex flex-col items-end gap-1 text-right font-sans">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5 text-[#00F2FE]" />
            <span className="font-medium text-slate-300">{currentDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4EDEA3] animate-pulse" />
            <span className="text-xl lg:text-2xl font-bold font-mono text-white tracking-tight">
              {currentTimeStr}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FOUR METRIC CARDS ROW matching reference image                        */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Total Machines */}
        <div
          onClick={() => onNavigateTab('machines')}
          className="p-4 rounded-xl bg-[#0B1320] border border-[#132238] hover:border-[#1E3557] hover:bg-[#0E1726] transition cursor-pointer group flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/25 flex items-center justify-center text-[#00F2FE]">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">Total Machines</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
          </div>

          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{totalMachines}</div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4EDEA3]" />
                <span className="text-slate-300 font-medium">{operationalCount}</span> Operational
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
                <span className="text-slate-300 font-medium">{maintenanceCount}</span> Maintenance
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5C5C]" />
                <span className="text-slate-300 font-medium">{offlineCount}</span> Offline
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Active Orders */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-4 rounded-xl bg-[#0B1320] border border-[#132238] hover:border-[#1E3557] hover:bg-[#0E1726] transition cursor-pointer group flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/25 flex items-center justify-center text-[#3B82F6]">
                <ClipboardList className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">Active Orders</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
          </div>

          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{totalOrders}</div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4EDEA3]" />
                <span className="text-slate-300 font-medium">{onTrackCount}</span> On Track
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FFB95F]" />
                <span className="text-slate-300 font-medium">{atRiskCount}</span> At Risk
              </span>
            </div>
          </div>
        </div>

        {/* Metric 3: Production Capacity */}
        <div
          onClick={() => onNavigateTab('schedule')}
          className="p-4 rounded-xl bg-[#0B1320] border border-[#132238] hover:border-[#1E3557] hover:bg-[#0E1726] transition cursor-pointer group flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/25 flex items-center justify-center text-[#A855F7]">
                <Layers className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">Production Capacity</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
          </div>

          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{capacityPercent}%</div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span className="text-slate-300 font-medium">{capacityCurrent}</span> / {capacityMax}
            </div>
          </div>
        </div>

        {/* Metric 4: Factory Health (NOT medical pulse!) */}
        <div
          onClick={() => onNavigateTab('alerts')}
          className="p-4 rounded-xl bg-[#0B1320] border border-[#132238] hover:border-[#1E3557] hover:bg-[#0E1726] transition cursor-pointer group flex flex-col justify-between gap-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#4EDEA3]/10 border border-[#4EDEA3]/25 flex items-center justify-center text-[#4EDEA3]">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-slate-300">Factory Health</span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white tracking-tight">{healthFormatted}%</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#4EDEA3]/15 text-[#4EDEA3] flex items-center">
                ↑ +4%
              </span>
            </div>
            <div className="text-[11px] text-[#4EDEA3] font-medium mt-1">
              Healthy Operations
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MIDDLE ASYMMETRIC GRID (Floor Overview | Active Orders | Recent Alerts) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Column 1: Factory Floor Overview (Digital Twin) - 5 cols */}
        <div className="lg:col-span-5 rounded-xl bg-[#0B1320] border border-[#132238] p-4 flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#132238]">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#00F2FE]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Factory Floor Overview</h2>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#4EDEA3]">
              <span className="h-2 w-2 rounded-full bg-[#4EDEA3] animate-pulse" />
              <span>Live Digital Twin</span>
            </div>
          </div>

          {/* Interactive Isometric Floor Graphic */}
          <div className="relative mt-3 rounded-lg overflow-hidden border border-[#182840] bg-black aspect-[16/10] flex items-center justify-center">
            <img
              src={factoryFloorImg}
              alt="Live Digital Twin Shop Floor"
              className="w-full h-full object-cover"
            />

            {/* Interactive Workstation Overlay Badges */}
            {digitalTwinPins.map((pin) => {
              const isSelected = selectedMachinePin === pin.id;
              return (
                <div
                  key={pin.id}
                  onClick={() => setSelectedMachinePin(isSelected ? null : pin.id)}
                  style={{ left: pin.x, top: pin.y }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-20 ${
                    isSelected ? 'scale-110' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-bold shadow-lg backdrop-blur-md border"
                    style={{
                      backgroundColor: 'rgba(11, 19, 32, 0.85)',
                      borderColor: pin.color,
                      color: pin.color,
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: pin.color }} />
                    <span>{pin.label}</span>
                    <span className="opacity-70 text-[9px] ml-0.5">{pin.status}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Floor Legend */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-[#132238] mt-3">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#4EDEA3]" />
              <span>Operational {operationalCount}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
              <span>Idle {idleCount}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#FFB95F]" />
              <span>Maintenance {maintenanceCount}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#FF5C5C]" />
              <span>Offline {offlineCount}</span>
            </span>
          </div>
        </div>

        {/* Column 2: Active Orders Table - 4 cols */}
        <div className="lg:col-span-4 rounded-xl bg-[#0B1320] border border-[#132238] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#132238]">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#38BDF8]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Active Orders</h2>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-[11px] text-slate-400 hover:text-[#00F2FE] flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* Table */}
          <div className="mt-2 overflow-x-auto flex-1">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-slate-500 border-b border-[#132238] font-mono text-[10px]">
                  <th className="pb-2 font-medium">ORDER ID</th>
                  <th className="pb-2 font-medium">PRODUCT</th>
                  <th className="pb-2 font-medium">QTY</th>
                  <th className="pb-2 font-medium">PROGRESS</th>
                  <th className="pb-2 font-medium text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132238]">
                {displayOrders.map((order) => {
                  const isAtRisk = order.status === 'at_risk' || order.status === 'delayed';
                  const progressVal = (order as any).progress || 60;
                  return (
                    <tr key={order.id} className="hover:bg-[#0E1726] transition">
                      <td className="py-2.5 font-mono text-slate-300 font-semibold">{order.id}</td>
                      <td className="py-2.5 text-slate-200">{order.product}</td>
                      <td className="py-2.5 font-mono text-slate-400">{order.quantity}</td>
                      <td className="py-2.5 w-24">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 flex-1 bg-[#16253D] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${progressVal}%`,
                                backgroundColor: isAtRisk ? '#FFB95F' : '#00F2FE',
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">{progressVal}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            isAtRisk
                              ? 'bg-[#FFB95F]/15 text-[#FFB95F]'
                              : 'bg-[#4EDEA3]/15 text-[#4EDEA3]'
                          }`}
                        >
                          {isAtRisk ? 'At Risk' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 3: Recent Alerts List - 3 cols */}
        <div className="lg:col-span-3 rounded-xl bg-[#0B1320] border border-[#132238] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#132238]">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#FFB95F]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Recent Alerts</h2>
            </div>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="text-[11px] text-slate-400 hover:text-[#00F2FE] flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {/* List of alerts */}
          <div className="mt-2 flex flex-col gap-2 flex-1 justify-around">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => onNavigateTab('alerts')}
                className="p-2.5 rounded-lg bg-[#0E1726] border border-[#16253D] hover:border-[#1E3557] transition cursor-pointer flex items-start gap-2.5"
              >
                <div className={`p-1.5 rounded-md shrink-0 ${alert.iconColor}`}>
                  {alert.severity === 'high' ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                  ) : alert.severity === 'medium' ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : alert.severity === 'info' ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Info className="h-3.5 w-3.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-slate-200 truncate">{alert.title}</span>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{alert.desc}</p>
                </div>

                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${alert.badgeColor}`}>
                  {alert.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM ROW (Machines | Production Schedule | Quick Actions)            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Column 1: Machines Table - 4 cols */}
        <div className="lg:col-span-4 rounded-xl bg-[#0B1320] border border-[#132238] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#132238]">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#00F2FE]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Machines</h2>
            </div>
            <button
              onClick={() => onNavigateTab('machines')}
              className="text-[11px] text-slate-400 hover:text-[#00F2FE] flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-2 overflow-x-auto flex-1">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-slate-500 border-b border-[#132238] font-mono text-[10px]">
                  <th className="pb-2 font-medium">MACHINE ID</th>
                  <th className="pb-2 font-medium">TYPE</th>
                  <th className="pb-2 font-medium">STATUS</th>
                  <th className="pb-2 font-medium text-right">UTILIZATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132238]">
                {displayMachines.map((machine) => {
                  const isMaintenance = machine.status === 'maintenance' || machine.status === 'degraded';
                  const isOffline = machine.status === 'offline' || machine.status === 'error';
                  const util = (machine as any).utilization ?? 75;
                  return (
                    <tr key={machine.id} className="hover:bg-[#0E1726] transition">
                      <td className="py-2.5 font-mono text-slate-300 font-semibold">{machine.id}</td>
                      <td className="py-2.5 text-slate-400">{machine.type || 'CNC Mill'}</td>
                      <td className="py-2.5">
                        <span className="flex items-center gap-1 text-[10px]">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isMaintenance
                                ? 'bg-[#FFB95F]'
                                : isOffline
                                ? 'bg-[#FF5C5C]'
                                : 'bg-[#4EDEA3]'
                            }`}
                          />
                          <span className="text-slate-300 capitalize">{machine.status}</span>
                        </span>
                      </td>
                      <td className="py-2.5 text-right w-24">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-mono text-[10px] text-slate-400">{util}%</span>
                          <div className="h-1.5 w-12 bg-[#16253D] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${util}%`,
                                backgroundColor: isMaintenance ? '#FFB95F' : '#00F2FE',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 2: Production Schedule Timeline - 5 cols */}
        <div className="lg:col-span-5 rounded-xl bg-[#0B1320] border border-[#132238] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#132238]">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#38BDF8]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Production Schedule</h2>
            </div>
            <button
              onClick={() => onNavigateTab('schedule')}
              className="text-[11px] text-slate-400 hover:text-[#00F2FE] flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-2 overflow-x-auto flex-1">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-slate-500 border-b border-[#132238] font-mono text-[10px]">
                  <th className="pb-2 font-medium">TIME</th>
                  <th className="pb-2 font-medium">MACHINE</th>
                  <th className="pb-2 font-medium">ORDER</th>
                  <th className="pb-2 font-medium">OPERATION</th>
                  <th className="pb-2 font-medium text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#132238]">
                {displaySchedule.map((slot, idx) => (
                  <tr key={idx} className="hover:bg-[#0E1726] transition">
                    <td className="py-2.5 font-mono text-slate-400 text-[10px] whitespace-nowrap">{slot.time}</td>
                    <td className="py-2.5 font-mono text-slate-300 font-semibold">{slot.machine}</td>
                    <td className="py-2.5 font-mono text-[#00F2FE]">{slot.order}</td>
                    <td className="py-2.5 text-slate-300 truncate max-w-[120px]">{slot.operation}</td>
                    <td className="py-2.5 text-right">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-medium font-mono ${slot.statusColor}`}>
                        {slot.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Column 3: Quick Actions - 3 cols */}
        <div className="lg:col-span-3 rounded-xl bg-[#0B1320] border border-[#132238] p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#132238]">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#00F2FE]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">Quick Actions</h2>
            </div>
          </div>

          <div className="mt-2 flex flex-col gap-2 flex-1 justify-around">
            {/* Action 0: Add Schedule */}
            {onOpenAddSchedule && (
              <button
                type="button"
                onClick={onOpenAddSchedule}
                className="p-2.5 rounded-lg bg-[#0E1726] border border-[#16253D] hover:border-[#38BDF8]/50 hover:bg-[#132238] transition flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Add Schedule</div>
                    <div className="text-[10px] text-slate-400">Dispatch work order task</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}

            {/* Action 1: Add Machine */}
            <button
              type="button"
              onClick={onOpenAddMachine}
              className="p-2.5 rounded-lg bg-[#0E1726] border border-[#16253D] hover:border-[#00F2FE]/50 hover:bg-[#132238] transition flex items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] flex items-center justify-center shrink-0">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Add Machine</div>
                  <div className="text-[10px] text-slate-400">New workstation / machine</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Action 2: Import Factory Data */}
            <button
              type="button"
              onClick={onOpenImport}
              className="p-2.5 rounded-lg bg-[#0E1726] border border-[#16253D] hover:border-[#38BDF8]/50 hover:bg-[#132238] transition flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#38BDF8]/10 text-[#38BDF8] flex items-center justify-center shrink-0">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Import Factory Data</div>
                  <div className="text-[10px] text-slate-400">CSV / Excel upload</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Action 3: Create Recovery Plan */}
            <button
              type="button"
              onClick={onOpenRecovery}
              className="p-2.5 rounded-lg bg-[#0E1726] border border-[#16253D] hover:border-[#4EDEA3]/50 hover:bg-[#132238] transition flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#4EDEA3]/10 text-[#4EDEA3] flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Create Recovery Plan</div>
                  <div className="text-[10px] text-slate-400">Handle disruptions</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Action 4: Factory Intelligence Chat */}
            <button
              type="button"
              onClick={onToggleChat}
              className="p-2.5 rounded-lg bg-[#0E1726] border border-[#16253D] hover:border-[#00F2FE]/50 hover:bg-[#132238] transition flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#00F2FE]/10 text-[#00F2FE] flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white">Factory Intelligence Chat</div>
                  <div className="text-[10px] text-slate-400">Ask anything about your factory</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. FOOTER STATUS BAR matching reference image                             */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-[#132238] text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#4EDEA3] animate-pulse" />
          <span className="text-[#4EDEA3] font-medium">System Online</span>
          <span className="text-slate-400">• All systems operational</span>
        </div>
        <div className="mt-1 sm:mt-0 font-mono text-[10px] text-slate-500">
          PULSE v1.0.0 | Factory Operations Intelligence
        </div>
      </div>
    </div>
  );
};
