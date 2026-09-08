from fastapi import APIRouter, HTTPException
from app.core.factory_state import factory_state

router = APIRouter(
    prefix="/api/recovery",
    tags=["Recovery"]
)


@router.get("/{event_id}")
def get_recovery_recommendations(event_id: str):
    """Retrieve evaluated recovery plans, simulation metrics, and recommended plan for an event."""
    agent_res = factory_state.get_agent_results(event_id)
    if agent_res:
        return {
            "event_id": event_id,
            "plans": agent_res.get("recovery_plans", []),
            "simulation_results": agent_res.get("simulation_results", []),
            "recommended_plan": agent_res.get("recommended_plan", {}),
            "recommended_plan_id": agent_res.get("recommended_plan_id"),
            "reasoning": agent_res.get("reasoning", []),
            "comparison_summary": agent_res.get("comparison_summary", {})
        }

    # Fallback to stored recovery plans if available
    if factory_state.recovery_plans:
        return {
            "event_id": event_id,
            "plans": factory_state.recovery_plans,
            "recommended_plan_id": "PLAN-B"
        }

    raise HTTPException(status_code=404, detail=f"No recovery plans found for event '{event_id}'")


@router.post("/{plan_id}/execute")
def execute_recovery_plan(plan_id: str):
    """Execute a recovery plan, update factory schedule/state, and return the refreshed pulse."""
    try:
        # Normalize plan ID (e.g. plan-b, PLAN-B)
        normalized_plan_id = plan_id.upper()
        result = factory_state.apply_recovery_plan(normalized_plan_id)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
