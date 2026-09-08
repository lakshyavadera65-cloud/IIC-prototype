from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: Optional[str] = None
    message: Optional[str] = None

    def get_query(self) -> str:
        return (self.query or self.message or "").strip()


class ChatResponse(BaseModel):
    answer: str
    confidence: float = 1.0
    intent: str = "general_query"
    sources: List[str] = Field(default_factory=list)
    data: Optional[Dict[str, Any]] = None
