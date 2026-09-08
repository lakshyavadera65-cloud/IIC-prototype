# PULSE — Multi-Agent Factory Operations Cockpit

> **Autonomous Factory Disruption Recovery Cockpit**  
> Converts an incoming manufacturing disruption into an explainable, mathematically simulated recovery decision.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.13-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-61DAFB.svg)](https://react.dev)
[![ReactFlow](https://img.shields.io/badge/Graph-React%20Flow%20(%40xyflow%2Freact)-FF0072.svg)](https://reactflow.dev)
[![Architecture](https://img.shields.io/badge/Intelligence-Deterministic%20Math%20%2B%20AI%20Grounding-00F0FF.svg)]()

---

## 🏭 Product Overview

PULSE is not a generic AI chatbot wrapper. The core intelligence comes from **pure deterministic factory physics** (graph traversal, capacity math, schedule collision validation, and multi-criteria simulation).

The AI/LLM is strictly constrained to:
1. **Unstructured Alert Extraction** (Sentinel) with robust deterministic regex/keyword fallback.
2. **Contextual Recovery Phrasing** (Strategist) with grounded templating.
3. **Grounded Operational Q&A** (Factory Co-Pilot Chat) strictly backed by live telemetry and simulation scores.

```
                  [Factory Disruption Alert]
                              │
                              ▼
 ┌────────────────────────────────────────────────────────┐
 │ 1. SENTINEL (Event Intelligence Agent)                 │
 │    Extracts: {event_type, entity, duration, severity}  │
 └────────────────────────────┬───────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. IMPACT (Factory Ripple Intelligence Agent)          │
 │    Dynamic graph traversal:                            │
 │    Supplier → Material → Machine → Operation → Order   │
 │    Outputs: Affected assets, bottlenecks, violations   │
 └────────────────────────────┬───────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. STRATEGIST (Recovery Planning Agent)                │
 │    Rule-based plan synthesis:                          │
 │    Plan A (Reroute) | Plan B (Overtime) | Plan C (Swap)│
 └────────────────────────────┬───────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. ORACLE (Simulation & Decision Agent)                │
 │    Computes: Delay (h), Cost (₹), Orders Saved,        │
 │    Utilization %, RiskPenalty, BaseBoost, Score (pts)  │
 │    Ranks & tags "Recommended Strategy"                 │
 └────────────────────────────┬───────────────────────────┘
                              │
                              ▼
 ┌────────────────────────────────────────────────────────┐
 │ 5. LIVE STATE MUTATION & RE-SCHEDULING                 │
 │    Executes chosen plan, reroutes Gantt slots,         │
 │    and restores factory health score in real-time      │
 └────────────────────────────────────────────────────────┘
```

---

## 🧮 Concrete Mathematical Scoring Formula

Judges will ask: *"How is the recommendation chosen and how is RiskPenalty defined?"*

Every recovery strategy is evaluated using the following transparent formula:

$$\text{Score} = 20.0 + (\text{OrdersSaved} \times 30.0) - (\text{DelayHours} \times 2.5) - \left(\frac{\text{CostINR}}{2000.0}\right) - \text{RiskPenalty} + \text{BaseBoost}$$

Where:
- **`OrdersSaved`**: Number of at-risk workorders protected from deadline breach.
- **`DelayHours`**: Projected schedule delay in hours.
- **`CostINR`**: Total incremental operational expenditure (tooling calibration, overtime premiums, or expedited freight) in ₹.
- **`RiskPenalty`**: Quantifies SLA breach severity and machine overload stress:
  $$\text{RiskPenalty} = \sum_{o \in \text{ViolatedOrders}} \text{SeverityWeight}(o.\text{priority}) + \max(0, \text{PeakUtil} - 100) \times 1.5$$
  - $\text{SeverityWeight}(\text{"critical"}) = 15$
  - $\text{SeverityWeight}(\text{"high"}) = 8$
  - $\text{SeverityWeight}(\text{"medium"}) = 3$
  - $\text{SeverityWeight}(\text{"low"}) = 1$
- **`BaseBoost`**: Rewards operational simplicity and zero external dependencies:
  $$\text{BaseBoost} = \begin{cases} +10 & \text{if } \text{overtime\_hours} = 0 \text{ and } \text{subcontract\_cost} = 0 \\ 0 & \text{otherwise} \end{cases}$$

---

## 🚀 Quickstart & Local Execution

### Prerequisites
- Node.js v18+ & npm

### Running the Cockpit (Standalone React Application)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

All deterministic factory graph traversal, Sentinel extraction, Strategist recovery planning, Oracle simulation math, and Grounded Operations Chat run natively in the client application with zero external dependencies!

---

## 🎬 2-Minute Winning Demo Flow for Judges

1. **Baseline Health**:
   - Open `http://localhost:5173`.
   - Observe baseline factory state: **94.0% Factory Health**, all 6 machines operational, clean production Gantt chart, 0 at-risk orders.
2. **Inject Scenario A (Primary Disruption)**:
   - Click **`Scenario A: CNC-02 Failure`** in the top injection bar.
   - Watch the **Pipeline Tracker** progressively execute:
     - `1. Sentinel`: Extracts `CNC-02`, 6h downtime, Critical severity.
     - `2. Impact`: Traces ripple path to Machining operations and at-risk orders (`ORD-104`, `ORD-108`).
     - `3. Strategist`: Generates 3 candidate recovery plans.
     - `4. Oracle`: Deterministically simulates outcomes, scores them, and recommends **Plan A**.
   - Factory health drops to **58.0%**. Red clash slots appear on the Gantt chart for `CNC-02`.
3. **Interactive Dependency Graph**:
   - Click **"Inspect Dependency Graph (React Flow)"**.
   - View the visual node cascade: `Supplier → Material AL-001 → Failed CNC-02 → Operations → ORD-104 & ORD-108 → Customer Deliveries`.
4. **Compare Plans & Transparent Formula**:
   - Review side-by-side cards for **Plan A (Reroute)**, **Plan B (Overtime)**, and **Plan C (Buffer Swap)**.
   - Note Plan A's **83.0 pts** score vs Plan B's **60.2 pts** (penalized for ₹26,100 overtime cost and 0 BaseBoost).
5. **One-Click Execution**:
   - Click **"Execute PLAN-A Live"**.
   - Watch the digital twin mutate in real time:
     - Gantt slots reroute to `CNC-01` in vibrant emerald green.
     - `CNC-01` utilization increases to absorb the load.
     - `ORD-104` and `ORD-108` status changes to `Recovered`.
     - Factory health recovers to **92.5%**.
6. **Grounded Operations Co-Pilot Chat**:
   - Click **"Factory Co-Pilot"** in the top right.
   - Click the prompt chip: *"Why was Plan A recommended over Plan B?"*
   - Assistant provides a factual, grounded explanation citing exact numbers and sources.
7. **Deep Reset**:
   - Click **"Reset Factory"** to restore 100% pristine baseline state.
8. **Test Unscripted Disruption (Zero Hardcoding Proof)**:
   - Click **`Unscripted: Line-B Jam`**.
   - Demonstrates that Impact and Oracle dynamically calculate impacts on `LINE-B` orders (`ORD-106`, `ORD-109`) with zero hardcoding.

---

## 🧪 Automated Test Verification

Run the full backend test suite:
```bash
python3 backend/test_pipeline.py
```
**Test Results:**
- `TEST 1`: Baseline Factory State (Health: 94%, 6 machines, 10 orders) ✅
- `TEST 2`: Scenario A Pipeline (Sentinel → Impact → Strategist → Oracle) ✅
- `TEST 3`: Plan Execution & Schedule Re-routing ✅
- `TEST 4`: Comprehensive Deep Reset ✅
- `TEST 5`: Scenario B (Aluminum Alloy Shipment Delay) ✅
- `TEST 6`: Scenario C (Fastener Inventory Shortage) ✅
- `TEST 7`: 4th Unscripted Disruption (Assembly Line B Jam - Zero hardcoding) ✅
- `TEST 8`: Grounded Factory Chat with Citations ✅