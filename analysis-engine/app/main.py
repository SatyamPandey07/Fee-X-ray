from datetime import datetime, timezone
from fastapi import FastAPI
from app.routers.plaid import router as plaid_router

app = FastAPI(
    title="Fee X-ray Analysis Engine",
    description="Minimal FastAPI scaffolding for Analysis Engine",
    version="0.1.0"
)

app.include_router(plaid_router)

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "analysis-engine",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
