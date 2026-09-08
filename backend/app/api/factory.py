from fastapi import APIRouter, HTTPException, Query, status
from app.core.factory_state import factory_state
from app.models.machine import MachineCreate, MachineUpdate, MachineResponse


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


@router.post("/machines", status_code=status.HTTP_201_CREATED)
def create_machine(machine: MachineCreate):
    """Add a new workstation / machine to the factory and persist it."""
    try:
        data = machine.model_dump()
        new_machine = factory_state.add_machine(data)
        return {
            "status": "success",
            "message": f"Workstation '{new_machine['id']}' added successfully.",
            "machine": new_machine
        }
    except ValueError as e:
        err_msg = str(e)
        if "already exists" in err_msg.lower():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=err_msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.put("/machines/{machine_id}")
def update_machine(machine_id: str, updates: MachineUpdate):
    """Update workstation configuration or operational status."""
    try:
        updated = factory_state.update_machine(machine_id, updates.model_dump(mode="json", exclude_unset=True))
        return {
            "status": "success",
            "message": f"Workstation '{machine_id}' updated successfully.",
            "machine": updated
        }
    except ValueError as e:
        err_msg = str(e)
        if "not found" in err_msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=err_msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/machines/{machine_id}")
def delete_machine(machine_id: str):
    """Delete a custom workstation, ensuring it is not scheduled in active tasks."""
    try:
        res = factory_state.delete_machine(machine_id)
        return res
    except ValueError as e:
        err_msg = str(e)
        if "not found" in err_msg.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=err_msg)
        if "scheduled" in err_msg.lower() or "baseline" in err_msg.lower():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=err_msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=err_msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/orders")
def get_orders():
    return factory_state.orders


from app.models.schedule import ScheduleCreate


@router.get("/schedule")
def get_schedule():
    return factory_state.schedule


@router.post("/schedule", status_code=status.HTTP_201_CREATED)
def create_schedule_slot(schedule_in: ScheduleCreate):
    """Add a new task dispatch to the factory production schedule."""
    try:
        new_slot = factory_state.add_schedule_slot(schedule_in.model_dump())
        return {
            "status": "success",
            "message": f"Task '{new_slot['id']}' successfully scheduled on workstation '{new_slot['resource_id']}'.",
            "schedule_slot": new_slot
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.delete("/schedule/{slot_id}")
def delete_schedule_slot(slot_id: str):
    """Delete a custom schedule task slot."""
    try:
        return factory_state.delete_schedule_slot(slot_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/reset")
def reset_factory(hard: bool = Query(False, description="If true, wipes custom machines back to pure 7-machine baseline")):
    """Reset the factory back to its initial healthy state."""
    factory_state.reset(hard_reset=hard)
    return {
        "status": "success",
        "message": "Factory state reset to original healthy baseline." if hard else "Factory operational state reset (custom infrastructure preserved)."
    }