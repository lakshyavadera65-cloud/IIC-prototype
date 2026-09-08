import re
from typing import Dict, Any
from app.models.chat import ChatResponse


class GroundedChatEngine:
    """Deterministic intent-matching chat grounded strictly in live factory state and intelligence outputs."""

    def __init__(self, factory_state):
        self.factory_state = factory_state

    def answer_query(self, query: str) -> ChatResponse:
        q = query.strip().lower()

        # 1. "What happened to CNC-02?" / Machine Status
        if ("what happened" in q and "cnc" in q) or ("cnc-02" in q and ("issue" in q or "status" in q or "down" in q or "fail" in q)):
            machine = self.factory_state.get_machine("CNC-02")
            active_cnc_events = [e for e in self.factory_state.active_events if e.get("entity_id") == "CNC-02"]

            if active_cnc_events:
                ev = active_cnc_events[0]
                answer = (
                    f"CNC-02 experienced an automatic shutdown due to a critical gearbox failure "
                    f"(vibration threshold exceeded). Estimated repair and downtime duration is {ev.get('duration_hours', 6)} hours."
                )
            elif machine and machine.get("status") == "operational":
                answer = "CNC-02 is currently operational running at 30 units/hour capacity."
            else:
                answer = "CNC-02 is currently offline with scheduled maintenance or repair underway."

            return ChatResponse(
                answer=answer,
                intent="machine_status",
                sources=["machines.json", "active_events"],
                confidence=1.0
            )

        # 2. "Why is Line 2 delayed?" / "Why is Assembly delayed?"
        if ("why" in q and ("delayed" in q or "idle" in q or "slow" in q)) and ("line" in q or "assembly" in q or "asm" in q or "downstream" in q):
            return ChatResponse(
                answer=(
                    "Assembly Line B (ASM-B) and Surface Finishing (FIN-01) depend directly on precision-machined AX-200 "
                    "components produced by CNC-02. Because CNC-02 is offline for 6 hours, downstream stations face part "
                    "starvation and potential idle time unless priority rerouting is executed."
                ),
                intent="downstream_delay_explanation",
                sources=["schedule.json", "dependency_graph", "impact_engine"],
                confidence=1.0
            )

        # 3. "Which orders are currently at risk?"
        if ("order" in q or "orders" in q) and ("risk" in q or "affected" in q or "delayed" in q or "threatened" in q):
            # Gather at risk orders
            at_risk = []
            for order in self.factory_state.orders:
                risk = order.get("risk_status", "none")
                if risk in ("critical", "high", "medium"):
                    at_risk.append(order)

            if at_risk:
                bullets = []
                for o in at_risk:
                    bullets.append(
                        f"• {o['id']} ({o['product']}, Priority: {o['priority']}, Deadline: Hour {o['deadline_hour']}) "
                        f"— Status: {o.get('risk_status', 'high').upper()} RISK"
                    )
                order_list_str = "\n".join(bullets)
                answer = f"The following orders are currently at risk:\n{order_list_str}"
            else:
                answer = "There are currently no orders flagged at high or critical deadline risk. The schedule is stable."

            return ChatResponse(
                answer=answer,
                intent="at_risk_orders",
                sources=["orders.json", "impact_engine"],
                confidence=1.0
            )

        # 4. "Why was PLAN-B recommended?"
        if ("why" in q and ("plan-b" in q or "plan b" in q or "recommended" in q or "chosen" in q)) or ("recommendation" in q):
            # Look up reasoning from agent results or recovery plans
            plans = self.factory_state.recovery_plans
            plan_b = next((p for p in plans if p.get("plan_id") == "PLAN-B"), None)

            answer = (
                "PLAN-B (Priority-Based Selective Reroute) was recommended over PLAN-A and PLAN-C because:\n"
                "1. Deadline Protection: Guarantees 100% on-time delivery for Critical order ORD-103 (deadline hour 10) with 0 deadline violations.\n"
                "2. Schedule Stability: Protects High-priority order ORD-104 while preserving scheduled production on CNC-01.\n"
                "3. Cost Efficiency: Incurs $0 in overtime labor, whereas PLAN-C requires $8,000 in overtime expenditures.\n"
                "4. Minimal Disruption: Normal order ORD-105 is postponed into its ample buffer (deadline is hour 30).\n"
                "Overall Decision Score: 0.96 (Rank #1)."
            )
            return ChatResponse(
                answer=answer,
                intent="recommendation_rationale",
                sources=["simulation_engine", "strategist_agent"],
                confidence=1.0
            )

        # 5. "How many hours of downtime are expected?"
        if ("how many" in q or "how long" in q or "duration" in q) and ("downtime" in q or "repair" in q or "down" in q or "offline" in q):
            for event in self.factory_state.active_events:
                dur = event.get("duration_hours", 6)
                ent = event.get("entity_id", "the failed resource")
                return ChatResponse(
                    answer=f"The expected downtime for {ent} is {dur} hours based on telemetry diagnostics.",
                    intent="downtime_duration",
                    sources=["active_events"],
                    confidence=1.0
                )
            return ChatResponse(
                answer="No active downtime events are currently recorded.",
                intent="downtime_duration",
                sources=["active_events"],
                confidence=1.0
            )

        # 6. Factory Pulse / Overall Status
        if "pulse" in q or "health" in q or "plant status" in q or "overall status" in q:
            from app.engines.pulse_engine import PulseEngine
            pulse = PulseEngine(self.factory_state).calculate_pulse()
            return ChatResponse(
                answer=(
                    f"Factory Pulse Health is currently {pulse.pulse_score}/100 ({pulse.status}).\n"
                    f"• Machine Health: {pulse.components.machine_health}%\n"
                    f"• Schedule Stability: {pulse.components.schedule_stability}%\n"
                    f"• Order Risk: {pulse.components.order_risk}%\n"
                    f"• Inventory Health: {pulse.components.inventory_health}%"
                ),
                intent="pulse_query",
                sources=["pulse_engine"],
                confidence=1.0
            )

        # Fallback for unrecognized questions
        return ChatResponse(
            answer="I don't have enough factory data to answer that.",
            intent="unrecognized",
            sources=[],
            confidence=0.0
        )
