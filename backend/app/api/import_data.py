from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query, Response, status
from typing import Optional

from app.core.factory_state import factory_state
from app.models.import_model import (
    ImportType,
    DuplicateStrategy,
    ImportPreviewResponse,
    ImportConfirmRequest,
    ImportConfirmResponse,
)
from app.services.import_parser import FactoryImportParser
from app.engines.pulse_engine import PulseEngine

router = APIRouter(
    prefix="/api/import",
    tags=["Import Factory Data"]
)

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit


@router.post("/preview", response_model=ImportPreviewResponse)
async def preview_import(
    file: UploadFile = File(..., description="CSV or Excel file containing factory data"),
    import_type: ImportType = Form(ImportType.MACHINES, description="Scope of data to import")
):
    """
    Parse and validate uploaded factory data file without permanently applying changes.
    Returns preview summary, validation errors, and detected sheets.
    """
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file selected for upload.")

    filename_lower = file.filename.lower()
    if not (filename_lower.endswith(".csv") or filename_lower.endswith(".xlsx") or filename_lower.endswith(".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a CSV or Excel file (.csv, .xlsx)."
        )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The uploaded file is empty.")

        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
            )

        parser = FactoryImportParser(factory_state)
        preview_resp = parser.generate_preview(content, file.filename, import_type)
        return preview_resp

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to parse file: {str(e)}")


@router.post("/confirm", response_model=ImportConfirmResponse)
def confirm_import(request: ImportConfirmRequest):
    """
    Commit validated import data into the live Factory Digital Twin.
    Updates factory state, persists custom entities, and recalculates Factory Pulse.
    """
    try:
        parser_data = request.data or {}
        strategy = request.duplicate_strategy.value

        m_add, m_up, m_sk = 0, 0, 0
        o_add, o_up, o_sk = 0, 0, 0
        s_add, s_up, s_sk = 0, 0, 0

        if request.import_type == ImportType.MACHINES:
            machines = parser_data.get("machines", [])
            if not machines:
                raise ValueError("No valid machine records provided for import.")
            m_add, m_up, m_sk = factory_state.import_machines(machines, strategy=strategy)

        elif request.import_type == ImportType.ORDERS:
            orders = parser_data.get("orders", [])
            if not orders:
                raise ValueError("No valid order records provided for import.")
            o_add, o_up, o_sk = factory_state.import_orders(orders, strategy=strategy)

        elif request.import_type == ImportType.SCHEDULE:
            schedule = parser_data.get("schedule", [])
            if not schedule:
                raise ValueError("No valid schedule tasks provided for import.")
            s_add, s_up, s_sk = factory_state.import_schedule(schedule, strategy=strategy)

        elif request.import_type == ImportType.COMPLETE_FACTORY:
            res = factory_state.import_complete_dataset(
                machines=parser_data.get("machines", []),
                orders=parser_data.get("orders", []),
                schedule=parser_data.get("schedule", []),
                strategy=strategy
            )
            m_add, m_up, m_sk = res["machines"]["added"], res["machines"]["updated"], res["machines"]["skipped"]
            o_add, o_up, o_sk = res["orders"]["added"], res["orders"]["updated"], res["orders"]["skipped"]
            s_add, s_up, s_sk = res["schedule"]["added"], res["schedule"]["updated"], res["schedule"]["skipped"]

        # Recalculate Factory Pulse with new state
        pulse = PulseEngine(factory_state).calculate_pulse()
        pulse_score = pulse.pulse_score
        pulse_status = pulse.status

        msg_parts = []
        if m_add or m_up:
            msg_parts.append(f"{m_add} machines added ({m_up} updated)")
        if o_add or o_up:
            msg_parts.append(f"{o_add} orders added ({o_up} updated)")
        if s_add or s_up:
            msg_parts.append(f"{s_add} schedule tasks added ({s_up} updated)")

        summary_msg = f"Import successful: {', '.join(msg_parts) if msg_parts else 'No new entities added'}."

        return ImportConfirmResponse(
            status="success",
            message=summary_msg,
            import_type=request.import_type.value,
            strategy_used=strategy,
            machines_added=m_add,
            machines_updated=m_up,
            machines_skipped=m_sk,
            orders_added=o_add,
            orders_updated=o_up,
            orders_skipped=o_sk,
            schedule_added=s_add,
            schedule_updated=s_up,
            schedule_skipped=s_sk,
            pulse_score=pulse_score,
            pulse_status=pulse_status,
            summary={
                "total_machines": len(factory_state.machines),
                "total_orders": len(factory_state.orders),
                "total_schedule_tasks": len(factory_state.schedule),
                "factory_pulse": pulse_score
            }
        )

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/templates/{import_type}")
def download_template(
    import_type: str,
    format: str = Query("csv", pattern="^(csv|xlsx)$", description="File format ('csv' or 'xlsx')")
):
    """
    Download pre-formatted CSV or Excel templates with standard headers and sample data.
    """
    valid_types = {"machines", "orders", "schedule", "complete_factory"}
    clean_type = import_type.lower().strip()
    if clean_type not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid template type '{import_type}'. Must be one of: {', '.join(sorted(list(valid_types)))}"
        )

    try:
        content_bytes, media_type, filename = FactoryImportParser.get_template(clean_type, format.lower())
        return Response(
            content=content_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate template: {str(e)}")
