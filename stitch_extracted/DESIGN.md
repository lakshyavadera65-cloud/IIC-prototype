---
name: Autonomous Operations Cockpit
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#e79400'
  on-tertiary-container: '#563400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  mono-metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.03em
  mono-metric-md:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 22px
    letterSpacing: -0.02em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  mono-code:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 15px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.08em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.25rem
  space-2xl: 1.5rem
  gutter-dense: 0.5rem
  gutter-panel: 0.75rem
  margin-screen: 1rem
---

## Brand & Style

This design system embodies the high-stakes precision of industrial autonomy, mission control centers, and defense telemetry interfaces. Built specifically for high-velocity decision loops and automated orchestration, it projects absolute control, surgical precision, and computational vigilance.

The aesthetic fuses **Tactical Minimalism** with **Technical Brutalism**:
- Deep obsidian and charcoal backdrops mitigate ocular fatigue over sustained multi-hour shifts.
- Piercing status emissions communicate system vitality instantly across complex telemetry walls.
- Dense information layouts eliminate frivolous ornamentation; every pixel, border, and glow conveys operational status, hardware health, or agent compute traces.
- Data structures are presented with tabular discipline, monospaced telemetry streams, and hardware-inspired control indicators.

## Colors

The palette simulates precision tactical hardware and heads-up displays, relying on a deeply calibrated dark spectrum accented by photon-like telemetry glows.

### Core Canvas & Surfaces
- **Canvas Base (`#0B0E11`):** Absolute workspace baseline; deep near-black minimizing monitor backlight bleed.
- **Surface Level 1 (`#13171D`):** Primary panel containment, structural pods, and module backgrounds.
- **Surface Level 2 (`#1A1F26`):** Secondary nested wells, table headers, data cards, and active sub-windows.
- **Surface Level 3 (`#222933`):** Hover-state fills, active tab headers, and depressed button states.
- **Structural Border (`#252D38`):** Strict division borders defining module edges and grid cells.
- **Subtle Hairline (`#1E242C`):** Internal cell divisions and quiet layout dividers.

### Operational Accents & Telemetry
- **Compute Cyan (`#06B6D4` / `#22D3EE`):** Primary token. Signifies active autonomous agent processing, live compute jobs, telemetry streaming, and focused interactive inputs.
- **Recovery Emerald (`#10B981` / `#059669`):** Secondary token. Signifies healthy operational states, self-healing completions, and nominal yields.
- **Telemetry Amber (`#F59E0B` / `#D97706`):** Warning states, predictive disruption thresholds, recalculating routes, and degradation warnings.
- **Critical Crimson (`#EF4444` / `#DC2626`):** System clashes, structural blockages, autonomous recovery overrides, and urgent human interventions.

### Radiance & Glows
Use localized 1px–2px inner halos and 8px outer glows matching the token's alpha variant (e.g., `rgba(6, 182, 212, 0.25)`) exclusively for real-time states and pulse alerts. Glows must never be static decorative artifacts; they represent active electrical or compute states.

## Typography

The type system creates a rigorous division of labor: **Inter** structures operational context, human-readable labels, and operational summaries, while **JetBrains Mono** surfaces dynamic telemetry, agent reasoning logs, hardware addresses, and precision metrics.

- All numerical values, coordinate axes, status codes, timestamps, and compute loads must render in `JetBrains Mono` with tabular lining figures enabled (`tnum`).
- Category overlines, column headers, and state identifiers use `label-caps` in uppercase with generous letter spacing (`0.08em`) to guarantee immediate scanability across high-density layouts.
- Text contrast must maintain AAA rating on dark surfaces: default primary body text is `#E2E8F0`, secondary metadata is `#94A3B8`, and disabled/de-emphasized text is `#64748B`.

## Layout & Spacing

This layout system is structured around an ultra-dense, non-scrolling "single-cockpit" paradigm for wide-format operational consoles, scaling to modular stacked panes on smaller viewports.

### Grid & Composition
- **Grid Architecture:** 16-column technical fluid grid for desktop displays (`min-width: 1440px`), collapsing into 8-column arrangements on tablet-class screens and 4-column single-stream inspection viewports on diagnostic terminals.
- **Density Profile:** Compact and high-density. Standard gutter rhythm sits at `0.5rem` to `0.75rem` to maximize spatial efficiency. Every quadrant serves real-time tactical awareness.
- **Docking Windows & Panes:** Viewports use CSS subgrid or flexible box tiling with zero overlap. Modules butt against each other separated by 1px structural borders rather than floating card drops.

### Breakpoints & Adaptations
- **Console Wall / Multi-Screen (≥ 1920px):** 16-column view with fixed 320px telemetry rail left, flexible canvas center (spatial topology / dynamic graph), and 380px agent mitigation stream right.
- **Workstation (1280px - 1919px):** 12-column layout; secondary metric panels toggle into collapsible tabs.
- **Field Terminal (< 1279px):** Reflows to single-column tabbed interface with high-priority disruption banner pinned to the screen ceiling.

## Elevation & Depth

In a mission-control environment, traditional drop shadows distort boundaries and compromise data clarity. Depth is established through **tonal stratification, border luminance, and luminescent back-glows**.

### Surface Hierarchy
- **Base 0 (Floor):** `#0B0E11` — The background framework and negative space.
- **Tier 1 (Panels & Cockpit Tiles):** `#13171D` with a crisp 1px border of `#252D38`.
- **Tier 2 (Internal Modules & Table Containers):** `#1A1F26` with a hairline border of `#2E3744`.
- **Tier 3 (Floating Overlays & Popovers):** `#222933` with an active highlight border (`#3B4758`) and a 16px ambient blur shadow (`rgba(0, 0, 0, 0.6)`).

### Luminescence Rules
- Critical elements emit faint, direct radial field cues rather than ambient blur drops.
- A critical alert module utilizes an inner rim highlight: `inset 0 0 0 1px #EF4444` paired with an outer beacon `0 0 12px rgba(239, 68, 68, 0.25)`.
- Active agent processing panels project a faint cyan wash on the top edge: `border-top: 2px solid #06B6D4`.

## Shapes

The interface embraces a machined, instrumentation-grade shape language. Curves are minimal and purposeful:
- Standard UI containers, cards, and data pods utilize strict `0.25rem` (4px) corner radii, preserving a tight structural grid.
- Interactive controls (buttons, inputs, dropdown triggers) sit at `0.25rem` (4px) to retain an industrial aesthetic.
- Status badges and pills employ slight corner clipping (chamfered appearance via `0.125rem` radius or strict 2px soft corners) to denote machine telemetry rather than consumer chips.
- Circular geometries are reserved strictly for radial progress rings, sensor nodes, and camera/node feeds.

## Components

### Buttons & Trigger Hardware
- **Compute Action (Primary):** Solid cyan background `#06B6D4` with bold black text `#080B0E`. Hover switches to bright cyan `#22D3EE` with a subtle `0 0 8px rgba(6, 182, 212, 0.4)` glow. Active state: `#0891B2`.
- **Ghost/Tactical Secondary:** `#1A1F26` background, 1px border `#252D38`, monospace typography in `#E2E8F0`. Hover triggers border transition to `#06B6D4` with text illumination.
- **Emergency Override:** `#EF4444` surface with high-contrast `#FFFFFF` text, flashing keyline border when human confirmation is demanded.

### Telemetry Data Pills & Indicators
- Compact height (20px), monospaced type (`10px`), uppercase tracking.
- Composed of a dark tinted core (15% opacity of token color) with a matching 1px border and a leading 6px glowing status dot.
  - *Nominal:* Dot `#10B981`, surface `rgba(16, 185, 129, 0.1)`, border `rgba(16, 185, 129, 0.3)`.
  - *Warning:* Dot `#F59E0B`, surface `rgba(245, 158, 11, 0.1)`, border `rgba(245, 158, 11, 0.3)`.
  - *Clash:* Dot `#EF4444`, surface `rgba(239, 68, 68, 0.15)`, border `rgba(239, 68, 68, 0.4)`.
  - *Agent Processing:* Dot `#06B6D4` with continuous 1.5s pulse animation.

### Status Rings & Gauge Components
- Concentric, SVG-based radial gauges showing line load, autonomous buffer capacity, and MTTR counters.
- Track backdrop: `#1A1F26` at 2px stroke.
- Active path: Colored accent at 2.5px stroke with `stroke-linecap: square`. Center text renders in `mono-metric-md`.

### Tabular Telemetry & Clash Matrices
- Zero horizontal padding on outer column boundaries; internal cell padding fixed at `8px 12px`.
- Alternating subtle row zebra fills using `#13171D` and `#161B22`.
- Headers locked with sticky positioning, styled in `label-caps` with `#64748B` foreground and solid `#252D38` bottom divider.
- Numerical cells right-aligned, monospaced, with color-coded diff deltas (`+0.04s`, `-12%`).

### Inputs & Parameter Sliders
- Background `#0E1217` inset with 1px border `#252D38`.
- Focus state switches border directly to `#06B6D4` with an inner shadow `inset 0 0 4px rgba(6, 182, 212, 0.2)`.
- Technical step sliders display discrete tick marks with active range filled in solid cyan or emerald.

### Autonomous Action Cards (Mitigation Feed)
- Panel cards with high-contrast left border accents (3px wide) indicating state: Green (Resolved), Amber (Simulating Plan), Cyan (Executing Step), Red (Blocked).
- Header bar features agent hash ID, time delta in milliseconds, and algorithmic confidence percentage score (`CONF: 98.4%`).