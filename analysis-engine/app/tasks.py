import os
import logging
from celery import Celery
from app.database import SessionLocal
from app.rules.engine import run_all_rules

logger = logging.getLogger(__name__)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "fee_xray",
    broker=REDIS_URL,
    backend=REDIS_URL
)

# Celery task configuration overrides
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True
)

@celery_app.task(name="app.tasks.analyze_org_fees")
def analyze_org_fees(org_id: str) -> int:
    """
    Asynchronous Celery task that executes the complete rules engine analysis
    for an organization, returning the count of detected fee savings opportunities.
    """
    logger.info(f"Starting async fee analysis for Organization UUID: {org_id}")
    
    db = SessionLocal()
    try:
        findings = run_all_rules(db, org_id)
        findings_count = len(findings)
        logger.info(f"Completed analysis for org {org_id}. Found {findings_count} saving opportunities.")
        return findings_count
    except Exception as e:
        logger.error(f"Error during async fee analysis task for org {org_id}: {e}", exc_info=True)
        raise e
    finally:
        db.close()
