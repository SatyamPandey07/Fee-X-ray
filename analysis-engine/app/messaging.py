import os
import json
import time
import logging
import threading
import pika
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.rules.engine import run_all_rules

logger = logging.getLogger(__name__)

RABBITMQ_URL = os.getenv("RABBITMQ_URL", "amqp://feexray:changeme@localhost:5672/")

EXCHANGE = "analysis.exchange"
REQUEST_QUEUE = "analysis.request.queue"
REQUEST_KEY = "analysis.request.key"
RESPONSE_QUEUE = "analysis.response.queue"
RESPONSE_KEY = "analysis.response.key"

def handle_message(ch, method, properties, body):
    logger.info(f"Received request message from RabbitMQ: {body}")
    db: Session = SessionLocal()
    try:
        data = json.loads(body)
        job_id = data.get("jobId")
        org_id = data.get("orgId")
        
        if not job_id or not org_id:
            logger.error("Invalid message structure. Missing jobId or orgId.")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return
            
        # Run rules engine
        findings = run_all_rules(db, org_id)
        
        total_impact = sum(f.dollar_impact for f in findings)
        findings_count = len(findings)
        
        summary = f"Analysis completed. Detected {findings_count} saving opportunities with an estimated annual impact of ${total_impact:.2f}."
        
        response_payload = {
            "jobId": job_id,
            "orgId": org_id,
            "status": "COMPLETED",
            "summary": summary
        }
        
        ch.basic_publish(
            exchange=EXCHANGE,
            routing_key=RESPONSE_KEY,
            body=json.dumps(response_payload),
            properties=pika.BasicProperties(content_type="application/json")
        )
        logger.info(f"Published completion report back to RabbitMQ for Job: {job_id}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        logger.error(f"Error handling message: {e}", exc_info=True)
        try:
            data = json.loads(body)
            job_id = data.get("jobId")
            org_id = data.get("orgId")
            if job_id and org_id:
                response_payload = {
                    "jobId": job_id,
                    "orgId": org_id,
                    "status": "FAILED",
                    "summary": f"Analysis failed: {str(e)}"
                }
                ch.basic_publish(
                    exchange=EXCHANGE,
                    routing_key=RESPONSE_KEY,
                    body=json.dumps(response_payload),
                    properties=pika.BasicProperties(content_type="application/json")
                )
        except Exception as pub_ex:
            logger.error(f"Failed to publish error outcome: {pub_ex}")
            
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
    finally:
        db.close()

def run_consumer():
    """Runs the pika blocking consumer loop, handling connection losses gracefully."""
    logger.info("Initializing RabbitMQ consumer thread...")
    while True:
        try:
            params = pika.URLParameters(RABBITMQ_URL)
            connection = pika.BlockingConnection(params)
            channel = connection.channel()
            
            channel.exchange_declare(exchange=EXCHANGE, exchange_type="direct", durable=True)
            channel.queue_declare(queue=REQUEST_QUEUE, durable=True)
            channel.queue_declare(queue=RESPONSE_QUEUE, durable=True)
            channel.queue_bind(queue=REQUEST_QUEUE, exchange=EXCHANGE, routing_key=REQUEST_KEY)
            channel.queue_bind(queue=RESPONSE_QUEUE, exchange=EXCHANGE, routing_key=RESPONSE_KEY)
            
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=REQUEST_QUEUE, on_message_callback=handle_message)
            
            logger.info("RabbitMQ consumer connected and listening...")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError as e:
            logger.warning(f"RabbitMQ connection lost. Retrying in 5 seconds... Error: {e}")
            time.sleep(5)
        except Exception as e:
            logger.error(f"Unexpected RabbitMQ consumer crash. Restarting: {e}", exc_info=True)
            time.sleep(5)

def start_messaging_consumer():
    """Launches the consumer daemon thread."""
    thread = threading.Thread(target=run_consumer, daemon=True)
    thread.start()
