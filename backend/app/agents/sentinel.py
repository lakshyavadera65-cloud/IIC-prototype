import re
from typing import Dict, Any, Union
from datetime import datetime
from app.models.events import FactoryEvent


class SentinelAgent:
    """Sentinel Agent converts raw operational messages and telemetries into structured factory events."""

    def __init__(self, factory_state=None):
        self.factory_state = factory_state

    def parse_event(self, raw_input: Union[str, Dict[str, Any]], event_id: str = None) -> Dict[str, Any]:
        """Deterministic rule-based parser for raw alert messages or direct dicts."""
        if not event_id:
            event_id = f"EVT-{datetime.utcnow().strftime('%M%S')}"

        if isinstance(raw_input, dict):
            # Already structured input
            return FactoryEvent(
                event_id=raw_input.get("event_id", event_id),
                event_type=raw_input.get("event_type", "machine_failure"),
                entity_id=raw_input.get("entity_id", "CNC-02"),
                duration_hours=float(raw_input.get("duration_hours", 6.0)),
                severity=raw_input.get("severity", "critical"),
                source=raw_input.get("source", "sentinel"),
                details=raw_input.get("details", {})
            ).model_dump()

        text = str(raw_input).strip()
        lower = text.lower()

        # 1. Detect Machine IDs
        machine_pattern = r"\b(CNC-01|CNC-02|FIN-01|ASM-A|ASM-B|QC-01|PK-01)\b"
        machine_match = re.search(machine_pattern, text, re.IGNORECASE)

        # 2. Detect Material IDs
        material_pattern = r"\b(M-AL|M-FAST|M-SEAL)\b"
        material_match = re.search(material_pattern, text, re.IGNORECASE)

        # 3. Detect Order IDs
        order_pattern = r"\b(ORD-\d{3})\b"
        order_match = re.search(order_pattern, text, re.IGNORECASE)

        # 4. Detect Duration in hours
        duration_pattern = r"(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)"
        duration_match = re.search(duration_pattern, text, re.IGNORECASE)
        duration_hours = float(duration_match.group(1)) if duration_match else 6.0

        # 5. Detect Severity
        severity = "high"
        if any(w in lower for w in ["critical", "urgent", "severe", "emergency", "immediate"]):
            severity = "critical"
        elif any(w in lower for w in ["minor", "low", "slight"]):
            severity = "low"
        elif any(w in lower for w in ["moderate", "medium"]):
            severity = "medium"

        # 6. Detect Event Type
        event_type = "machine_failure"
        entity_id = "CNC-02"

        if "supplier" in lower or "shipment" in lower or "delivery" in lower or ("delay" in lower and material_match):
            event_type = "supplier_delay"
            entity_id = material_match.group(1).upper() if material_match else "M-AL"
        elif "shortage" in lower or "depleted" in lower or "stock" in lower:
            event_type = "material_shortage"
            entity_id = material_match.group(1).upper() if material_match else "M-SEAL"
        elif "emergency order" in lower or "rush order" in lower or ("order" in lower and order_match and "fail" not in lower):
            event_type = "emergency_order"
            entity_id = order_match.group(1).upper() if order_match else "ORD-999"
        else:
            # Default to machine failure
            event_type = "machine_failure"
            entity_id = machine_match.group(1).upper() if machine_match else "CNC-02"

        event = FactoryEvent(
            event_id=event_id,
            event_type=event_type,
            entity_id=entity_id,
            duration_hours=duration_hours,
            severity=severity,
            source="sentinel",
            details={"raw_message": text}
        )

        return event.model_dump()
