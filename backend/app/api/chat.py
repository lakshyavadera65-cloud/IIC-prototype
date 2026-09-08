from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Union
from app.core.factory_state import factory_state
from app.engines.chat_engine import GroundedChatEngine
from app.models.chat import ChatRequest, ChatResponse

router = APIRouter(
    prefix="/api",
    tags=["Chat"]
)

chat_engine = GroundedChatEngine(factory_state)


@router.post("/chat", response_model=ChatResponse)
def handle_factory_chat(payload: Union[ChatRequest, Dict[str, Any]]):
    """Grounded Q&A answering operator questions based strictly on factory data and multi-agent outputs."""
    if isinstance(payload, ChatRequest):
        query = payload.get_query()
    elif isinstance(payload, dict):
        query = str(payload.get("query") or payload.get("message") or "").strip()
    else:
        query = str(payload).strip()

    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    response = chat_engine.answer_query(query)
    return response
