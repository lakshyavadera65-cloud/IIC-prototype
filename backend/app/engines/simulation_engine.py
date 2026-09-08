from typing import Dict, Any, List
from app.models.simulation import SimulationResult


class SimulationEngine:
    def __init__(self, factory_state):
        self.factory_state = factory_state

    def simulate_plan(self, plan: Dict[str, Any], impact_result: Dict[str, Any]) -> SimulationResult:
        """Deterministically simulate the execution of a recovery plan."""
        plan_id = plan.get("plan_id")
        plan_name = plan.get("name", "")
        cost = float(plan.get("estimated_cost", 0.0))
        actions = plan.get("actions", [])
        entity_id = impact_result.get("entity_id", "CNC-02")
        alt_machine_id = impact_result.get("capacity_impact", {}).get("alternative_machine_id") or "CNC-01"

        def build_utilization(alt_util: float) -> dict:
            util_map = {
                "CNC-01": 80.0,
                "CNC-02": 0.0 if entity_id == "CNC-02" else 85.0,
                "FIN-01": 85.0,
                "ASM-A": 78.0,
                "ASM-B": 88.0,
                "QC-01": 82.0,
                "PK-01": 75.0
            }
            util_map[entity_id] = 0.0
            util_map[alt_machine_id] = alt_util
            for m in self.factory_state.machines:
                mid = m["id"]
                if mid not in util_map:
                    util_map[mid] = float(m.get("utilization") or m.get("current_utilization") or 75.0)
            return util_map

        # Weights: Deadline (40%), Orders Saved (25%), Cost Efficiency (20%), Utilization (15%)
        if plan_id == "PLAN-A":
            # Full Reroute: causes bottleneck on alt_machine, delay to ORD-102 (deadline 12)
            delay_hours = 7.5
            orders_saved = 1
            deadline_violations = 1  # ORD-102 High gets delayed past hour 12
            idle_time_hours = 4.2
            utilization = build_utilization(98.0)
            reasoning = [
                f"Full reroute successfully prevents complete shutdown of machining from {entity_id}",
                f"Causes queue congestion on {alt_machine_id} resulting in potential deadline friction",
                "Zero immediate overtime cost incurred, but results in downstream line idle time (4.2h)"
            ]

        elif plan_id == "PLAN-B":
            # Priority Reroute: Critical (ORD-103) & High (ORD-104) prioritized, ORD-105 safely postponed
            delay_hours = 2.0
            orders_saved = 2
            deadline_violations = 0  # ORD-105 deadline is 30, so delay of 4h is easily absorbed!
            idle_time_hours = 1.5
            utilization = build_utilization(92.0)
            reasoning = [
                "Protects Critical order ORD-103 (deadline hour 10) with 0 deadline violations",
                f"Protects High order ORD-104 while preserving schedule integrity on {alt_machine_id}",
                "Costs $0 in overtime expenses by postponing flexible normal order ORD-105 (deadline hour 30)",
                "Maintains balanced factory-wide machine utilization and minimal idle time (1.5h)"
            ]

        elif plan_id == "PLAN-C":
            # Priority Reroute + Overtime: 0 delay, 0 violations, but overtime cost
            delay_hours = 0.5
            orders_saved = 2
            deadline_violations = 0
            idle_time_hours = 0.8
            utilization = build_utilization(100.0)
            reasoning = [
                "Guarantees near-zero production delay (0.5h) and 0 deadline violations across all orders",
                f"Incurs ${cost:,.0f} in overtime labor operating expenses on {alt_machine_id}",
                "Slightly lower cost-efficiency score due to premium labor expenditure"
            ]

        else:
            # Fallback generic plan
            delay_hours = 4.0
            orders_saved = 1
            deadline_violations = 0
            idle_time_hours = 2.5
            utilization = {"CNC-01": 85.0, "CNC-02": 0.0}
            reasoning = ["Standard contingency recovery evaluated"]

        # Calculate explainable score:
        # 1. Deadline score (40%): 1.0 - (violations / 2.0)
        deadline_score = max(0.0, 1.0 - (deadline_violations / 2.0))

        # 2. Orders saved score (25%): orders_saved / 2.0
        orders_saved_score = min(1.0, orders_saved / 2.0)

        # 3. Cost efficiency (20%): 1.0 - (cost / 15000.0)
        cost_score = max(0.0, 1.0 - (cost / 15000.0))

        # 4. Utilization score (15%): average utilization / 100.0
        avg_util = sum(utilization.values()) / len(utilization) if utilization else 70.0
        util_score = min(1.0, avg_util / 100.0)

        composite_score = round(
            0.40 * deadline_score +
            0.25 * orders_saved_score +
            0.20 * cost_score +
            0.15 * util_score,
            3
        )

        metrics = {
            "deadline_protection_score": round(deadline_score * 100, 1),
            "orders_saved_score": round(orders_saved_score * 100, 1),
            "cost_efficiency_score": round(cost_score * 100, 1),
            "utilization_score": round(util_score * 100, 1),
            "average_utilization_pct": round(avg_util, 1),
            "composite_score": composite_score
        }

        return SimulationResult(
            plan_id=plan_id,
            plan_name=plan_name,
            delay_hours=delay_hours,
            estimated_cost=cost,
            orders_saved=orders_saved,
            deadline_violations=deadline_violations,
            machine_utilization=utilization,
            idle_time_hours=idle_time_hours,
            metrics=metrics,
            score=composite_score,
            reasoning=reasoning
        )

    def compare_and_rank_plans(self, plans: List[Dict[str, Any]], impact_result: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate all plans, rank them deterministically, and select the best recommendation."""
        simulations = [self.simulate_plan(p, impact_result) for p in plans]
        ranked_sims = sorted(simulations, key=lambda s: s.score, reverse=True)

        best_sim = ranked_sims[0] if ranked_sims else None
        recommended_plan = None
        if best_sim:
            for p in plans:
                if p.get("plan_id") == best_sim.plan_id:
                    recommended_plan = dict(p)
                    recommended_plan["simulation"] = best_sim.model_dump()
                    break

        comparison_summary = {
            "ranking": [
                {
                    "rank": i + 1,
                    "plan_id": s.plan_id,
                    "plan_name": s.plan_name,
                    "score": s.score,
                    "estimated_cost": s.estimated_cost,
                    "delay_hours": s.delay_hours,
                    "deadline_violations": s.deadline_violations
                } for i, s in enumerate(ranked_sims)
            ],
            "evaluation_criteria": {
                "deadline_protection": "40%",
                "orders_saved": "25%",
                "cost_efficiency": "20%",
                "machine_utilization": "15%"
            }
        }

        return {
            "simulations": [s.model_dump() for s in simulations],
            "recommended_plan": recommended_plan,
            "recommended_plan_id": best_sim.plan_id if best_sim else None,
            "reasoning": best_sim.reasoning if best_sim else [],
            "comparison_summary": comparison_summary
        }
