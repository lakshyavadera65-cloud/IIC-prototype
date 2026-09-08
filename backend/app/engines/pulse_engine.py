from typing import Dict, Any
from app.models.pulse import PulseHealth, PulseComponents


class PulseEngine:
    def __init__(self, factory_state):
        self.factory_state = factory_state

    def calculate_pulse(self) -> PulseHealth:
        """Calculate factory operations health score (0-100) and explainable components."""
        # 1. MACHINE HEALTH (30%)
        importance_weights = {
            "critical": 2.5,
            "high": 1.8,
            "medium": 1.0,
            "low": 0.5
        }

        total_machine_weight = 0.0
        earned_machine_weight = 0.0
        operational_count = 0

        for machine in self.factory_state.machines:
            weight = importance_weights.get(machine.get("strategic_importance", "medium"), 1.0)
            total_machine_weight += weight

            status = machine.get("status", "operational")
            if status == "operational":
                earned_machine_weight += weight
                operational_count += 1
            elif status in ("repairing", "backup_rerouted"):
                earned_machine_weight += weight * 0.7
            elif status == "offline" or status == "failed":
                earned_machine_weight += 0.0

        machine_health = (earned_machine_weight / total_machine_weight * 100.0) if total_machine_weight > 0 else 100.0

        # 2. SCHEDULE STABILITY (30%)
        total_tasks = len(self.factory_state.schedule)
        unaffected_tasks = 0
        offline_machine_ids = {m["id"] for m in self.factory_state.machines if m.get("status") in ("offline", "failed")}

        for task in self.factory_state.schedule:
            if task.get("resource_id") in offline_machine_ids:
                continue
            unaffected_tasks += 1

        schedule_stability = (unaffected_tasks / total_tasks * 100.0) if total_tasks > 0 else 100.0

        # Adjust stability slightly if any active events exist
        if self.factory_state.active_events and any(e.get("status") == "active" for e in self.factory_state.active_events):
            schedule_stability = max(50.0, schedule_stability * 0.85)

        # 3. ORDER RISK (25%)
        order_penalties = {
            "none": 0.0,
            "mitigated": 5.0,
            "low": 5.0,
            "medium": 15.0,
            "high": 30.0,
            "critical": 50.0
        }

        total_penalty = 0.0
        active_risks_count = 0

        for order in self.factory_state.orders:
            risk = order.get("risk_status", "none")
            penalty = order_penalties.get(risk, 0.0)
            if penalty > 0:
                active_risks_count += 1
            total_penalty += penalty

        order_risk_score = max(20.0, 100.0 - total_penalty)

        # 4. INVENTORY HEALTH (15%)
        inv_scores = []
        for mat in self.factory_state.materials:
            stock = mat.get("current_stock", 0)
            safety = mat.get("safety_stock", 1)
            ratio = stock / safety if safety > 0 else 1.0
            if ratio >= 1.5:
                inv_scores.append(100.0)
            elif ratio >= 1.0:
                inv_scores.append(85.0)
            elif ratio >= 0.5:
                inv_scores.append(50.0)
            else:
                inv_scores.append(20.0)

        inventory_health = sum(inv_scores) / len(inv_scores) if inv_scores else 95.0

        # OVERALL WEIGHTED PULSE
        pulse_raw = (
            0.30 * machine_health +
            0.30 * schedule_stability +
            0.25 * order_risk_score +
            0.15 * inventory_health
        )
        pulse_score = round(min(100.0, max(0.0, pulse_raw)), 1)

        # STATUS DETERMINATION
        if pulse_score >= 85.0:
            status = "STABLE"
        elif pulse_score >= 70.0:
            status = "DEGRADED"
        else:
            status = "CRITICAL ATTENTION"

        components = PulseComponents(
            machine_health=round(machine_health, 1),
            schedule_stability=round(schedule_stability, 1),
            order_risk=round(order_risk_score, 1),
            inventory_health=round(inventory_health, 1)
        )

        breakdown = {
            "operational_machines": f"{operational_count}/{len(self.factory_state.machines)}",
            "active_risks_count": active_risks_count,
            "schedule_active_tasks": f"{unaffected_tasks}/{total_tasks}",
            "active_events_count": len([e for e in self.factory_state.active_events if e.get("status") == "active"])
        }

        return PulseHealth(
            pulse_score=pulse_score,
            status=status,
            components=components,
            breakdown=breakdown
        )
