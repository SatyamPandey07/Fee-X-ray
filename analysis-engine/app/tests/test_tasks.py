import pytest
import uuid
from decimal import Decimal
from datetime import date
from app.models import Transaction, PlaidConnection, Finding
from app.rules.engine import run_all_rules
from app.tasks import analyze_org_fees
from app.database import Base, engine
from sqlalchemy.orm import sessionmaker

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.query(Finding).delete()
        session.query(Transaction).delete()
        session.query(PlaidConnection).delete()
        session.commit()
        session.close()

def test_rules_engine_aggregation_and_sorting(db_session):
    org_id = uuid.uuid4()
    
    # 1. Setup mock Plaid Connection
    conn = PlaidConnection(
        id=uuid.uuid4(),
        org_id=org_id,
        item_id="item_test_123",
        encrypted_access_token="encrypted_token_123",
        institution_name="Test Institution",
        status="CONNECTED"
    )
    db_session.add(conn)
    db_session.commit()
    
    # 2. Insert transactions triggering multiple rules:
    # Rule A: Unwaived Bank Fees ($35 overdraft)
    # Rule B: Zombie Subscriptions ($14.99 figma * 12 = $179.88)
    txs = [
        Transaction(
            id="tx_1", org_id=org_id, plaid_connection_id=conn.id,
            amount=Decimal("35.00"), date=date(2026, 7, 18),
            name="Overdraft Fee", category="Service Charge"
        ),
        Transaction(
            id="tx_2", org_id=org_id, plaid_connection_id=conn.id,
            amount=Decimal("14.99"), date=date(2026, 6, 18),
            name="Figma.com monthly plan", category="SaaS"
        ),
        Transaction(
            id="tx_3", org_id=org_id, plaid_connection_id=conn.id,
            amount=Decimal("14.99"), date=date(2026, 7, 18),
            name="Figma.com monthly plan", category="SaaS"
        )
    ]
    for tx in txs:
        db_session.add(tx)
    db_session.commit()
    
    # 3. Run rules engine
    findings = run_all_rules(db_session, str(org_id))
    
    assert len(findings) == 2
    
    # Assert sorted by dollar_impact descending
    # Zombie figma subscription: $179.88 > Bank fee: $35.00
    assert findings[0].category == "zombie_subscription"
    assert findings[0].dollar_impact == Decimal("179.88")
    assert findings[1].category == "unwaived_bank_fee"
    assert findings[1].dollar_impact == Decimal("35.00")
    
    # Assert findings persisted in database
    db_findings = db_session.query(Finding).filter(Finding.org_id == org_id).all()
    assert len(db_findings) == 2

def test_celery_analysis_task(db_session):
    org_id = uuid.uuid4()
    
    conn = PlaidConnection(
        id=uuid.uuid4(),
        org_id=org_id,
        item_id="item_test_456",
        encrypted_access_token="encrypted_token_456",
        institution_name="Test Bank",
        status="CONNECTED"
    )
    db_session.add(conn)
    
    tx = Transaction(
        id="tx_4", org_id=org_id, plaid_connection_id=conn.id,
        amount=Decimal("12.00"), date=date(2026, 7, 18),
        name="Monthly Service Fee", category="Service Charge"
    )
    db_session.add(tx)
    db_session.commit()
    
    # Execute Celery task synchronously for testing
    result_count = analyze_org_fees(str(org_id))
    
    assert result_count == 1
    
    # Verify finding created in db
    db_finding = db_session.query(Finding).filter(Finding.org_id == org_id).first()
    assert db_finding is not None
    assert db_finding.category == "unwaived_bank_fee"
    assert db_finding.dollar_impact == Decimal("12.00")
