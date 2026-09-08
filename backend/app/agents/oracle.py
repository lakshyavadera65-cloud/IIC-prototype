from typing import Dict, Any, List
from app.engines.simulation_engine import SimulationEngine


class OracleAgent:
    """Oracle Agent evaluates, simulates, and compares recovery strategies using deterministic models."""

    def __init__(self, factory_state):
        self.factory_state = factory_state
        self.simulation_engine = SimulationEngine(factory_state)

    def evaluate_and_compare(self, event_id: str, plans: List[Dict[str, Any]], impact_result: Dict[str, Any]) -> Dict[str, Any]:
        """Run simulations for all candidate recovery plans and compile an explainable comparison summary."""
        comparison_data = self.simulation_engine.compare_and_rank_plans(plans, impact_result)

        return {
            "event_id": event_id,
            "plans": comparison_data.get("simulations", []),
            "recommended_plan": comparison_data.get("recommended_plan", {}),
            "recommended_plan_id": comparison_data.get("recommended_plan_id"),
            "reasoning": comparison_data.get("reasoning", []),
            "comparison_summary": comparison_data.get("comparison_summary", {})
        }
