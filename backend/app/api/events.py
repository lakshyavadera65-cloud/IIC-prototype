from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Union
from app.core.factory_state import factory_state
from app.agents.orchestrator import AgentOrchestrator
from app.models.events import EventCreateRequest

router = APIRouter(
    prefix="/api",
    tags=["Events & Demo"]
)

orchestrator = AgentOrchestrator(factory_state)


@router.post("/events")
def create_event(payload: Union[EventCreateRequest, Dict[str, Any]]):
    """Ingest a raw alert string or structured event dictionary and execute full multi-agent orchestration."""
    try:
        if isinstance(payload, EventCreateRequest):
            if payload.message:
                raw_input = payload.message
            else:
                raw_input = payload.model_dump(exclude_unset=True)
        else:
            raw_input = payload

        result = orchestrator.process_event(raw_input)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/demo/trigger/{scenario_id}")
def trigger_demo_scenario(scenario_id: str):
    """Trigger predefined demo scenarios grounded in real-world downtime categories."""
    normalized_id = scenario_id.lower().replace("_", "-")

    # Reset to clean state first so demo is clean and repeatable
    factory_state.reset()

    if normalized_id in ("scenario-a", "a", "cnc-02-failure"):
        return orchestrator.trigger_scenario_a()
    elif normalized_id in ("scenario-b", "b", "aluminum-delay", "supplier-delay"):
        return orchestrator.trigger_scenario_b()
    elif normalized_id in ("scenario-c", "c", "fastener-shortage", "material-shortage"):
        return orchestrator.trigger_scenario_c()
    elif normalized_id in ("scenario-d", "d", "mes-sync-failure", "it-software"):
        return orchestrator.trigger_scenario_d()
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Scenario '{scenario_id}' not found. Supported scenarios: 'scenario-a', 'scenario-b', 'scenario-c', 'scenario-d'"
        )


@router.get("/alerts")
def get_alerts():
    """Return all active operational alerts."""
    return factory_state.alerts
