from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class SimulationResult(BaseModel):
    plan_id: str
    plan_name: str = ""
    delay_hours: float = 0.0
    estimated_cost: float = 0.0
    orders_saved: int = 0
    deadline_violations: int = 0
    machine_utilization: Dict[str, float] = Field(default_factory=dict)
    idle_time_hours: float = 0.0
    metrics: Dict[str, Any] = Field(default_factory=dict)
    score: float = 0.0
    reasoning: List[str] = Field(default_factory=list)
