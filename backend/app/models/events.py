from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


# Industry downtime benchmarks based on empirical manufacturing research
ROOT_CAUSE_BENCHMARKS = {
    "equipment_failure": {
        "label": "Equipment Failure",
        "share_pct": "42–45%",
        "stoppage_share": "~80% of factory stoppages trace back to equipment failure (bearings, motors, hydraulics, drives)",
        "early_signature": "~80% exhibit detectable early signatures (vibration, heat, ultrasonic wear) weeks before failure.",
        "color": "rose"
    },
    "human_error": {
        "label": "Human Error",
        "share_pct": "~23%",
        "stoppage_share": "Operator misconfiguration, skipped maintenance checklist, parameter entry error, bad startup/shutdown.",
        "early_signature": "Often preceded by shift transitions, unverified manual overrides, or uncalibrated tooling changes.",
        "color": "amber"
    },
    "process_quality": {
        "label": "Process / Quality Deviation",
        "share_pct": "~15%",
        "stoppage_share": "Raw material batch variation, progressive tooling wear, thermal tolerance drift, scrap rate spikes.",
        "early_signature": "Detectable via in-line CMM inspection, SPC control limit violations, and surface roughness sensors.",
        "color": "yellow"
    },
    "supply_chain": {
        "label": "Supply Chain & Logistics",
        "share_pct": "~12%",
        "stoppage_share": "Late supplier deliveries, freight bottlenecks, missing components, inventory stockouts.",
        "early_signature": "Detectable via supplier ASN tracking, inbound freight status delays, and buffer depletion trends.",
        "color": "blue"
    },
    "it_software": {
        "label": "IT / Software / Network",
        "share_pct": "~8% (Rapidly Growing)",
        "stoppage_share": "MES/ERP sync failure, sensor telemetry packet loss, SCADA network timeouts, stale dispatch data.",
        "early_signature": "Detectable via heartbeat timeouts, database replication lag, and telemetry packet drop spikes.",
        "color": "purple"
    }
}

INDUSTRY_GLOBAL_BENCHMARK = (
    "500 largest global manufacturers lose ~$1.4T/year to unplanned downtime (~11% of revenue); "
    "average factory loses ~800 hours/year to preventable breakdowns."
)


class FactoryEvent(BaseModel):
    event_id: str
    event_type: str = Field(description="machine_failure, supplier_delay, material_shortage, emergency_order")
    entity_id: str = Field(description="Target machine_id, material_id, or order_id")
    duration_hours: float = 0.0
    severity: str = "medium"  # low, medium, high, critical
    root_cause_category: str = Field(
        default="equipment_failure",
        description="equipment_failure (~42-45%), human_error (~23%), process_quality (~15%), supply_chain (~12%), it_software (~8%)"
    )
    source: str = "sentinel"
    status: str = "active"  # active, mitigated, resolved
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    details: Dict[str, Any] = Field(default_factory=dict)


class EventCreateRequest(BaseModel):
    message: Optional[str] = None
    event_id: Optional[str] = None
    event_type: Optional[str] = None
    entity_id: Optional[str] = None
    duration_hours: Optional[float] = None
    severity: Optional[str] = None
    root_cause_category: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class Alert(BaseModel):
    alert_id: str
    event_id: str
    severity: str
    title: str
    message: str
    root_cause_category: Optional[str] = "equipment_failure"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    entity_id: str
    active: bool = True

