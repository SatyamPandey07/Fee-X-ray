import logging
import contextvars
from pythonjsonlogger import jsonlogger

request_id_context = contextvars.ContextVar("request_id", default="-")

class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = request_id_context.get()
        record.service = "analysis-engine"
        return True

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    logHandler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(name)s %(message)s %(request_id)s %(service)s')
    logHandler.setFormatter(formatter)
    logger.addHandler(logHandler)
    logger.addFilter(RequestIdFilter())
    return logger

logger = logging.getLogger(__name__)
