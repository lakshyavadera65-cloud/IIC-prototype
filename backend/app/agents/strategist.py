from typing import Dict, Any, List
from app.engines.impact_engine import ImpactEngine
from app.engines.recovery_engine import RecoveryEngine
from app.agents.oracle import OracleAgent


class StrategistAgent:
    """Strategist Agent orchestrates impact analysis, recovery plan synthesis, simulation, and deterministic recommendation."""

    def __init__(self, factory_state):
        self.factory_state = factory_state
        self.impact_engine = ImpactEngine(factory_state)
        self.recovery_engine = RecoveryEngine(factory_state)
        self.oracle_agent = OracleAgent(factory_state)

    def formulate_strategy(self, event: Dict[str, Any], precomputed_impact: Dict[str, Any] = None) -> Dict[str, Any]:
        """Synthesize recovery plans, simulate outcomes via Oracle, and rank them deterministically."""
        event_id = event.get("event_id", "EVT-001")

        # 1. Analyze impact if not already provided
        impact_result = precomputed_impact or self.impact_engine.analyze_event(event)

        # 2. Generate candidate recovery plans
        candidate_plans = self.recovery_engine.generate_plans(impact_result)

        # 3. Simulate and compare via Oracle
        oracle_evaluation = self.oracle_agent.evaluate_and_compare(event_id, candidate_plans, impact_result)

        # 4. Save plans to central factory state for API access
        self.factory_state.set_recovery_plans(candidate_plans)

        return {
            "event_id": event_id,
            "impact": impact_result,
            "candidate_plans": candidate_plans,
            "simulation_results": oracle_evaluation.get("plans", []),
            "recommended_plan": oracle_evaluation.get("recommended_plan", {}),
            "recommended_plan_id": oracle_evaluation.get("recommended_plan_id", "PLAN-B"),
            "reasoning": oracle_evaluation.get("reasoning", []),
            "comparison_summary": oracle_evaluation.get("comparison_summary", {})
        }
