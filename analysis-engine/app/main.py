from datetime import datetime, timezone
from fastapi import FastAPI

app = FastAPI(
    title="Fee X-ray Analysis Engine",
    description="Minimal FastAPI scaffolding for Analysis Engine",
    version="0.1.0"
)

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "analysis-engine",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
