from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class AgentLogEntry(BaseModel):
    agent: str = Field(description="Sentinel, Impact, Strategist, Oracle, Orchestrator")
    status: str = Field(description="started, running, completed, warning, failed")
    message: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    details: Optional[Dict[str, Any]] = None


class OrchestratorResult(BaseModel):
    event_id: str
    event: Dict[str, Any]
    agent_logs: List[AgentLogEntry] = Field(default_factory=list)
    impact: Dict[str, Any] = Field(default_factory=dict)
    recovery_plans: List[Dict[str, Any]] = Field(default_factory=list)
    simulation_results: List[Dict[str, Any]] = Field(default_factory=list)
    recommended_plan: Dict[str, Any] = Field(default_factory=dict)
    pulse_before: Dict[str, Any] = Field(default_factory=dict)
    pulse_after: Dict[str, Any] = Field(default_factory=dict)
