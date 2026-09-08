from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class PlanAction(BaseModel):
    action_type: str = Field(description="reroute_task, postpone_task, enable_overtime, material_reallocation")
    resource_from: Optional[str] = None
    resource_to: Optional[str] = None
    order_id: Optional[str] = None
    task_id: Optional[str] = None
    description: str = ""
    parameters: Dict[str, Any] = Field(default_factory=dict)


class RecoveryPlan(BaseModel):
    plan_id: str
    name: str
    description: str
    actions: List[PlanAction] = Field(default_factory=list)
    affected_orders: List[str] = Field(default_factory=list)
    estimated_cost: float = 0.0
    feasible: bool = True
    advantages: List[str] = Field(default_factory=list)
    disadvantages: List[str] = Field(default_factory=list)
    strategy_type: str = "reroute"
