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
  taglineText = 'Factory Operations Intelligence',
  className = '',
}) => {
  const markDimensions = {
    sm: { w: 26, h: 26 },
    md: { w: 32, h: 32 },
    lg: { w: 42, h: 42 },
  }[size];

  const titleSizes = {
    sm: 'text-base tracking-widest font-extrabold',
    md: 'text-lg tracking-widest font-black',
    lg: 'text-2xl tracking-widest font-black',
  }[size];

  const subSizes = {
    sm: 'text-[9px] tracking-wider font-medium text-slate-400',
    md: 'text-[10px] tracking-widest font-medium text-slate-400',
    lg: 'text-xs tracking-widest font-medium text-slate-400',
  }[size];

  // Geometric Industrial "P" Ribbon Mark constructed from manufacturing/machining facets
  const MarkSvg = (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: markDimensions.w, height: markDimensions.h }}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_2px_8px_rgba(0,242,254,0.35)]"
      >
        <defs>
          <linearGradient id="p-facet-primary" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00F2FE" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="p-facet-accent" x1="16" y1="4" x2="32" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#00F2FE" />
          </linearGradient>
          <linearGradient id="p-facet-secondary" x1="12" y1="18" x2="28" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0284C7" />
            <stop offset="1" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient id="p-facet-emerald" x1="4" y1="20" x2="16" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00F2FE" />
            <stop offset="1" stopColor="#4EDEA3" />
          </linearGradient>
        </defs>

        {/* Facet 1: Industrial Vertical Machine Column */}
        <polygon
          points="6,4 15,4 15,32 6,24"
          fill="url(#p-facet-primary)"
        />

        {/* Facet 2: Top Geometric Truss Bridge */}
        <polygon
          points="15,4 27,4 32,11 20,11"
          fill="url(#p-facet-accent)"
        />

        {/* Facet 3: Right Angle Cell Cantilever */}
        <polygon
          points="32,11 20,11 24,19 32,19"
          fill="url(#p-facet-primary)"
        />

        {/* Facet 4: Horizontal Connector / Mid Return */}
        <polygon
          points="15,14 24,19 15,22"
          fill="url(#p-facet-secondary)"
        />

        {/* Facet 5: Lower Precision Notch */}
        <polygon
          points="6,24 15,32 9,32"
          fill="url(#p-facet-emerald)"
        />
      </svg>
    </div>
  );

  if (variant === 'mark') {
    return <div className={`inline-flex items-center ${className}`}>{MarkSvg}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-1.5 ${className}`}>
        {MarkSvg}
        <div className="flex flex-col items-center">
          <span className={`text-white leading-none font-sans ${titleSizes}`}>
            PULSE
          </span>
          {showTagline && (
            <span className={`uppercase mt-1 text-slate-400 font-mono ${subSizes}`}>
              {taglineText}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {MarkSvg}
      <div className="flex flex-col justify-center leading-tight">
        <div className="flex items-center gap-2">
          <span className={`text-white leading-none font-sans ${titleSizes}`}>
            PULSE
          </span>
        </div>
        {showTagline && (
          <span className={`uppercase text-slate-400 font-sans tracking-wider mt-0.5 ${subSizes}`}>
            {taglineText}
          </span>
        )}
      </div>
    </div>
  );
};

