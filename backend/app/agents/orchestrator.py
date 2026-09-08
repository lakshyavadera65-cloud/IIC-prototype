from typing import Dict, Any, List, Union
from datetime import datetime
from app.models.agents import AgentLogEntry, OrchestratorResult
from app.agents.sentinel import SentinelAgent
from app.engines.impact_engine import ImpactEngine
from app.agents.strategist import StrategistAgent
from app.engines.pulse_engine import PulseEngine


class AgentOrchestrator:
    """End-to-end Multi-Agent Orchestrator executing Sentinel -> Impact -> Strategist -> Oracle."""

    def __init__(self, factory_state):
        self.factory_state = factory_state
        self.sentinel = SentinelAgent(factory_state)
        self.impact_engine = ImpactEngine(factory_state)
        self.strategist = StrategistAgent(factory_state)
        self.pulse_engine = PulseEngine(factory_state)

    def process_event(self, raw_or_structured_input: Union[str, Dict[str, Any]]) -> Dict[str, Any]:
        """Execute the complete multi-agent pipeline and generate execution logs."""
        agent_logs: List[AgentLogEntry] = []

        pulse_before = self.pulse_engine.calculate_pulse().model_dump()

        # ----------------------------------------------------
        # 1. SENTINEL AGENT
        # ----------------------------------------------------
        event = self.sentinel.parse_event(raw_or_structured_input)
        event_id = event["event_id"]
        entity_id = event["entity_id"]
        event_type = event["event_type"]
        duration = event.get("duration_hours", 0)

        # Register event in central state
        self.factory_state.add_event(event)

        sentinel_msg = f"Detected {event_type.replace('_', ' ')} on {entity_id} (estimated downtime: {duration}h, severity: {event.get('severity')})"
        agent_logs.append(AgentLogEntry(
            agent="Sentinel",
            status="completed",
            message=sentinel_msg,
            details={"event": event}
        ))

        # ----------------------------------------------------
        # 2. IMPACT ENGINE
        # ----------------------------------------------------
        impact_result = self.impact_engine.analyze_event(event)

        # Update order risk status in factory state based on analyzed risks
        for risk in impact_result.get("risks", []):
            ord_id = risk.get("order_id")
            order = self.factory_state.get_order(ord_id)
            if order:
                order["risk_status"] = risk.get("risk_level", "high")

        lost_units = impact_result.get("capacity_impact", {}).get("lost_capacity_units", 0)
        affected_count = len(impact_result.get("affected_orders", []))
        affected_names = ", ".join(impact_result.get("affected_order_ids", []))

        impact_msg = f"Identified {affected_count} affected orders ({affected_names}). Lost production capacity: {lost_units} units."
        agent_logs.append(AgentLogEntry(
            agent="Impact",
            status="completed",
            message=impact_msg,
            details={
                "affected_resources": impact_result.get("affected_resources", []),
                "affected_order_ids": impact_result.get("affected_order_ids", []),
                "capacity_impact": impact_result.get("capacity_impact", {}),
                "risks": impact_result.get("risks", [])
            }
        ))

        # ----------------------------------------------------
        # 3. STRATEGIST AGENT
        # ----------------------------------------------------
        strategy_result = self.strategist.formulate_strategy(event, impact_result)
        plans = strategy_result.get("candidate_plans", [])

        strategist_msg = f"Formulated {len(plans)} recovery plans (PLAN-A Full Reroute, PLAN-B Priority Reroute, PLAN-C Overtime) evaluated against factory constraints."
        agent_logs.append(AgentLogEntry(
            agent="Strategist",
            status="completed",
            message=strategist_msg,
            details={"candidate_plan_ids": [p["plan_id"] for p in plans]}
        ))

        # ----------------------------------------------------
        # 4. ORACLE AGENT (Simulation & Ranking)
        # ----------------------------------------------------
        rec_id = strategy_result.get("recommended_plan_id", "PLAN-B")
        sims = strategy_result.get("simulation_results", [])
        best_sim = next((s for s in sims if s.get("plan_id") == rec_id), {})
        best_score = best_sim.get("score", 0.94)

        oracle_msg = f"Simulated and ranked all recovery plans. {rec_id} selected as optimal strategy (Score: {best_score:.2f}, Cost: ${best_sim.get('estimated_cost', 0):,.0f}, Violations: {best_sim.get('deadline_violations', 0)})."
        agent_logs.append(AgentLogEntry(
            agent="Oracle",
            status="completed",
            message=oracle_msg,
            details={
                "recommended_plan_id": rec_id,
                "score": best_score,
                "reasoning": strategy_result.get("reasoning", [])
            }
        ))

        pulse_after = self.pulse_engine.calculate_pulse().model_dump()

        result_payload = {
            "event_id": event_id,
            "event": event,
            "agent_logs": [log.model_dump() for log in agent_logs],
            "impact": impact_result,
            "recovery_plans": plans,
            "simulation_results": sims,
            "recommended_plan": strategy_result.get("recommended_plan", {}),
            "recommended_plan_id": rec_id,
            "reasoning": strategy_result.get("reasoning", []),
            "comparison_summary": strategy_result.get("comparison_summary", {}),
            "pulse_before": pulse_before,
            "pulse_after": pulse_after
        }

        # Store in factory state for rapid lookup by event_id
        self.factory_state.set_agent_results(event_id, result_payload)

        return result_payload

    def trigger_scenario_a(self) -> Dict[str, Any]:
        """Trigger predefined Scenario A: CNC-02 Gearbox Failure."""
        raw_message = "URGENT MACHINE ALERT: CNC-02 gearbox vibration exceeded safe operating limits. Machine shut down automatically. Estimated repair time: 6 hours."
        return self.process_event({
            "event_id": "EVT-001",
            "event_type": "machine_failure",
            "entity_id": "CNC-02",
            "duration_hours": 6.0,
            "severity": "critical",
            "source": "sentinel",
            "details": {"raw_message": raw_message, "failure_mode": "gearbox vibration"}
        })
