from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class Risk(BaseModel):
    order_id: str
    priority: str
    risk_level: str  # low, medium, high, critical
    reason: str
    deadline_hour: Optional[int] = None
    projected_delay_hours: Optional[float] = None


class CapacityImpact(BaseModel):
    lost_capacity_units: float
    alternative_machine_id: Optional[str] = None
    alternative_capacity_available: float = 0.0
    capacity_utilization_before: float = 0.0
    capacity_utilization_after: float = 0.0


class DownstreamImpact(BaseModel):
    resource: str
    impact: str
    affected_orders: List[str] = Field(default_factory=list)
    reason: str = ""


class ImpactResult(BaseModel):
    event_id: str
    event_type: str
    entity_id: str
    duration_hours: float
    affected_resources: List[str] = Field(default_factory=list)
    affected_orders: List[Dict[str, Any]] = Field(default_factory=list)
    affected_order_ids: List[str] = Field(default_factory=list)
    capacity_impact: CapacityImpact
    downstream_impact: List[DownstreamImpact] = Field(default_factory=list)
    impact_chain: List[Dict[str, Any]] = Field(default_factory=list)
    risks: List[Risk] = Field(default_factory=list)
