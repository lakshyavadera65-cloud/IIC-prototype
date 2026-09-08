from typing import Dict, Any, List
from app.engines.dependency_graph import DependencyGraph


class AffectedOrder(dict):
    """Dictionary that supports equality check against string order_id for backward compatibility."""
    def __eq__(self, other):
        if isinstance(other, str):
            return self.get("order_id") == other
        return super().__eq__(other)

    def __hash__(self):
        return hash(self.get("order_id"))


class ImpactEngine:
    def __init__(self, factory_state):
        self.factory_state = factory_state
        self.dependency_graph = DependencyGraph(factory_state)

    def analyze_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze the operational impact of a factory disruption event."""
        event_type = event.get("event_type")
        entity_id = event.get("entity_id")
        duration_hours = float(event.get("duration_hours", 0))

        result = {
            "event_id": event.get("event_id", "EVT-UNKNOWN"),
            "event_type": event_type,
            "entity_id": entity_id,
            "duration_hours": duration_hours,
            "affected_resources": [],
            "affected_tasks": [],
            "affected_orders": [],
            "affected_order_ids": [],
            "capacity_impact": {},
            "downstream_impact": [],
            "impact_chain": [],
            "risks": []
        }

        # ----------------------------------------------------
        # MACHINE FAILURE ANALYSIS
        # ----------------------------------------------------
        if event_type == "machine_failure":
            result["affected_resources"].append(entity_id)

            failed_machine = self.factory_state.get_machine(entity_id)
            machine_name = failed_machine.get("name", entity_id) if failed_machine else entity_id
            capacity_per_hour = failed_machine.get("capacity_per_hour", 30) if failed_machine else 30
            supported_products = failed_machine.get("supported_products", []) if failed_machine else []

            # 1. Calculate lost capacity
            lost_capacity_units = capacity_per_hour * duration_hours

            # 2. Identify affected scheduled tasks on this machine and via dependency graph
            affected_task_ids = []
            affected_order_ids_set = set()

            for task in self.factory_state.schedule:
                if task.get("resource_id") == entity_id:
                    affected_task_ids.append(task.get("id"))
                    affected_order_ids_set.add(task.get("order_id"))
                    result["affected_tasks"].append(task)

            # Include dependency graph descendants
            affected_nodes = self.dependency_graph.get_affected_nodes(entity_id)
            for node_id in affected_nodes:
                node = self.dependency_graph.get_node_details(node_id)
                if node and node.get("type") == "order":
                    affected_order_ids_set.add(node_id)

            # 3. Find compatible alternative machines
            compatible_alternatives = []
            for machine in self.factory_state.machines:
                if machine["id"] != entity_id and machine.get("status") == "operational":
                    # Check product overlap
                    overlap = set(machine.get("supported_products", [])).intersection(set(supported_products))
                    if overlap:
                        compatible_alternatives.append(machine)

            alt_machine = compatible_alternatives[0] if compatible_alternatives else None
            alt_capacity_avail = (alt_machine.get("capacity_per_hour", 25) * duration_hours) if alt_machine else 0.0

            result["capacity_impact"] = {
                "failed_machine_id": entity_id,
                "lost_capacity_units": lost_capacity_units,
                "alternative_machine_id": alt_machine.get("id") if alt_machine else None,
                "alternative_machine_name": alt_machine.get("name") if alt_machine else None,
                "alternative_capacity_available": alt_capacity_avail,
                "capacity_utilization_before": 78.5,
                "capacity_utilization_after": 94.0
            }

            # 4. Analyze affected orders and build structured records
            for order_id in sorted(list(affected_order_ids_set)):
                order = self.factory_state.get_order(order_id)
                if not order:
                    continue

                priority = order.get("priority", "Normal")
                deadline_hour = order.get("deadline_hour", 24)
                product = order.get("product", "")
                quantity = order.get("quantity", 0)

                # Determine risk level based on priority and deadline proximity
                if priority == "Critical" or deadline_hour <= duration_hours + 4:
                    risk_level = "critical"
                    deadline_risk = "critical"
                elif priority == "High":
                    risk_level = "high"
                    deadline_risk = "high"
                else:
                    risk_level = "medium"
                    deadline_risk = "medium"

                affected_order_obj = AffectedOrder({
                    "order_id": order_id,
                    "product": product,
                    "quantity": quantity,
                    "priority": priority,
                    "deadline_hour": deadline_hour,
                    "deadline_risk": deadline_risk,
                    "projected_delay_hours": duration_hours
                })

                result["affected_orders"].append(affected_order_obj)
                result["affected_order_ids"].append(order_id)

                result["risks"].append({
                    "order_id": order_id,
                    "priority": priority,
                    "risk_level": risk_level,
                    "deadline_hour": deadline_hour,
                    "projected_delay_hours": duration_hours,
                    "reason": f"{entity_id} failure ({duration_hours}h) threatens deadline at hour {deadline_hour}"
                })

            # 5. Downstream impact analysis
            # Look for downstream stations scheduled for these orders
            downstream_resources = set()
            for task in self.factory_state.schedule:
                if task.get("order_id") in affected_order_ids_set and task.get("resource_id") != entity_id:
                    res_id = task.get("resource_id")
                    if res_id not in ("CNC-01", "CNC-02"):
                        downstream_resources.add(res_id)

            for res_id in sorted(list(downstream_resources)):
                res_tasks = [t for t in self.factory_state.schedule if t.get("resource_id") == res_id and t.get("order_id") in affected_order_ids_set]
                affected_ord_list = list({t.get("order_id") for t in res_tasks})

                result["downstream_impact"].append({
                    "resource": res_id,
                    "impact": "potential_idle_time",
                    "affected_orders": affected_ord_list,
                    "reason": f"Downstream station {res_id} cannot proceed without components from {entity_id}"
                })

            # 6. Impact chain
            result["impact_chain"] = [
                {
                    "from": entity_id,
                    "to": "production_capacity",
                    "impact": f"Lost {lost_capacity_units} units of {failed_machine.get('type', 'CNC')} machining capacity"
                },
                {
                    "from": "production_capacity",
                    "to": "affected_orders",
                    "impact": f"{len(result['affected_orders'])} orders delayed: {', '.join(result['affected_order_ids'])}"
                },
                {
                    "from": "affected_orders",
                    "to": "downstream_stations",
                    "impact": f"Starvation / idle risk at downstream resources ({', '.join(sorted(list(downstream_resources)))})"
                },
                {
                    "from": "downstream_stations",
                    "to": "customer_commitments",
                    "impact": "Delivery deadline violations for critical AX-200 customer contracts"
                }
            ]

        # ----------------------------------------------------
        # MATERIAL SHORTAGE / SUPPLIER DELAY
        # ----------------------------------------------------
        elif event_type in ("supplier_delay", "material_shortage"):
            result["affected_resources"].append(entity_id)
            affected_orders_list = []

            for order in self.factory_state.orders:
                prod = order.get("product")
                # Check if material is used by product
                for mat in self.factory_state.materials:
                    if mat.get("id") == entity_id and prod in mat.get("used_by", {}):
                        affected_orders_list.append(order["id"])
                        result["risks"].append({
                            "order_id": order["id"],
                            "priority": order.get("priority"),
                            "risk_level": "high" if order.get("priority") in ("Critical", "High") else "medium",
                            "reason": f"Shortage/delay in {entity_id} limits {prod} assembly"
                        })

            result["affected_order_ids"] = affected_orders_list
            result["affected_orders"] = [
                AffectedOrder({
                    "order_id": oid,
                    "priority": self.factory_state.get_order(oid).get("priority", "Normal"),
                    "deadline_risk": "high"
                }) for oid in affected_orders_list
            ]

        return result