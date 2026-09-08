import React from 'react';

export type CockpitTab =
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
  const navItems: Array<{ id: CockpitTab; label: string; icon: string; badge?: string | number }> = [
    { id: 'tactical-overview', label: 'Tactical Overview', icon: 'grid_view' },
    { id: 'telemetry-stream', label: 'Telemetry Feeds', icon: 'terminal' },
    { id: 'agent-orchestration', label: 'Autonomous Agents', icon: 'hub', badge: '4' },
    {
      id: 'incident-clash-matrix',
      label: 'Clash Matrix',
      icon: 'warning',
      badge: activeDisruptionCount > 0 ? activeDisruptionCount : undefined,
    },
    { id: 'hardware-health', label: 'Hardware Topology', icon: 'precision_manufacturing' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low z-50 flex flex-col justify-between py-space-md border-r border-outline-variant/30 select-none">
      {/* Top Node Indicator & Navigation */}
      <div className="flex flex-col gap-space-md">
        {/* Cockpit Node Status */}
        <div className="px-space-lg flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.6)] animate-pulse" />
            <span className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest font-semibold">
              COCKPIT NODE 04
            </span>
          </div>
          <span className="font-mono text-[9px] text-secondary bg-secondary/15 px-1.5 py-0.5 rounded font-bold">
            SYNC
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col px-space-sm gap-space-2xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-space-md py-space-sm rounded transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-space-sm truncate">
                  <span className="material-symbols-outlined text-[18px] shrink-0">
                    {item.icon}
                  </span>
                  <span className="text-body-md truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`ml-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-on-primary-container text-primary-container'
                        : item.id === 'incident-clash-matrix' && activeDisruptionCount > 0
                        ? 'bg-error text-on-error animate-pulse'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {onOpenImport && (
          <div className="px-space-md pt-1">
            <button
              type="button"
              onClick={onOpenImport}
              id="sidebar-import-btn"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded bg-surface-container hover:bg-surface-container-high border border-primary/40 text-primary hover:text-on-surface font-mono text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
              <span>Import Factory Data</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Telemetry Card */}
      <div className="px-space-md flex flex-col gap-space-xs font-mono">
        <div className="bg-surface-container p-space-sm rounded flex flex-col gap-space-2xs border border-outline-variant/30">
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant">LATENCY</span>
            <span className="text-mono-code text-secondary font-bold">4.2ms</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-label-caps text-on-surface-variant">BUFFER FILL</span>
            <span className="text-mono-code text-primary font-bold">31%</span>
          </div>
        </div>
        <div className="flex items-center justify-between px-space-xs text-[10px]">
          <span className="text-on-surface-variant">VER 4.19-SEC</span>
          <span className="text-secondary font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            ONLINE
          </span>
        </div>
      </div>
    </aside>
  );
};
