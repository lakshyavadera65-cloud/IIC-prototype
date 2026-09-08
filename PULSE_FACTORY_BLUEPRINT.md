# PULSE — COMPLETE FACTORY BLUEPRINT

## Factory Operations Intelligence & Simulation Environment

**Factory:** Apex Precision Manufacturing (APM)  
**Purpose:** Define the complete factory world that powers PULSE: data, dependencies, constraints, disruptions, recovery actions, simulation metrics, and demo scenarios.

---

# 1. Factory Identity

## Factory Type
A discrete manufacturing facility producing **precision aluminum actuator housings** used in industrial automation.

## Products

### AX-100 — Standard Actuator Housing
```text
Aluminum → CNC Machining → Surface Finishing → Assembly → Quality → Packaging
```

- High-volume
- Flexible scheduling
- Moderate deadline sensitivity

### AX-200 — Precision Actuator Housing
```text
Aluminum + Precision Components → Precision CNC → Finishing → Precision Assembly → Quality → Packaging
```

- High-value
- Tight deadlines
- Greater operational risk

## Why this factory model works
It has shared resources, material dependencies, bottlenecks, competing orders, and realistic recovery options—complex enough for meaningful intelligence while remaining manageable for a hackathon.

---

# 2. Production Flow

```text
RAW MATERIAL INVENTORY
          ↓
   CNC MACHINING
   CNC-01 | CNC-02
          ↓
 SURFACE FINISHING
       FIN-01
          ↓
 ASSEMBLY A / B
          ↓
 QUALITY CONTROL
       QC-01
          ↓
 PACKAGING
       PK-01
          ↓
 DELIVERY
```

---

# 3. Operating Model

- Two shifts daily
- 8 hours per shift
- 16 productive hours/day
- Simulation uses hourly time slots
- Rolling scheduling horizon: **48 hours**

This gives the dashboard enough visible scheduling complexity without requiring a full ERP.

---

# 4. Machines & Resources

## CNC-01
| Property | Value |
|---|---|
| Type | Standard CNC |
| Capacity | 25 units/hour |
| Products | AX-100, AX-200 |
| Overtime | Available |
| Overtime Cost | ₹2,000/hour |

CNC-01 is flexible but normally near capacity.

## CNC-02
| Property | Value |
|---|---|
| Type | Precision CNC |
| Capacity | 30 units/hour |
| Products | AX-100, AX-200 |
| Strategic Importance | Critical |
| Main Demo Risk | High |

CNC-02 is the primary bottleneck for high-priority AX-200 work.

## FIN-01
- Surface finishing
- Capacity: 45 units/hour
- Normally has spare capacity

## ASM-A
- Assembly Line A
- Capacity: 22 units/hour
- Primarily AX-100

## ASM-B
- Assembly Line B
- Capacity: 18 units/hour
- AX-100 and AX-200
- Flexible recovery resource

## QC-01
- Quality inspection
- Capacity: 40 units/hour

## PK-01
- Packaging
- Capacity: 50 units/hour

---

# 5. Materials

## M-AL — Aluminum Billets
- Current stock: 2,200
- Safety stock: 700
- Supplier: MetalCore Supplies
- Lead time: 48 hours
- Consumption: 1/unit for both products

## M-FAST — Fastener Kits
- Current stock: 1,300
- Safety stock: 400
- Supplier: FastFix Components
- Lead time: 24 hours
- AX-100: 1 kit/unit
- AX-200: 2 kits/unit

## M-SEAL — Precision Seals
- Current stock: 700
- Safety stock: 250
- Supplier: SealTech
- Lead time: 72 hours
- Required only for AX-200

This selective dependency is important for impact analysis.

---

# 6. Active Orders

| Order | Product | Qty | Priority | Deadline | Value |
|---|---|---:|---|---|---:|
| ORD-101 | AX-100 | 250 | Normal | +18h | ₹150,000 |
| ORD-102 | AX-100 | 180 | High | +12h | ₹135,000 |
| ORD-103 | AX-200 | 120 | Critical | +10h | ₹240,000 |
| ORD-104 | AX-200 | 150 | High | +20h | ₹285,000 |
| ORD-105 | AX-100 | 300 | Normal | +30h | ₹180,000 |
| ORD-106 | AX-200 | 80 | Critical | +28h | ₹160,000 |
| ORD-107 | AX-100 | 220 | High | +24h | ₹165,000 |

## Priority Weights

| Priority | Weight |
|---|---:|
| Critical | 4 |
| High | 3 |
| Normal | 2 |
| Low | 1 |

Recovery logic uses these weights when resources conflict.

---

# 7. Production Routes

## AX-100
```text
M-AL
 ↓
CNC-01 or CNC-02
 ↓
FIN-01
 ↓
ASM-A or ASM-B
 ↓
QC-01
 ↓
PK-01
```

## AX-200
```text
M-AL + M-SEAL + M-FAST
 ↓
CNC-01 or CNC-02
 ↓
FIN-01
 ↓
ASM-B
 ↓
QC-01
 ↓
PK-01
```

---

# 8. Factory Dependency Graph

The Impact Engine uses this graph.

## Node Types
- Supplier
- Material
- Machine
- Operation
- Order

```text
MetalCore
   ↓
M-AL
   ↓
CNC-01 ─────┐
            ├── CNC Operation ──→ Orders
CNC-02 ─────┘
       ↓
FIN-01
       ↓
ASM-A / ASM-B
       ↓
QC-01
       ↓
PK-01
       ↓
Delivery
```

---

# 9. Dependency Rules

## Machine Failure
1. Find scheduled operations using the failed machine.
2. Check compatible alternatives.
3. Calculate remaining capacity.
4. Reschedule affected operations.
5. Propagate delays downstream.
6. Identify affected orders.
7. Compare projected completion with deadlines.

## Material Shortage
1. Identify products requiring the material.
2. Calculate producible quantity.
3. Identify affected orders.
4. Allocate resources by priority and deadline.

## Supplier Delay
1. Update expected arrival time.
2. Forecast inventory depletion.
3. Identify when production becomes impossible.
4. Propagate the resulting impact.

---

# 10. Baseline Schedule

The factory starts in a healthy state.

## Hour 0–4
- CNC-01 → ORD-101
- CNC-02 → ORD-103
- FIN-01 → ORD-102 backlog
- ASM-A → ORD-102
- ASM-B → ORD-104
- QC-01 → ORD-101 completed batch
- PK-01 → ORD-101 completed batch

## Hour 4–8
- CNC-01 → ORD-102
- CNC-02 → ORD-103
- FIN-01 → ORD-103
- ASM-A → ORD-101
- ASM-B → ORD-104

## Hour 8–12
- CNC-01 → ORD-105
- CNC-02 → ORD-104
- FIN-01 → ORD-104
- ASM-A → ORD-105
- ASM-B → ORD-103

Schedule tasks can be represented as:

```json
{
  "resource_id": "CNC-02",
  "order_id": "ORD-103",
  "start_hour": 0,
  "end_hour": 4
}
```

---

# 11. MAIN DEMO SCENARIO

# Scenario A — CNC-02 Gearbox Failure

## Incoming Event
> URGENT MACHINE ALERT: CNC-02 gearbox vibration exceeded safe operating limits. Machine shut down automatically. Estimated repair time: 6 hours.

## Sentinel Output
```json
{
  "event_id": "EVT-001",
  "event_type": "machine_failure",
  "entity_id": "CNC-02",
  "duration_hours": 6,
  "severity": "critical"
}
```

## Expected Ripple Effect
```text
CNC-02 FAILURE
       ↓
AX-200 machining interrupted
       ↓
ORD-103 capacity reduced
       ↓
ORD-104 delayed
       ↓
ASM-B underutilized
       ↓
Critical deadline threatened
```

---

# 12. Recovery Plans for Scenario A

## PLAN A — Full Reroute
Move all possible CNC-02 work to CNC-01.

**Benefit:** Production continues.  
**Risk:** Existing CNC-01 orders are delayed.

## PLAN B — Priority-Based Reroute
Move only critical ORD-103 work to CNC-01 and postpone lower-priority work.

**Benefit:** Protects the most important deadline with limited disruption.

## PLAN C — Reroute + Overtime
Move critical work to CNC-01 and extend eligible operations with overtime.

**Benefit:** Maximum deadline protection.  
**Cost:** Higher labor and operating expense.

---

# 13. Scenario B — Supplier Delay

## Incoming Email
> Due to transportation disruption, the scheduled aluminum billet shipment will arrive approximately 36 hours later than planned.

## Expected Impact
```text
Supplier Delay
      ↓
Future Aluminum Shortage
      ↓
CNC Production Restricted
      ↓
Orders Compete for Remaining Inventory
      ↓
Priority Decision Required
```

## Recovery Options
- Continue until stock depletes
- Reserve inventory for critical/high-priority orders
- Activate an alternate supplier at additional cost

---

# 14. Scenario C — Precision Seal Shortage

Current precision seal inventory suddenly drops to **180 units**.

```text
M-SEAL Shortage
      ↓
AX-200 Production Restricted
      ↓
ORD-103 / ORD-104 / ORD-106
      ↓
Priority Allocation Required
```

This scenario proves PULSE can identify selective dependencies rather than assuming every factory operation is affected.

---

# 15. Optional Scenario D — Emergency Order

A new order arrives:

- ORD-108
- Product: AX-200
- Quantity: 100
- Priority: Critical
- Deadline: +8 hours

This tests scheduling intelligence even when no machine has failed.

---

# 16. Recovery Action Catalog

The Strategist can only choose realistic actions.

## Machine Actions
- Reroute work to compatible machines
- Enable overtime where allowed
- Reprioritize the production schedule

## Material Actions
- Allocate safety stock
- Reserve material for high-priority orders
- Activate alternate supplier

## Schedule Actions
- Delay low-priority work
- Parallelize compatible operations

---

# 17. Hard Constraints

1. Machines cannot exceed capacity.
2. Operations cannot start before prerequisite operations finish.
3. Materials cannot be consumed if unavailable.
4. Failed machines cannot be scheduled during downtime.
5. AX-200 must use compatible resources.
6. Overtime is allowed only for configured resources.
7. Higher-priority orders should receive stronger protection during conflicts.

---

# 18. Oracle Simulation Metrics

Every recovery plan is evaluated using:

- Delay hours
- Estimated recovery cost
- Orders saved
- Deadline violations
- Machine utilization
- Idle time

## Core Calculations

### Delay
```text
Projected Completion - Original Completion
```

### Utilization
```text
Used Capacity / Total Capacity × 100
```

### Cost
```text
Overtime Cost + Rerouting Cost + Delay Penalties
```

---

# 19. Transparent Decision Model

Suggested weighting:

```text
Deadline Protection   40%
Orders Saved          25%
Cost Efficiency       20%
Utilization           15%
```

All metrics are normalized before ranking.

**Important:** This is an explainable operational decision model, not a random AI-generated score.

---

# 20. Factory Pulse Health

The dashboard displays a **Factory Pulse** from 0–100.

Inputs:

- Machine health: 30%
- Schedule stability: 30%
- Order risk: 25%
- Inventory health: 15%

Example:

```text
PULSE: 94/100
STATUS: STABLE
```

After disruption:

```text
PULSE: 67/100
STATUS: CRITICAL ATTENTION
```

After recovery:

```text
PULSE: 89/100
STATUS: RECOVERING
```

The UI must explain this value; it should not be decorative.

---

# 21. Alert Severity

## 🔴 Critical
Immediate action required.

## 🟠 High
Significant operational risk.

## 🟡 Medium
Requires monitoring.

## 🟢 Resolved
Recovery completed successfully.

---

# 22. Central Backend State

```json
{
  "factory": {},
  "machines": [],
  "materials": [],
  "orders": [],
  "schedule": [],
  "active_events": [],
  "alerts": [],
  "agent_results": [],
  "recovery_plans": []
}
```

This is the single source of truth for the backend.

---

# 23. Agent Contracts

## Sentinel
**Input:** Raw email/message/alert  
**Output:** Structured event JSON

## Impact
**Input:** Event + factory state  
**Output:**
```json
{
  "affected_resources": [],
  "affected_orders": [],
  "impact_chain": [],
  "risks": []
}
```

## Strategist
**Input:** Impact result + constraints  
**Output:** Feasible recovery plans

## Oracle
**Input:** Factory state + recovery plan  
**Output:**
```json
{
  "delay_hours": 0,
  "estimated_cost": 0,
  "orders_saved": 0,
  "deadline_violations": 0,
  "utilization": 0,
  "plan_score": 0
}
```

---

# 24. Planned API Surface

## Factory
```text
GET /api/factory/state
GET /api/factory/machines
GET /api/factory/orders
GET /api/factory/schedule
```

## Events
```text
POST /api/events
POST /api/demo/trigger/{scenario_id}
```

## Intelligence
```text
GET /api/alerts
GET /api/impact/{event_id}
GET /api/agents/{event_id}
```

## Recovery
```text
GET /api/recovery/{event_id}
POST /api/recovery/{plan_id}/execute
```

## Chat
```text
POST /api/chat
```

---

# 25. Backend Build Order

## Phase 1 — Static Factory Data
Create:
```text
machines.json
materials.json
orders.json
schedule.json
```

## Phase 2 — Factory State Engine
Create the central state manager.

## Phase 3 — Dependency Graph
Build the factory graph using NetworkX.

## Phase 4 — Impact Engine
Test disruption propagation without AI.

## Phase 5 — Simulation Engine
Calculate delays, capacity, costs, and deadline impact.

## Phase 6 — Recovery Engine
Generate feasible plans from the recovery catalog.

## Phase 7 — Sentinel
Add LLM-powered extraction of unstructured events.

## Phase 8 — Agent Pipeline
Connect Sentinel → Impact → Strategist → Oracle.

## Phase 9 — FastAPI
Expose the intelligence to the React frontend.

---

# 26. Final Demo Story

## Initial State
```text
PULSE: 94 — STABLE
Orders at Risk: 0
Machines Online: 6/6
```

## Disruption
CNC-02 shuts down for 6 hours.

## Sentinel
Extracts and structures the event.

## Impact
Shows:
```text
CNC-02
  ↓
AX-200 Production
  ↓
ORD-103 🔴
ORD-104 🟠
```

## Strategist
Generates multiple feasible responses.

## Oracle
Simulates each possible response.

## Recommendation
```text
PRIORITY REROUTE
+
SELECTIVE OVERTIME
```

## Execution
The manager approves the plan and the production schedule updates.

```text
PULSE: 67 → 89
```

---

# 27. Final Principle

> **Build the factory world first. Then build the intelligence that understands it.**

The factory data, schedules, constraints, dependencies, and recovery actions are the real foundation of PULSE.

Without them, the agents are just prompts.

With them, PULSE becomes a genuine Factory Operations Intelligence system.
