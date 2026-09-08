from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


class FactoryEvent(BaseModel):
    event_id: str
    event_type: str = Field(description="machine_failure, supplier_delay, material_shortage, emergency_order")
    entity_id: str = Field(description="Target machine_id, material_id, or order_id")
    duration_hours: float = 0.0
    severity: str = "medium"  # low, medium, high, critical
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
    details: Optional[Dict[str, Any]] = None


class Alert(BaseModel):
    alert_id: str
    event_id: str
    severity: str
    title: str
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    entity_id: str
    active: bool = True
