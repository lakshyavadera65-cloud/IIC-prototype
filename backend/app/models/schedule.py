from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ScheduleCreate(BaseModel):
    id: Optional[str] = Field(None, description="Optional custom schedule ID (e.g. 'SCH-101'). If omitted, auto-generated.")
    resource_id: str = Field(..., min_length=2, max_length=50, description="Machine/workstation ID, e.g. 'CNC-01'")
    order_id: str = Field(..., min_length=2, max_length=50, description="Production order ID, e.g. 'ORD-101'")
    operation: str = Field(..., min_length=2, max_length=100, description="Operation or task name, e.g. 'CNC_MACHINING' or '5-Axis Precision Milling'")
    start_hour: float = Field(0.0, ge=0.0, description="Scheduled start hour relative to shift start (0-24)")
    end_hour: Optional[float] = Field(None, ge=0.0, description="Scheduled completion hour")
    duration_hours: Optional[float] = Field(2.0, gt=0.0, le=24.0, description="Task duration in hours")
    status: Optional[str] = Field("scheduled", description="Initial status: scheduled, running, upcoming, urgent")
    operator: Optional[str] = Field("Tech-1", description="Assigned operator or technician")
    notes: Optional[str] = Field(None, max_length=300, description="Optional notes or setup instructions")

    @field_validator("id", mode="before")
    def clean_id(cls, v):
        if v and str(v).strip():
            return str(v).strip().upper()
        return None

    @field_validator("resource_id", mode="before")
    def clean_resource(cls, v):
        if not v or not str(v).strip():
            raise ValueError("Machine / Resource ID is required.")
        return str(v).strip().upper()

    @field_validator("order_id", mode="before")
    def clean_order(cls, v):
        if not v or not str(v).strip():
            raise ValueError("Order ID is required.")
        return str(v).strip().upper()
