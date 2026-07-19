from datetime import datetime, timezone
from fastapi import FastAPI
from app.routers.plaid import router as plaid_router
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.limiter import limiter
from app.logger import setup_logging, request_id_context
import sentry_sdk
import os
import uuid
from prometheus_fastapi_instrumentator import Instrumentator

sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )

setup_logging()

app = FastAPI(
    title="Fee X-ray Analysis Engine",
    description="Minimal FastAPI scaffolding for Analysis Engine",
    version="0.1.0"
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

Instrumentator().instrument(app).expose(app)

@app.middleware("http")
async def request_id_middleware(request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request_id_context.set(request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

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
