from datetime import datetime, timezone
from fastapi import FastAPI
from app.routers.plaid import router as plaid_router

app = FastAPI(
    title="Fee X-ray Analysis Engine",
    description="Minimal FastAPI scaffolding for Analysis Engine",
    version="0.1.0"
)

app.include_router(plaid_router)

from app.messaging import start_messaging_consumer

@app.on_event("startup")
def startup_event():
    start_messaging_consumer()

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "analysis-engine",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
