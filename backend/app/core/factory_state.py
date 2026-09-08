import json
from pathlib import Path
from copy import deepcopy
from datetime import datetime
from typing import List, Dict, Any, Tuple


class FactoryState:
    def __init__(self):
        # Get the app directory
        self.app_dir = Path(__file__).resolve().parent.parent
        self.data_dir = self.app_dir / "data"
        self.custom_machines_file = self.data_dir / "custom_machines.json"
        self.custom_orders_file = self.data_dir / "custom_orders.json"
        self.custom_schedule_file = self.data_dir / "custom_schedule.json"

        # Load factory baseline data
        self.baseline_machines = self._load_json("machines.json")
        self.custom_machines = self._load_custom_machines()
        self.machines = deepcopy(self.baseline_machines) + deepcopy(self.custom_machines)

        self.materials = self._load_json("materials.json")

        self.baseline_orders = self._load_json("orders.json")
        self.custom_orders = self._load_custom_orders()
        self.orders = deepcopy(self.baseline_orders) + deepcopy(self.custom_orders)

        self.baseline_schedule = self._load_json("schedule.json")
        self.custom_schedule = self._load_custom_schedule()
        self.schedule = deepcopy(self.baseline_schedule) + deepcopy(self.custom_schedule)

        # Dynamic factory state
        self.active_events = []
        self.event_history = []
        self.alerts = []
        self.agent_results = []
        self.recovery_plans = []
        self.resolutions = []

        # Keep original baseline state for reset functionality
        self.initial_state = self._create_snapshot()

    # ----------------------------------------------------
    # PERSISTENCE HELPERS
    # ----------------------------------------------------
    def _load_json(self, filename: str) -> list:
        """Load a JSON file from the data directory."""
        file_path = self.data_dir / filename
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)

    def _load_custom_machines(self) -> list:
        """Safely load user-added custom workstations."""
        if not self.custom_machines_file.exists():
            return []
        try:
            with open(self.custom_machines_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except Exception:
            return []

    def _save_custom_machines(self):
        """Safely write user-added custom workstations to persistent storage."""
        try:
            with open(self.custom_machines_file, "w", encoding="utf-8") as f:
                json.dump(self.custom_machines, f, indent=4)
        except Exception as e:
            print(f"Warning: Failed to persist custom machines: {e}")

    def _load_custom_orders(self) -> list:
        """Safely load user-imported orders."""
        if not self.custom_orders_file.exists():
            return []
        try:
            with open(self.custom_orders_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except Exception:
            return []

    def _save_custom_orders(self):
        """Safely write user-imported orders to persistent storage."""
        try:
            with open(self.custom_orders_file, "w", encoding="utf-8") as f:
                json.dump(self.custom_orders, f, indent=4)
        except Exception as e:
            print(f"Warning: Failed to persist custom orders: {e}")

    def _load_custom_schedule(self) -> list:
        """Safely load user-imported schedule tasks."""
        if not self.custom_schedule_file.exists():
            return []
        try:
            with open(self.custom_schedule_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data if isinstance(data, list) else []
        except Exception:
            return []

    def _save_custom_schedule(self):
        """Safely write user-imported schedule tasks to persistent storage."""
        try:
            with open(self.custom_schedule_file, "w", encoding="utf-8") as f:
                json.dump(self.custom_schedule, f, indent=4)
        except Exception as e:
            print(f"Warning: Failed to persist custom schedule: {e}")

    def _create_snapshot(self):
        """Create a copy of the original factory baseline state."""
        return {
            "machines": deepcopy(self.baseline_machines),
            "materials": deepcopy(self.materials),
            "orders": deepcopy(self.baseline_orders),
            "schedule": deepcopy(self.baseline_schedule)
        }

    # ----------------------------------------------------
    # FACTORY STATE QUERIES
    # ----------------------------------------------------
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

    # ----------------------------------------------------
    # EVENTS & INCIDENTS
    # ----------------------------------------------------
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
            "root_cause_category": event_data.get("root_cause_category", "equipment_failure"),
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

    # ----------------------------------------------------
    # SINGLE MACHINE CRUD
    # ----------------------------------------------------
    def add_machine(self, machine_data: dict) -> dict:
        """Add a new workstation / machine to factory state and persist it."""
        m_id = (machine_data.get("id") or "").strip().upper()
        m_name = (machine_data.get("name") or "").strip()

        if not m_id:
            m_id = m_name.replace(" ", "-").upper()[:15]
            machine_data["id"] = m_id

        # Check for duplicates
        for existing in self.machines:
            if existing["id"].upper() == m_id:
                raise ValueError(f"Machine with ID '{m_id}' already exists.")
            if existing.get("name", "").strip().lower() == m_name.lower():
                raise ValueError(f"Machine with name '{m_name}' already exists.")

        # Derive supported products if missing
        supported_products = machine_data.get("supported_products")
        if not supported_products:
            m_type = machine_data.get("type", "").lower()
            m_dept = machine_data.get("department", "").lower()
            caps = [c.lower() for c in machine_data.get("capabilities", [])]
            if any(k in m_type or k in m_dept for k in ("cnc", "machin", "lathe", "mill")) or any("machin" in c or "cutt" in c or "mill" in c for c in caps):
                supported_products = ["AX-100", "AX-200"]
            else:
                supported_products = ["AX-100", "AX-200"]
            machine_data["supported_products"] = supported_products

        new_machine = {
            "id": m_id,
            "name": m_name,
            "type": machine_data.get("type", "CNC Machine"),
            "department": machine_data.get("department", "Precision Machining"),
            "status": machine_data.get("status", "operational").lower(),
            "capacity_per_hour": float(machine_data.get("capacity_per_hour", 30)),
            "capabilities": machine_data.get("capabilities", []),
            "supported_products": supported_products,
            "utilization": float(machine_data.get("utilization", 75.0)),
            "current_utilization": float(machine_data.get("utilization", 75.0)),
            "overtime_available": bool(machine_data.get("overtime_available", True)),
            "overtime_cost_per_hour": float(machine_data.get("overtime_cost_per_hour", 2000.0)),
            "strategic_importance": machine_data.get("strategic_importance", "high").lower(),
            "notes": machine_data.get("notes"),
            "is_custom": True
        }

        self.custom_machines.append(new_machine)
        self.machines.append(new_machine)
        self._save_custom_machines()

        return new_machine

    def update_machine(self, machine_id: str, updates: dict) -> dict:
        """Update an existing machine's properties or status."""
        machine = self.get_machine(machine_id)
        if not machine:
            raise ValueError(f"Machine with ID '{machine_id}' not found.")

        for key, val in updates.items():
            if val is not None and key != "id":
                if key == "status":
                    machine[key] = val.value.lower() if hasattr(val, "value") else str(val).lower()
                elif key == "utilization":
                    machine["utilization"] = float(val)
                    machine["current_utilization"] = float(val)
                elif key in ("capacity_per_hour", "overtime_cost_per_hour"):
                    machine[key] = float(val)
                elif key == "overtime_available":
                    machine[key] = bool(val)
                else:
                    machine[key] = val

        for cm in self.custom_machines:
            if cm["id"] == machine_id:
                cm.update(machine)
                self._save_custom_machines()
                break

        return machine

    def delete_machine(self, machine_id: str) -> dict:
        """Safely delete a machine, checking if it is currently scheduled."""
        machine = self.get_machine(machine_id)
        if not machine:
            raise ValueError(f"Machine with ID '{machine_id}' not found.")

        scheduled_tasks = [t for t in self.schedule if t.get("resource_id") == machine_id]
        if scheduled_tasks:
            task_ids = ", ".join([t.get("id") for t in scheduled_tasks[:3]])
            raise ValueError(f"Cannot delete machine '{machine_id}': it is currently allocated to scheduled task(s) [{task_ids}].")

        baseline_ids = {m["id"] for m in self.baseline_machines}
        if machine_id in baseline_ids:
            raise ValueError(f"Cannot delete core baseline machine '{machine_id}'. Only custom added workstations can be deleted.")

        self.machines = [m for m in self.machines if m["id"] != machine_id]
        self.custom_machines = [m for m in self.custom_machines if m["id"] != machine_id]
        self._save_custom_machines()

        return {
            "status": "success",
            "message": f"Workstation '{machine_id}' deleted successfully.",
            "machine_id": machine_id
        }

    # ----------------------------------------------------
    # BATCH IMPORT METHODS & DUPLICATE RESOLUTION
    # ----------------------------------------------------
    def import_machines(self, records: List[dict], strategy: str = "skip") -> Tuple[int, int, int]:
        """
        Batch import machine records with duplicate strategy ('skip', 'update', 'reject').
        Returns (added_count, updated_count, skipped_count).
        """
        added = 0
        updated = 0
        skipped = 0

        existing_map = {m["id"].upper(): m for m in self.machines}

        # Validate reject strategy upfront
        if strategy == "reject":
            for r in records:
                m_id = r["id"].upper()
                if m_id in existing_map:
                    raise ValueError(f"Import rejected: Machine '{m_id}' already exists in factory system.")

        for r in records:
            m_id = r["id"].upper()
            clean_rec = dict(r)
            clean_rec.pop("is_existing", None)
            clean_rec["is_custom"] = True

            if m_id in existing_map:
                if strategy == "skip":
                    skipped += 1
                    continue
                elif strategy == "update":
                    # Update in machines list
                    existing = existing_map[m_id]
                    existing.update(clean_rec)

                    # If in custom_machines, update there too
                    for cm in self.custom_machines:
                        if cm["id"].upper() == m_id:
                            cm.update(clean_rec)
                            break
                    else:
                        # If it was in baseline, add updated copy to custom machines
                        self.custom_machines.append(clean_rec)

                    updated += 1
            else:
                self.custom_machines.append(clean_rec)
                self.machines.append(clean_rec)
                existing_map[m_id] = clean_rec
                added += 1

        self._save_custom_machines()
        return added, updated, skipped

    def import_orders(self, records: List[dict], strategy: str = "skip") -> Tuple[int, int, int]:
        """
        Batch import orders with duplicate strategy ('skip', 'update', 'reject').
        Returns (added_count, updated_count, skipped_count).
        """
        added = 0
        updated = 0
        skipped = 0

        existing_map = {o["id"].upper(): o for o in self.orders}

        if strategy == "reject":
            for r in records:
                o_id = r["id"].upper()
                if o_id in existing_map:
                    raise ValueError(f"Import rejected: Order '{o_id}' already exists in factory system.")

        for r in records:
            o_id = r["id"].upper()
            clean_rec = dict(r)
            clean_rec.pop("is_existing", None)
            clean_rec["is_custom"] = True

            if o_id in existing_map:
                if strategy == "skip":
                    skipped += 1
                    continue
                elif strategy == "update":
                    existing = existing_map[o_id]
                    existing.update(clean_rec)

                    for co in self.custom_orders:
                        if co["id"].upper() == o_id:
                            co.update(clean_rec)
                            break
                    else:
                        self.custom_orders.append(clean_rec)

                    updated += 1
            else:
                self.custom_orders.append(clean_rec)
                self.orders.append(clean_rec)
                existing_map[o_id] = clean_rec
                added += 1

        self._save_custom_orders()
        return added, updated, skipped

    def import_schedule(self, records: List[dict], strategy: str = "skip") -> Tuple[int, int, int]:
        """
        Batch import schedule tasks with duplicate strategy ('skip', 'update', 'reject').
        Returns (added_count, updated_count, skipped_count).
        """
        added = 0
        updated = 0
        skipped = 0

        existing_map = {s["id"].upper(): s for s in self.schedule}

        if strategy == "reject":
            for r in records:
                s_id = r["id"].upper()
                if s_id in existing_map:
                    raise ValueError(f"Import rejected: Schedule task '{s_id}' already exists.")

        for r in records:
            s_id = r["id"].upper()
            clean_rec = dict(r)
            clean_rec.pop("is_existing", None)
            clean_rec["is_custom"] = True

            if s_id in existing_map:
                if strategy == "skip":
                    skipped += 1
                    continue
                elif strategy == "update":
                    existing = existing_map[s_id]
                    existing.update(clean_rec)

                    for cs in self.custom_schedule:
                        if cs["id"].upper() == s_id:
                            cs.update(clean_rec)
                            break
                    else:
                        self.custom_schedule.append(clean_rec)

                    updated += 1
            else:
                self.custom_schedule.append(clean_rec)
                self.schedule.append(clean_rec)
                existing_map[s_id] = clean_rec
                added += 1

        self._save_custom_schedule()
        return added, updated, skipped

    def import_complete_dataset(
        self,
        machines: List[dict] = None,
        orders: List[dict] = None,
        schedule: List[dict] = None,
        strategy: str = "skip"
    ) -> Dict[str, Any]:
        """
        Import complete factory dataset and update the intelligence model.
        """
        m_add, m_up, m_sk = 0, 0, 0
        o_add, o_up, o_sk = 0, 0, 0
        s_add, s_up, s_sk = 0, 0, 0

        if machines:
            m_add, m_up, m_sk = self.import_machines(machines, strategy=strategy)
        if orders:
            o_add, o_up, o_sk = self.import_orders(orders, strategy=strategy)
        if schedule:
            s_add, s_up, s_sk = self.import_schedule(schedule, strategy=strategy)

        from app.engines.pulse_engine import PulseEngine
        pulse = PulseEngine(self).calculate_pulse()

        return {
            "machines": {"added": m_add, "updated": m_up, "skipped": m_sk},
            "orders": {"added": o_add, "updated": o_up, "skipped": o_sk},
            "schedule": {"added": s_add, "updated": s_up, "skipped": s_sk},
            "pulse": pulse.model_dump() if hasattr(pulse, "model_dump") else pulse
        }

    def add_schedule_slot(self, slot_data: dict) -> dict:
        """Add a new schedule slot, validate resource, and persist to custom schedule."""
        s_id = slot_data.get("id")
        if not s_id:
            existing_nums = []
            for s in self.schedule:
                sid = s.get("id", "")
                if sid.startswith("SCH-") and sid[4:].isdigit():
                    existing_nums.append(int(sid[4:]))
            next_num = max(existing_nums, default=0) + 1
            s_id = f"SCH-{next_num:03d}"

        machine_id = (slot_data.get("resource_id") or slot_data.get("machine_id") or "").strip().upper()
        if not machine_id:
            raise ValueError("Machine / Resource ID is required.")

        start_hour = float(slot_data.get("start_hour", 0.0))
        duration = float(slot_data.get("duration_hours", 2.0))
        end_hour = slot_data.get("end_hour")
        if end_hour is None or float(end_hour) <= start_hour:
            end_hour = start_hour + max(0.5, duration)
        else:
            end_hour = float(end_hour)

        clean_rec = {
            "id": s_id.upper(),
            "resource_id": machine_id,
            "order_id": (slot_data.get("order_id") or "ORD-101").strip().upper(),
            "operation": (slot_data.get("operation") or "CNC_MACHINING").strip(),
            "start_hour": start_hour,
            "end_hour": end_hour,
            "status": slot_data.get("status", "scheduled"),
            "operator": slot_data.get("operator", "Tech-1"),
            "notes": slot_data.get("notes", "")
        }

        if any(s.get("id", "").upper() == clean_rec["id"] for s in self.schedule):
            raise ValueError(f"Schedule slot '{clean_rec['id']}' already exists.")

        self.custom_schedule.append(clean_rec)
        self.schedule.append(clean_rec)
        self._save_custom_schedule()
        return clean_rec

    def delete_schedule_slot(self, slot_id: str) -> dict:
        """Safely delete a custom schedule slot."""
        slot_id = slot_id.strip().upper()
        cust_target = next((s for s in self.custom_schedule if s.get("id", "").upper() == slot_id), None)
        if not cust_target:
            if any(s.get("id", "").upper() == slot_id for s in self.baseline_schedule):
                raise ValueError(f"Cannot delete baseline schedule task '{slot_id}'. Only user-added tasks may be removed.")
            raise ValueError(f"Schedule slot '{slot_id}' not found.")

        self.custom_schedule = [s for s in self.custom_schedule if s.get("id", "").upper() != slot_id]
        self.schedule = [s for s in self.schedule if s.get("id", "").upper() != slot_id]
        self._save_custom_schedule()
        return {"status": "success", "message": f"Schedule task '{slot_id}' deleted successfully."}

    # ----------------------------------------------------
    # RESET & RESTORATION
    # ----------------------------------------------------
    def reset(self, hard_reset: bool = False):
        """
        Reset factory operational state.
        Default (hard_reset=False): Clears active disruptions/alerts/plans, resets machine
        operational statuses, and restores nominal schedule while safely preserving user-imported
        custom workstations, orders, and schedule tasks.
        Hard Reset (hard_reset=True): Wipes all custom data and restores pure baseline.
        """
        if hard_reset:
            self.custom_machines = []
            self._save_custom_machines()
            self.custom_orders = []
            self._save_custom_orders()
            self.custom_schedule = []
            self._save_custom_schedule()

            self.machines = deepcopy(self.baseline_machines)
            self.orders = deepcopy(self.baseline_orders)
            self.schedule = deepcopy(self.baseline_schedule)
        else:
            base_m = deepcopy(self.baseline_machines)
            cust_m = deepcopy(self.custom_machines)
            for m in cust_m:
                if m.get("status") in ("offline", "failed", "degraded"):
                    m["status"] = "operational"
                m["overtime_active"] = False
            for m in base_m:
                m["overtime_active"] = False
            self.machines = base_m + cust_m

            base_o = deepcopy(self.baseline_orders)
            cust_o = deepcopy(self.custom_orders)
            for o in cust_o:
                o["risk_status"] = "none"
                o["status"] = "scheduled"
            for o in base_o:
                o["risk_status"] = "none"
                o["status"] = "scheduled"
            self.orders = base_o + cust_o

            base_s = deepcopy(self.baseline_schedule)
            cust_s = deepcopy(self.custom_schedule)
            for s in cust_s:
                s["status"] = "scheduled"
            for s in base_s:
                s["status"] = "scheduled"
            self.schedule = base_s + cust_s

        self.materials = deepcopy(self.initial_state["materials"])

        self.active_events = []
        self.event_history = []
        self.alerts = []
        self.agent_results = []
        self.recovery_plans = []
        self.resolutions = []


# Create one central factory instance
factory_state = FactoryState()