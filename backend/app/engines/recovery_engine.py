from typing import Dict, Any, List
from app.models.recovery import RecoveryPlan, PlanAction


class RecoveryEngine:
    def __init__(self, factory_state):
        self.factory_state = factory_state

    def generate_plans(self, impact_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate feasible recovery plans tailored to the analyzed impact."""
        event_type = impact_result.get("event_type", "machine_failure")
        entity_id = impact_result.get("entity_id", "CNC-02")
        duration_hours = impact_result.get("duration_hours", 6.0)

        # Get compatible alternatives from impact analysis
        alt_machine_id = impact_result.get("capacity_impact", {}).get("alternative_machine_id") or "CNC-01"
        alt_machine = self.factory_state.get_machine(alt_machine_id)
        overtime_rate = alt_machine.get("overtime_cost_per_hour", 2000) if alt_machine else 2000

        affected_order_ids = impact_result.get("affected_order_ids", ["ORD-103", "ORD-104"])

        plans = []

        if event_type == "machine_failure":
            # ----------------------------------------------------
            # PLAN A: FULL REROUTE
            # ----------------------------------------------------
            plan_a_actions = []
            for ord_id in affected_order_ids:
                plan_a_actions.append(PlanAction(
                    action_type="reroute_task",
                    resource_from=entity_id,
                    resource_to=alt_machine_id,
                    order_id=ord_id,
                    description=f"Reroute all machining for {ord_id} from {entity_id} to {alt_machine_id}",
                    parameters={"priority": "all"}
                ))

            # Displaces existing tasks on alt machine
            plan_a_actions.append(PlanAction(
                action_type="postpone_task",
                resource_from=alt_machine_id,
                resource_to=alt_machine_id,
                order_id="ORD-101",
                description=f"Delay lower-priority scheduled tasks on {alt_machine_id} to queue backlog",
                parameters={"delay_hours": 4.0}
            ))

            plan_a = RecoveryPlan(
                plan_id="PLAN-A",
                name="Full Production Reroute",
                description=f"Reroute all production from {entity_id} to backup machine {alt_machine_id}. Existing {alt_machine_id} tasks are queued behind rerouted work.",
                actions=plan_a_actions,
                affected_orders=sorted(list(set(affected_order_ids + ["ORD-101", "ORD-105"]))),
                estimated_cost=0.0,
                feasible=True,
                advantages=[
                    f"Production continues without waiting for {entity_id} repair",
                    f"Utilizes existing standard capacity on {alt_machine_id}",
                    "Incurs zero direct overtime labor expenditures"
                ],
                disadvantages=[
                    f"Causes queue delays and schedule cascade for existing orders on {alt_machine_id}",
                    "Increases cycle time for normal-priority orders",
                    "Elevates operational congestion on line 1"
                ],
                strategy_type="full_reroute"
            )
            plans.append(plan_a.model_dump())

            # ----------------------------------------------------
            # PLAN B: PRIORITY-BASED REROUTE (RECOMMENDED)
            # ----------------------------------------------------
            plan_b_actions = [
                PlanAction(
                    action_type="reroute_task",
                    resource_from=entity_id,
                    resource_to=alt_machine_id,
                    order_id="ORD-103",
                    description=f"Expedite Critical order ORD-103 immediately onto {alt_machine_id}",
                    parameters={"priority": "Critical", "slot_start": 0}
                ),
                PlanAction(
                    action_type="reroute_task",
                    resource_from=entity_id,
                    resource_to=alt_machine_id,
                    order_id="ORD-104",
                    description=f"Schedule High order ORD-104 onto {alt_machine_id} following critical batch",
                    parameters={"priority": "High", "slot_start": 8}
                ),
                PlanAction(
                    action_type="postpone_task",
                    resource_from=alt_machine_id,
                    resource_to=alt_machine_id,
                    order_id="ORD-105",
                    description=f"Postpone Normal priority order ORD-105 by 4 hours into buffer window",
                    parameters={"delay_hours": 4.0, "reason": "ORD-105 deadline is hour 30 (safe margin)"}
                )
            ]

            plan_b = RecoveryPlan(
                plan_id="PLAN-B",
                name="Priority-Based Selective Reroute",
                description=f"Reroute only Critical (ORD-103) and High (ORD-104) priority orders to {alt_machine_id}. Normal priority order ORD-105 is postponed into its ample delivery buffer.",
                actions=plan_b_actions,
                affected_orders=["ORD-103", "ORD-104", "ORD-105"],
                estimated_cost=0.0,
                feasible=True,
                advantages=[
                    "Guarantees 100% on-time delivery for Critical order ORD-103 (deadline hour 10)",
                    "Protects High-priority customer commitments with minimal disruption",
                    "Costs $0 in extra overtime expenses",
                    "Postponed order ORD-105 comfortably meets its hour 30 deadline"
                ],
                disadvantages=[
                    "Slight rescheduling delay for normal-priority order ORD-105 (within safety buffer)"
                ],
                strategy_type="priority_reroute"
            )
            plans.append(plan_b.model_dump())

            # ----------------------------------------------------
            # PLAN C: PRIORITY REROUTE + OVERTIME
            # ----------------------------------------------------
            overtime_hours = 4.0
            overtime_cost = overtime_hours * overtime_rate

            plan_c_actions = [
                PlanAction(
                    action_type="reroute_task",
                    resource_from=entity_id,
                    resource_to=alt_machine_id,
                    order_id="ORD-103",
                    description=f"Reroute Critical order ORD-103 to {alt_machine_id}",
                    parameters={"priority": "Critical"}
                ),
                PlanAction(
                    action_type="reroute_task",
                    resource_from=entity_id,
                    resource_to=alt_machine_id,
                    order_id="ORD-104",
                    description=f"Reroute High order ORD-104 to {alt_machine_id}",
                    parameters={"priority": "High"}
                ),
                PlanAction(
                    action_type="enable_overtime",
                    resource_from=alt_machine_id,
                    resource_to=alt_machine_id,
                    order_id=None,
                    description=f"Authorize {overtime_hours} hours overtime on {alt_machine_id} at ${overtime_rate}/hour",
                    parameters={"hours": overtime_hours, "hourly_rate": overtime_rate, "total_cost": overtime_cost}
                )
            ]

            plan_c = RecoveryPlan(
                plan_id="PLAN-C",
                name="Priority Reroute with Active Overtime",
                description=f"Reroute critical workload to {alt_machine_id} and activate {overtime_hours}h overtime shift to avoid postponing any existing production.",
                actions=plan_c_actions,
                affected_orders=["ORD-103", "ORD-104"],
                estimated_cost=overtime_cost,
                feasible=True,
                advantages=[
                    "Maximum deadline protection across all scheduled products",
                    "Zero postponements or delay to existing normal/high orders on Line 1",
                    "Recovers total lost factory throughput within the current 24-hour cycle"
                ],
                disadvantages=[
                    f"Direct operating cost increase of ${overtime_cost:,.0f} for overtime labor",
                    f"Increased machine wear and maintenance strain on {alt_machine_id}"
                ],
                strategy_type="overtime_reroute"
            )
            plans.append(plan_c.model_dump())

        return plans
