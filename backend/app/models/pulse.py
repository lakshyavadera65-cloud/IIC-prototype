from typing import Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class PulseComponents(BaseModel):
    machine_health: float = Field(description="Weight: 30%")
    schedule_stability: float = Field(description="Weight: 30%")
    order_risk: float = Field(description="Weight: 25%")
    inventory_health: float = Field(description="Weight: 15%")


class PulseHealth(BaseModel):
    pulse_score: float = Field(description="Score between 0 and 100")
    status: str = Field(description="STABLE, DEGRADED, CRITICAL ATTENTION")
    components: PulseComponents
    breakdown: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
