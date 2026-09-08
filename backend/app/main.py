from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.factory import router as factory_router
from app.api.events import router as events_router
from app.api.intelligence import router as intelligence_router
from app.api.recovery import router as recovery_router
from app.api.chat import router as chat_router
from app.api.import_data import router as import_router


app = FastAPI(
    title="PULSE Factory Intelligence API",
    description="Multi-Agent Factory Operations Intelligence System",
    version="1.0.0"
)

# Configure CORS for local development and frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(factory_router)
app.include_router(events_router)
app.include_router(intelligence_router)
app.include_router(recovery_router)
app.include_router(chat_router)
app.include_router(import_router)


@app.get("/")
def root():
    return {
        "message": "PULSE Backend is running",
        "system": "PULSE Factory Operations Intelligence",
        "status": "online"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "PULSE Backend"
    }