from typing import List, Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field


class ImportType(str, Enum):
    MACHINES = "machines"
    ORDERS = "orders"
    SCHEDULE = "schedule"
    COMPLETE_FACTORY = "complete_factory"


class DuplicateStrategy(str, Enum):
    SKIP = "skip"
    UPDATE = "update"
    REJECT = "reject"


class RowValidationError(BaseModel):
    row: int = Field(..., description="Row index in source file (1-indexed, header is row 1)")
    sheet: Optional[str] = Field(None, description="Sheet name if Excel workbook")
    entity_id: Optional[str] = Field(None, description="Entity identifier if parsed (e.g. CNC-03)")
    field: Optional[str] = Field(None, description="Specific field name that triggered the error")
    message: str = Field(..., description="Human-readable explanation of error or conflict")
    severity: str = Field("error", description="'error' (blocks row) or 'warning' (informational)")


class SheetPreview(BaseModel):
    sheet_name: str
    detected: bool = True
    record_count: int = 0
    valid_count: int = 0
    duplicate_count: int = 0
    error_count: int = 0
    warning_count: int = 0
    sample_records: List[Dict[str, Any]] = Field(default_factory=list)


class ImportPreviewResponse(BaseModel):
    status: str = "success"
    import_type: str
    file_name: str
    file_type: str
    total_detected: int = 0
    valid_count: int = 0
    duplicate_count: int = 0
    error_count: int = 0
    warning_count: int = 0
    sheets_detected: Optional[List[SheetPreview]] = None
    sample_records: List[Dict[str, Any]] = Field(default_factory=list)
    errors: List[RowValidationError] = Field(default_factory=list)
    parsed_data: Dict[str, Any] = Field(default_factory=dict)
    can_import: bool = True


class ImportConfirmRequest(BaseModel):
    import_type: ImportType
    duplicate_strategy: DuplicateStrategy = DuplicateStrategy.SKIP
    data: Dict[str, Any] = Field(..., description="Normalized records dictionary containing 'machines', 'orders', and/or 'schedule'")


class ImportConfirmResponse(BaseModel):
    status: str = "success"
    message: str
    import_type: str
    strategy_used: str
    machines_added: int = 0
    machines_updated: int = 0
    machines_skipped: int = 0
    orders_added: int = 0
    orders_updated: int = 0
    orders_skipped: int = 0
    schedule_added: int = 0
    schedule_updated: int = 0
    schedule_skipped: int = 0
    pulse_score: float
    pulse_status: str
    summary: Dict[str, Any] = Field(default_factory=dict)
