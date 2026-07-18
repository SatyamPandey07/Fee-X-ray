import pytest
import uuid
from decimal import Decimal
from datetime import datetime, date
from app.models import Transaction, PlaidConnection
from app.rules.processor_rate import detect_processor_rate_fees
from app.rules.zombie_subscription import detect_zombie_subscriptions
from app.rules.unwaived_bank_fee import detect_unwaived_bank_fees
from app.rules.chargeback import detect_undisputed_chargebacks
from app.rules.engine import run_all_rules
from app.database import Base, engine
from sqlalchemy.orm import sessionmaker

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.query(Transaction).delete()
        session.query(PlaidConnection).delete()
        session.commit()
        session.close()

def create_mock_tx(name: str, amount: float, category: str = "Service", is_pending: bool = False, conn_id: uuid.UUID = None) -> Transaction:
    return Transaction(
        id=f"tx_test_{uuid.uuid4().hex[:8]}",
        org_id=uuid.uuid4(),
        plaid_connection_id=conn_id or uuid.uuid4(),
        amount=Decimal(str(amount)),
        date=date(2026, 7, 18),
        name=name,
        category=category,
        is_pending=is_pending
    )

def test_processor_rate_benchmarking():
    org_id = str(uuid.uuid4())
    # Exceeding 3.5% threshold: total_sales = 100, fees = 5.0 (5%)
    txs = [
        create_mock_tx("Stripe Payout", 100.0),
        create_mock_tx("Stripe Fee", 5.0)
    ]
    finding = detect_processor_rate_fees(txs, org_id)
    assert finding is not None
    assert finding["category"] == "processor_rate"
    assert "averaging 5.00%" in finding["explanation"]
    assert finding["dollar_impact"] == 2.5 # sales * (5% - 2.5%) = 2.5

    # Safe range under threshold: sales = 100, fees = 2.5 (2.5%)
    txs_safe = [
        create_mock_tx("Stripe Payout", 100.0),
        create_mock_tx("Stripe Fee", 2.5)
    ]
    finding_safe = detect_processor_rate_fees(txs_safe, org_id)
    assert finding_safe is None

def test_zombie_subscription_detection():
    org_id = str(uuid.uuid4())
    # 2 identical recurring Zoom software charges representing a zombie subscription
    txs = [
        create_mock_tx("Zoom.us subscription", 14.99, "SaaS"),
        create_mock_tx("Zoom.us subscription", 14.99, "SaaS")
    ]
    findings = detect_zombie_subscriptions(txs, org_id)
    assert len(findings) == 1
    assert findings[0]["category"] == "zombie_subscription"
    assert findings[0]["dollar_impact"] == pytest.approx(14.99 * 12)

def test_unwaived_bank_fee_detection():
    org_id = str(uuid.uuid4())
    txs = [
        create_mock_tx("Overdraft Fee", 35.0, "Service Charge"),
        create_mock_tx("Monthly Service Fee", 12.0, "Service Charge")
    ]
    finding = detect_unwaived_bank_fees(txs, org_id)
    assert finding is not None
    assert finding["category"] == "unwaived_bank_fee"
    assert finding["dollar_impact"] == 47.0

def test_undisputed_chargeback_detection():
    org_id = str(uuid.uuid4())
    # Chargeback without a corresponding won/reversal dispute event
    txs = [
        create_mock_tx("Customer Dispute Chargeback", 150.00)
    ]
    findings = detect_undisputed_chargebacks(txs, org_id)
    assert len(findings) == 1
    assert findings[0]["category"] == "chargeback"
    assert findings[0]["dollar_impact"] == 150.00
