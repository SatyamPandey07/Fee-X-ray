import pytest
import uuid
from fastapi.testclient import TestClient
from jose import jwt
from app.main import app
from app.database import Base, engine, get_db
from app.models import PlaidConnection, Transaction, Institution
from app.security import decrypt_token
from sqlalchemy.orm import sessionmaker

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    # Make sure we don't drop existing developer tables, just clean after each run
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        # Clean test records safely
        session.query(Transaction).delete()
        session.query(PlaidConnection).delete()
        session.query(Institution).delete()
        session.commit()
        session.close()

@pytest.fixture
def client():
    return TestClient(app)

def generate_token(org_id: str) -> str:
    payload = {
        "sub": "test_user_sub",
        "email": "test@feexray.local",
        "org_id": org_id,
        "realm_access": {"roles": ["OWNER"]}
    }
    return jwt.encode(payload, "secret_key_dev", algorithm="HS256")

def test_create_link_token(client):
    req_payload = {"org_id": str(uuid.uuid4())}
    response = client.post("/api/v1/plaid/link-token", json=req_payload)
    
    assert response.status_code == 201
    assert "link_token" in response.json()

def test_exchange_token_success(client, db_session):
    org_id = str(uuid.uuid4())
    token = generate_token(org_id)
    headers = {"Authorization": f"Bearer {token}"}
    
    req_payload = {
        "public_token": "public-sandbox-mock-123",
        "org_id": org_id,
        "institution_id": "ins_123",
        "institution_name": "Test Sandbox Institution"
    }
    
    response = client.post("/api/v1/plaid/exchange-token", json=req_payload, headers=headers)
    assert response.status_code == 201
    
    res_data = response.json()
    assert res_data["status"] == "success"
    
    # Assert connection is stored in db and token is encrypted
    db_conn = db_session.query(PlaidConnection).filter(PlaidConnection.id == res_data["connection_id"]).first()
    assert db_conn is not None
    assert db_conn.item_id == "item_mock_" + org_id
    assert db_conn.encrypted_access_token != "access_sandbox_mock_" + org_id
    
    # Assert token can be decrypted correctly
    decrypted = decrypt_token(db_conn.encrypted_access_token)
    assert decrypted == "access_sandbox_mock_" + org_id

def test_exchange_token_cross_org_access_blocked(client, db_session):
    org_id = str(uuid.uuid4())
    different_org_id = str(uuid.uuid4())
    
    token = generate_token(org_id)
    headers = {"Authorization": f"Bearer {token}"}
    
    req_payload = {
        "public_token": "public-sandbox-mock-123",
        "org_id": different_org_id,
        "institution_id": "ins_123",
        "institution_name": "Test Sandbox Institution"
    }
    
    response = client.post("/api/v1/plaid/exchange-token", json=req_payload, headers=headers)
    assert response.status_code == 403
    assert "Cross-organization access is blocked" in response.json()["detail"]
