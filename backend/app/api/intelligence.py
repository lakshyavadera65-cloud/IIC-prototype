from fastapi import APIRouter, HTTPException
from app.core.factory_state import factory_state
from app.engines.impact_engine import ImpactEngine
from app.engines.pulse_engine import PulseEngine

router = APIRouter(
    prefix="/api",
    tags=["Intelligence"]
)

impact_engine = ImpactEngine(factory_state)
pulse_engine = PulseEngine(factory_state)


@router.get("/impact/{event_id}")
def get_impact_analysis(event_id: str):
    """Retrieve or re-compute impact analysis for a specific event."""
    # Check if precomputed in agent results
    agent_res = factory_state.get_agent_results(event_id)
    if agent_res and "impact" in agent_res:
        return agent_res["impact"]

    # Check active events
    for event in factory_state.active_events:
        if event.get("event_id") == event_id:
            return impact_engine.analyze_event(event)

    raise HTTPException(status_code=404, detail=f"Event '{event_id}' not found")


@router.get("/agents/{event_id}")
def get_agent_execution_log(event_id: str):
    """Retrieve multi-agent execution log and collaboration steps for an event."""
    agent_res = factory_state.get_agent_results(event_id)
    if agent_res:
        return {
            "event_id": event_id,
            "agent_logs": agent_res.get("agent_logs", []),
            "recommended_plan_id": agent_res.get("recommended_plan_id"),
            "reasoning": agent_res.get("reasoning", [])
        }

    raise HTTPException(status_code=404, detail=f"Agent results for event '{event_id}' not found")


@router.get("/pulse")
def get_factory_pulse():
    """Retrieve live Factory Pulse health score (0-100) and explainable component breakdown."""
    pulse = pulse_engine.calculate_pulse()
    return pulse.model_dump()
