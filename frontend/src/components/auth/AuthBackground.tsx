import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';
import { PulseLogo } from '../branding/PulseLogo';

interface AuthBackgroundProps {
  children: React.ReactNode;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col justify-between selection:bg-primary selection:text-on-primary relative overflow-hidden font-sans">
      {/* Background Decorative Cockpit Grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E242C_1px,transparent_1px),linear-gradient(to_bottom,#1E242C_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_35%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      {/* Ambient Lighting Gradients */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-primary/10 via-primary-container/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[500px] h-[350px] bg-gradient-to-t from-secondary/10 to-transparent blur-3xl pointer-events-none" />

      {/* Subtle Digital Twin Network Visualization in Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none overflow-hidden">
        <svg
          className="w-[1200px] h-[650px] text-primary"
          viewBox="0 0 1200 650"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Interconnecting Telemetry Data Bus Lines */}
          <path
            d="M 150,325 L 350,180 L 600,220 L 850,150 L 1050,300"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="animate-pulse opacity-40"
          />
          <path
            d="M 200,480 L 420,420 L 600,220 L 820,460 L 1020,440"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            className="opacity-30"
          />
          <path
            d="M 350,180 L 420,420 M 600,220 L 600,450 M 850,150 L 820,460"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="2 4"
            className="opacity-25"
          />

          {/* Machine Nodes with Pulsing Halos */}
          <g transform="translate(150, 325)">
            <circle r="14" fill="#181C22" stroke="#4CD7F6" strokeWidth="2" />
            <circle r="4" fill="#4CD7F6" className="animate-ping" />
            <text x="20" y="4" fill="#BCC9CD" fontSize="10" fontFamily="monospace">
              SMT-LINE-01
            </text>
          </g>

          <g transform="translate(350, 180)">
            <circle r="16" fill="#181C22" stroke="#4CD7F6" strokeWidth="2" />
            <circle r="5" fill="#4CD7F6" />
            <text x="24" y="4" fill="#BCC9CD" fontSize="10" fontFamily="monospace">
              CNC-MILL-03 [98.2%]
            </text>
          </g>

          <g transform="translate(600, 220)">
            <polygon
              points="0,-18 16,10 -16,10"
              fill="#181C22"
              stroke="#4EDEA3"
              strokeWidth="2"
            />
            <circle r="4" fill="#4EDEA3" className="animate-pulse" />
            <text x="22" y="4" fill="#4EDEA3" fontSize="10" fontFamily="monospace" fontWeight="bold">
              ORCHESTRATOR • ACTIVE
            </text>
          </g>

          <g transform="translate(850, 150)">
            <circle r="15" fill="#181C22" stroke="#4CD7F6" strokeWidth="2" />
            <circle r="4" fill="#4CD7F6" />
            <text x="22" y="4" fill="#BCC9CD" fontSize="10" fontFamily="monospace">
              ROBOT-CELL-02
            </text>
          </g>

          <g transform="translate(1050, 300)">
            <circle r="13" fill="#181C22" stroke="#4CD7F6" strokeWidth="2" />
            <circle r="4" fill="#4CD7F6" />
            <text x="-95" y="4" fill="#BCC9CD" fontSize="10" fontFamily="monospace">
              INJ-MOLD-04
            </text>
          </g>

          <g transform="translate(420, 420)">
            <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#181C22" stroke="#4CD7F6" strokeWidth="1.5" />
            <text x="18" y="4" fill="#869397" fontSize="9" fontFamily="monospace">
              AGV-DISPATCH-01
            </text>
          </g>

          <g transform="translate(820, 460)">
            <rect x="-10" y="-10" width="20" height="20" rx="4" fill="#181C22" stroke="#4CD7F6" strokeWidth="1.5" />
            <text x="18" y="4" fill="#869397" fontSize="9" fontFamily="monospace">
              OPTICAL-INSPECTION
            </text>
          </g>
        </svg>
      </div>

      {/* Top Banner Header */}
      <header className="px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low/80 backdrop-blur-md relative z-10 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PulseLogo size="md" taglineText="Factory Operations Intelligence" />
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-surface-container text-primary border border-outline-variant/40 font-mono">
              Security Gateway
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-on-surface-variant font-mono">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-outline-variant/40">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-on-surface">Industrial IoT Gateway: Online</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-[11px]">Zero-Trust Enclave</span>
            </div>
          </div>
        </div>
      </header>

      {/* Form Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        {children}
      </main>

      {/* Bottom Telemetry Ticker */}
      <footer className="border-t border-outline-variant/30 bg-surface-container-lowest px-6 py-3 relative z-10 font-mono text-[11px] text-on-surface-variant">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-primary">
              <Cpu className="h-3.5 w-3.5" />
              <span>CORE PIPELINE: SENTINEL • IMPACT • STRATEGIST • ORACLE</span>
            </span>
            <span className="hidden md:inline text-outline-variant">|</span>
            <span className="hidden md:inline text-on-surface-variant">ENCRYPTION: AES-256-GCM</span>
          </div>
          <div>PULSE Factory Intelligence • Operations Cockpit v4.19</div>
        </div>
      </footer>
    </div>
  );
};
