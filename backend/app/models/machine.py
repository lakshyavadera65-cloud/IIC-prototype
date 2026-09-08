from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field, field_validator


class MachineStatus(str, Enum):
    OPERATIONAL = "operational"
    IDLE = "idle"
    MAINTENANCE = "maintenance"
    OFFLINE = "offline"
    FAILED = "failed"
    DEGRADED = "degraded"


class MachineCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="Machine display name, e.g. 'CNC-03' or 'Precision CNC Machine 03'")
    id: Optional[str] = Field(None, min_length=2, max_length=20, description="Unique Machine ID, e.g. 'CNC-03'. If omitted, derived from name.")
    type: str = Field(..., min_length=2, max_length=50, description="Machine type, e.g. 'CNC Machine', 'Lathe', 'Milling Machine'")
    department: Optional[str] = Field("Precision Machining", description="Department / Workstation, e.g. 'Precision Machining', 'Assembly', 'Finishing'")
    status: MachineStatus = Field(MachineStatus.OPERATIONAL, description="Initial machine operational status")
    capacity_per_hour: float = Field(..., gt=0, description="Production throughput in units per hour")
    capabilities: List[str] = Field(default_factory=list, min_length=1, description="List of supported operations / capabilities")
    supported_products: Optional[List[str]] = Field(None, description="Products this machine can process (e.g. ['AX-100', 'AX-200'])")
    utilization: float = Field(75.0, ge=0.0, le=100.0, description="Current utilization percentage (0-100)")
    overtime_available: bool = Field(True, description="Whether overtime shifts are permitted")
    overtime_cost_per_hour: float = Field(2000.0, ge=0.0, description="Overtime hourly cost in currency units")
    notes: Optional[str] = Field(None, max_length=300, description="Optional operator / engineering notes")
    strategic_importance: Optional[str] = Field("high", description="Importance rating: critical, high, medium, low")

    @field_validator("id", mode="before")
    def validate_or_derive_id(cls, v, info):
        if v and v.strip():
            return v.strip().upper()
        # Fallback to uppercase name slug if not given
        name = info.data.get("name", "") if hasattr(info, "data") else ""
        if name:
            slug = name.strip().replace(" ", "-").upper()
            return slug[:15]
        return "MACH-NEW"

    @field_validator("capabilities")
    def validate_capabilities(cls, v):
        if not v or len(v) == 0:
            raise ValueError("At least one capability must be specified.")
        return [c.strip() for c in v if c and c.strip()]


class MachineUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    type: Optional[str] = Field(None, min_length=2, max_length=50)
    department: Optional[str] = None
    status: Optional[MachineStatus] = None
    capacity_per_hour: Optional[float] = Field(None, gt=0)
    capabilities: Optional[List[str]] = None
    supported_products: Optional[List[str]] = None
    utilization: Optional[float] = Field(None, ge=0.0, le=100.0)
    overtime_available: Optional[bool] = None
    overtime_cost_per_hour: Optional[float] = Field(None, ge=0.0)
    notes: Optional[str] = None
    strategic_importance: Optional[str] = None


class MachineResponse(BaseModel):
    id: str
    name: str
    type: str
    department: Optional[str] = "Precision Machining"
    status: str
    capacity_per_hour: float
    capabilities: List[str] = Field(default_factory=list)
    supported_products: List[str] = Field(default_factory=list)
    utilization: float = 75.0
    current_utilization: Optional[float] = 75.0
    overtime_available: bool = True
    overtime_cost_per_hour: float = 2000.0
    notes: Optional[str] = None
    strategic_importance: str = "high"
    is_custom: bool = False
