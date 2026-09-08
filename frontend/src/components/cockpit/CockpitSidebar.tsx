import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  ClipboardList,
  Calendar,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Settings,
  ChevronRight,
  Building2,
  UploadCloud
} from 'lucide-react';

export type CockpitTab =
  | 'dashboard'
  | 'machines'
  | 'orders'
  | 'schedule'
  | 'alerts'
  | 'agents'
  | 'recovery'
  | 'import'
  | 'settings'
  // Backward compatibility aliases
  | 'tactical-overview'
  | 'telemetry-stream'
  | 'agent-orchestration'
  | 'incident-clash-matrix'
  | 'hardware-health';

interface CockpitSidebarProps {
  activeTab: CockpitTab;
  onTabChange: (tab: CockpitTab) => void;
  activeDisruptionCount?: number;
  onOpenImport?: () => void;
}

export const CockpitSidebar: React.FC<CockpitSidebarProps> = ({
  activeTab,
  onTabChange,
  activeDisruptionCount = 0,
  onOpenImport,
}) => {
  // Normalize legacy tab IDs if passed
  const currentTab =
    activeTab === 'tactical-overview'
      ? 'dashboard'
      : activeTab === 'telemetry-stream' || activeTab === 'hardware-health'
      ? 'machines'
      : activeTab === 'agent-orchestration'
      ? 'agents'
      : activeTab === 'incident-clash-matrix'
      ? 'alerts'
      : activeTab;

  const navItems: Array<{
    id: CockpitTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'machines', label: 'Machines', icon: Cpu },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      badge: activeDisruptionCount > 0 ? activeDisruptionCount : 3,
      badgeColor: 'bg-[#FF5C5C] text-white',
    },
    { id: 'agents', label: 'Intelligence Agents', icon: Sparkles },
    { id: 'recovery', label: 'Recovery Plans', icon: ShieldCheck },
    { id: 'import', label: 'Data Import', icon: UploadCloud },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[#070D17] border-r border-[#132238] z-30 flex flex-col justify-between p-3 select-none">
      {/* 1. Main Navigation Links */}
      <div className="flex flex-col gap-1 pt-1">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/25 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1726]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#00F2FE]' : 'text-slate-400'}`} />
                  <span className="text-[13px]">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-[#132238] text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. Bottom Card: Factory Profile matching reference image */}
      <div className="pt-3 border-t border-[#132238]/80">
        <div className="p-3 rounded-xl bg-[#0B1320] border border-[#132238] hover:border-[#1E3557] transition flex flex-col gap-2 cursor-pointer group">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#132238] border border-[#1A2E4C] flex items-center justify-center text-[#00F2FE] shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-slate-200 truncate">CNC Precision Works</span>
              <span className="text-[10px] text-slate-400 font-mono">Factory ID: CNC-001</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#132238]/60">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#4EDEA3]/10 text-[#4EDEA3] text-[10px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4EDEA3] animate-pulse" />
              <span>Operational</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-300 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </aside>
  );
};

