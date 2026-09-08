from fastapi import APIRouter
from app.core.factory_state import factory_state


router = APIRouter(
    prefix="/api/factory",
    tags=["Factory"]
)


@router.get("/state")
def get_factory_state():
    return factory_state.get_state()


@router.get("/machines")
def get_machines():
    return factory_state.machines


@router.get("/orders")
def get_orders():
    return factory_state.orders


@router.get("/schedule")
def get_schedule():
    return factory_state.schedule


@router.post("/reset")
def reset_factory():
    """Reset the factory back to its initial healthy state."""
    factory_state.reset()
    return {
        "status": "success",
        "message": "Factory state reset to original healthy baseline."
    }