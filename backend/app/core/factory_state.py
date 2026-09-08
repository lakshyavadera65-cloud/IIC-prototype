import json
from pathlib import Path
from copy import deepcopy
from datetime import datetime


class FactoryState:
    def __init__(self):
        # Get the app directory
        self.app_dir = Path(__file__).resolve().parent.parent
        self.data_dir = self.app_dir / "data"

        # Load factory data
        self.machines = self._load_json("machines.json")
        self.materials = self._load_json("materials.json")
        self.orders = self._load_json("orders.json")
        self.schedule = self._load_json("schedule.json")

        # Dynamic factory state
        self.active_events = []
        self.event_history = []
        self.alerts = []
        self.agent_results = []
        self.recovery_plans = []
        self.resolutions = []

        # Keep original state for reset functionality later
        self.initial_state = self._create_snapshot()

    def _load_json(self, filename):
        """Load a JSON file from the data directory."""
        file_path = self.data_dir / filename
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def _create_snapshot(self):
        """Create a copy of the original factory state."""
        return {
            "machines": deepcopy(self.machines),
            "materials": deepcopy(self.materials),
            "orders": deepcopy(self.orders),
            "schedule": deepcopy(self.schedule)
        }

    def get_state(self):
        """Return the complete current factory state."""
        from app.engines.pulse_engine import PulseEngine
        pulse = PulseEngine(self).calculate_pulse()

        return {
            "machines": self.machines,
            "materials": self.materials,
            "orders": self.orders,
            "schedule": self.schedule,
            "active_events": self.active_events,
            "event_history": self.event_history,
            "alerts": self.alerts,
            "agent_results": self.agent_results,
            "recovery_plans": self.recovery_plans,
            "resolutions": self.resolutions,
            "pulse": pulse.model_dump() if hasattr(pulse, "model_dump") else pulse
        }

    def get_machine(self, machine_id):
        """Find a machine by ID."""
        for machine in self.machines:
            if machine["id"] == machine_id:
                return machine
        return None

    def get_order(self, order_id):
        """Find an order by ID."""
        for order in self.orders:
            if order["id"] == order_id:
                return order
        return None

    def add_event(self, event_data: dict):
        """Register an event in factory state, updating affected entities."""
        event_id = event_data.get("event_id", f"EVT-{len(self.event_history) + 1:03d}")
        event_data["event_id"] = event_id
        if "status" not in event_data:
            event_data["status"] = "active"

        # Update entity status if machine failure
        if event_data.get("event_type") == "machine_failure":
            machine_id = event_data.get("entity_id")
            machine = self.get_machine(machine_id)
            if machine:
                machine["status"] = "offline"

        # Update order risk status if affected
        affected_order_ids = event_data.get("affected_order_ids", [])
        for ord_id in affected_order_ids:
            order = self.get_order(ord_id)
            if order:
                order["risk_status"] = "critical" if order.get("priority") == "Critical" else "high"

        # Save to active events (replace if existing)
        self.active_events = [e for e in self.active_events if e.get("event_id") != event_id]
        self.active_events.append(event_data)
        self.event_history.append(event_data)

        # Create alert entry
        alert_entry = {
            "alert_id": f"ALT-{len(self.alerts) + 1:03d}",
            "event_id": event_id,
            "severity": event_data.get("severity", "medium"),
            "title": f"Incident on {event_data.get('entity_id')}",
            "message": f"{event_data.get('event_type').replace('_', ' ').title()}: duration {event_data.get('duration_hours', 0)}h",
            "timestamp": datetime.utcnow().isoformat(),
            "entity_id": event_data.get("entity_id"),
            "active": True
        }
        self.alerts.append(alert_entry)
        return event_data

    def set_agent_results(self, event_id: str, results_payload: dict):
        """Store agent execution results for an event."""
        self.agent_results = [r for r in self.agent_results if r.get("event_id") != event_id]
        self.agent_results.append(results_payload)

    def get_agent_results(self, event_id: str):
        """Retrieve agent results for an event."""
        for res in self.agent_results:
            if res.get("event_id") == event_id:
                return res
        return None

    def set_recovery_plans(self, plans: list):
        """Store generated recovery plans."""
        self.recovery_plans = plans

    def get_recovery_plan(self, plan_id: str):
        """Retrieve a specific recovery plan."""
        for plan in self.recovery_plans:
            if plan.get("plan_id") == plan_id:
                return plan
        return None

    def apply_recovery_plan(self, plan_id: str):
        """Execute a recovery plan, applying its actions to factory schedule and entities."""
        plan = self.get_recovery_plan(plan_id)
        if not plan:
            raise ValueError(f"Recovery plan {plan_id} not found.")

        applied_actions = []

        # Process actions
        for action in plan.get("actions", []):
            action_type = action.get("action_type")
            order_id = action.get("order_id")
            task_id = action.get("task_id")
            res_to = action.get("resource_to")
            res_from = action.get("resource_from")

            if action_type == "reroute_task":
                # Find task in schedule
                for task in self.schedule:
                    if (task_id and task.get("id") == task_id) or (order_id and task.get("order_id") == order_id and task.get("resource_id") == res_from):
                        task["resource_id"] = res_to
                        applied_actions.append(f"Rerouted task {task.get('id')} ({order_id}) to {res_to}")

            elif action_type == "postpone_task":
                delay_hours = action.get("parameters", {}).get("delay_hours", 4)
                for task in self.schedule:
                    if (task_id and task.get("id") == task_id) or (order_id and task.get("order_id") == order_id and task.get("resource_id") == res_from):
                        task["start_hour"] += delay_hours
                        task["end_hour"] += delay_hours
                        applied_actions.append(f"Postponed task {task.get('id')} ({order_id}) by {delay_hours}h")

            elif action_type == "enable_overtime":
                machine_id = res_to or res_from or "CNC-01"
                machine = self.get_machine(machine_id)
                if machine:
                    machine["overtime_active"] = True
                    applied_actions.append(f"Enabled overtime on {machine_id}")

        # Update order risk status
        for ord_id in plan.get("affected_orders", []):
            order = self.get_order(ord_id)
            if order:
                order["risk_status"] = "mitigated"

        # Update active events
        for event in self.active_events:
            event["status"] = "mitigated"
            event["resolution_plan"] = plan_id

        # Dismiss active alerts associated with this event
        for alert in self.alerts:
            alert["active"] = False

        # Record resolution
        resolution_record = {
            "resolution_id": f"RES-{len(self.resolutions) + 1:03d}",
            "plan_id": plan_id,
            "plan_name": plan.get("name"),
            "applied_actions": applied_actions,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "applied"
        }
        self.resolutions.append(resolution_record)

        from app.engines.pulse_engine import PulseEngine
        new_pulse = PulseEngine(self).calculate_pulse()

        return {
            "status": "success",
            "message": f"Recovery plan {plan_id} ({plan.get('name')}) executed successfully",
            "applied_actions": applied_actions,
            "resolution": resolution_record,
            "pulse": new_pulse.model_dump() if hasattr(new_pulse, "model_dump") else new_pulse
        }

    def reset(self):
        """Reset the factory to its original healthy state."""
        self.machines = deepcopy(self.initial_state["machines"])
        self.materials = deepcopy(self.initial_state["materials"])
        self.orders = deepcopy(self.initial_state["orders"])
        self.schedule = deepcopy(self.initial_state["schedule"])

        self.active_events = []
        self.event_history = []
        self.alerts = []
        self.agent_results = []
        self.recovery_plans = []
        self.resolutions = []


# Create one central factory instance
factory_state = FactoryState()