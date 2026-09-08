import React from 'react';

interface PulseLogoProps {
  variant?: 'horizontal' | 'vertical' | 'mark';
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  taglineText?: string;
  className?: string;
}

export const PulseLogo: React.FC<PulseLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
  taglineText = 'Autonomous OS',
  className = '',
}) => {
  // Dimension mapping
  const markDimensions = {
    sm: { w: 28, h: 28, stroke: 2 },
    md: { w: 34, h: 34, stroke: 2.2 },
    lg: { w: 48, h: 48, stroke: 2.5 },
  }[size];

  const textSizeClasses = {
    sm: 'text-base tracking-wider',
    md: 'text-xl tracking-wider',
    lg: 'text-3xl tracking-widest',
  }[size];

  const subtextSizeClasses = {
    sm: 'text-[9px] tracking-widest',
    md: 'text-[10px] tracking-widest',
    lg: 'text-xs tracking-widest',
  }[size];

  const MarkSvg = (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: markDimensions.w, height: markDimensions.h }}
    >
      {/* Outer subtle glow ambient */}
      <div className="absolute inset-0 rounded-lg bg-primary/10 blur-sm pointer-events-none" />
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform transition-transform duration-300 hover:scale-105"
      >
        {/* Outer Circular Intelligence Track */}
        <circle
          cx="18"
          cy="18"
          r="16"
          stroke="#262A31"
          strokeWidth={markDimensions.stroke}
        />
        <circle
          cx="18"
          cy="18"
          r="16"
          stroke="url(#pulse-gradient)"
          strokeWidth={markDimensions.stroke}
          strokeDasharray="72 28"
          strokeLinecap="round"
        />

        {/* Dynamic Production Signal / Pulse Waveform */}
        <path
          d="M 5 18 H 10 L 13 10 L 18 26 L 22 13 L 25 18 H 31"
          stroke="url(#waveform-gradient)"
          strokeWidth={markDimensions.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Connected Industrial Telemetry Nodes */}
        <circle cx="13" cy="10" r="2" fill="#4EDEA3" className="animate-pulse" />
        <circle cx="18" cy="26" r="2" fill="#4CD7F6" />
        <circle cx="22" cy="13" r="2" fill="#FFB95F" />

        {/* Core Linear Gradients */}
        <defs>
          <linearGradient id="pulse-gradient" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4CD7F6" />
            <stop offset="0.6" stopColor="#06B6D4" />
            <stop offset="1" stopColor="#4EDEA3" />
          </linearGradient>
          <linearGradient id="waveform-gradient" x1="5" y1="18" x2="31" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4CD7F6" />
            <stop offset="0.5" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#4EDEA3" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{MarkSvg}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 ${className}`}>
        {MarkSvg}
        <div className="flex flex-col items-center">
          <span className={`font-black font-sans text-on-surface leading-none ${textSizeClasses}`}>
            PULSE
          </span>
          {showTagline && (
            <span className={`font-mono font-semibold text-primary uppercase mt-1 ${subtextSizeClasses}`}>
              {taglineText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {MarkSvg}
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-2">
          <span className={`font-black font-sans text-on-surface leading-none tracking-wider ${textSizeClasses}`}>
            PULSE
          </span>
          <span className="hidden sm:inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/40 text-primary uppercase">
            v4.19
          </span>
        </div>
        {showTagline && (
          <span className={`font-mono font-medium text-primary/90 uppercase tracking-widest mt-0.5 ${subtextSizeClasses}`}>
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
};
