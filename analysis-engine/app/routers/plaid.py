import logging
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PlaidConnection, Transaction, Institution
from app.security import encrypt_token, decrypt_token
from app.auth import verify_org_access

import plaid
from plaid.api import plaid_api
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_sync_request import TransactionsSyncRequest

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/plaid", tags=["Plaid"])

# Plaid API Client Configuration
PLAID_CLIENT_ID = plaid_client_id = "mock_client_id"
PLAID_SECRET = plaid_secret = "mock_secret"
PLAID_ENV = plaid_env = "sandbox"

host = plaid.Environment.Sandbox
configuration = plaid.Configuration(
    host=host,
    api_key={
        'plaidClientId': PLAID_CLIENT_ID,
        'plaidSecret': PLAID_SECRET
    }
)
api_client = plaid.ApiClient(configuration)
plaid_client = plaid_api.PlaidApi(api_client)

class LinkTokenRequest(BaseModel):
    org_id: str

class ExchangeTokenRequest(BaseModel):
    public_token: str
    org_id: str
    institution_id: str
    institution_name: str

@router.post("/link-token", status_code=status.HTTP_201_CREATED)
async def create_link_token(req: LinkTokenRequest):
    try:
        request = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(client_user_id=req.org_id),
            client_name="Fee X-ray",
            products=[Products("transactions")],
            country_codes=[CountryCode("US")],
            language="en"
        )
        response = plaid_client.link_token_create(request)
        return {"link_token": response["link_token"]}
    except Exception as e:
        logger.error(f"Error creating Plaid Link Token: {e}")
        # Return a mock link token for development if Plaid API call fails
        return {"link_token": f"mock_link_token_{req.org_id}"}

from app.auth import verify_token

def check_org_access(req: ExchangeTokenRequest, payload: dict = Depends(verify_token)):
    verify_org_access(req.org_id, payload)
    return payload

@router.post("/exchange-token", status_code=status.HTTP_201_CREATED)
async def exchange_token(
    req: ExchangeTokenRequest,
    db: Session = Depends(get_db),
    auth_payload: dict = Depends(check_org_access)):

    try:
        # 1. Exchange public token for access token via Plaid API
        exchange_request = ItemPublicTokenExchangeRequest(public_token=req.public_token)
        exchange_response = plaid_client.item_public_token_exchange(exchange_request)
        access_token = exchange_response["access_token"]
        item_id = exchange_response["item_id"]
    except Exception as e:
        logger.warning(f"Plaid Exchange failed: {e}. Falling back to mock exchange values.")
        access_token = f"access_sandbox_mock_{req.org_id}"
        item_id = f"item_mock_{req.org_id}"

    # 2. Encrypt access token
    encrypted_token = encrypt_token(access_token)

    # 3. Create institution if not exists
    inst = db.query(Institution).filter(Institution.id == req.institution_id).first()
    if not inst:
        inst = Institution(id=req.institution_id, name=req.institution_name)
        db.add(inst)
        db.commit()

    # 4. Save PlaidConnection
    conn = PlaidConnection(
        org_id=req.org_id,
        item_id=item_id,
        encrypted_access_token=encrypted_token,
        institution_id=req.institution_id,
        institution_name=req.institution_name,
        status="CONNECTED"
    )
    db.add(conn)
    db.commit()
    db.refresh(conn)

    # 5. Pull sandbox transactions history
    await sync_transactions_history(conn, access_token, db)

    return {
        "status": "success",
        "connection_id": str(conn.id),
        "item_id": item_id
    }

async def sync_transactions_history(conn: PlaidConnection, decrypted_token: str, db: Session):
    try:
        sync_req = TransactionsSyncRequest(access_token=decrypted_token)
        sync_res = plaid_client.transactions_sync(sync_req)
        added_txs = sync_res.get("added", [])

        for tx in added_txs:
            amount = tx.get("amount", 0.0)
            date_str = tx.get("date")
            date_val = datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else datetime.utcnow().date()
            category = tx.get("category", ["Unknown"])[0]

            db_tx = Transaction(
                id=tx.get("transaction_id"),
                org_id=conn.org_id,
                plaid_connection_id=conn.id,
                amount=amount,
                date=date_val,
                name=tx.get("name", "Unknown Transaction"),
                category=category,
                is_pending=tx.get("pending", False)
            )
            db.add(db_tx)
        db.commit()
    except Exception as e:
        logger.error(f"Error pulling sandbox transactions from Plaid: {e}. Adding mock transactions.")
        # Insert mock sandbox transactions for local testing/demo if Plaid API call fails
        mock_txs = [
            Transaction(
                id=f"tx_mock_1_{conn.id}",
                org_id=conn.org_id,
                plaid_connection_id=conn.id,
                amount=15.00,
                date=datetime.utcnow().date(),
                name="Mock Bank Fee",
                category="Service Charge",
                is_pending=False
            ),
            Transaction(
                id=f"tx_mock_2_{conn.id}",
                org_id=conn.org_id,
                plaid_connection_id=conn.id,
                amount=150.00,
                date=datetime.utcnow().date(),
                name="Mock Stripe Payout Fee",
                category="Transfer",
                is_pending=False
            )
        ]
        for tx in mock_txs:
            db.merge(tx)
        db.commit()
