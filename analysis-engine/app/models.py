import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Date, ForeignKey, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base

class Institution(Base):
    __tablename__ = "institutions"

    id = Column(String, primary_key=True, index=True) # e.g. ins_10
    name = Column(String, nullable=False)

class PlaidConnection(Base):
    __tablename__ = "plaid_connections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    item_id = Column(String, nullable=False, unique=True)
    encrypted_access_token = Column(String, nullable=False)
    institution_id = Column(String, ForeignKey("institutions.id"), nullable=True)
    institution_name = Column(String, nullable=True)
    status = Column(String, nullable=False, default="CONNECTED")
    created_at = Column(DateTime, default=datetime.utcnow)

    institution = relationship("Institution")
    transactions = relationship("Transaction", back_populates="plaid_connection", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True) # Plaid Transaction ID
    org_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    plaid_connection_id = Column(UUID(as_uuid=True), ForeignKey("plaid_connections.id"), nullable=False)
    amount = Column(Numeric(precision=10, scale=2), nullable=False)
    date = Column(Date, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    is_pending = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    plaid_connection = relationship("PlaidConnection", back_populates="transactions")

class Finding(Base):
    __tablename__ = "findings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    category = Column(String, nullable=False) # e.g. processor_rate, zombie_subscription
    explanation = Column(String, nullable=False)
    dollar_impact = Column(Numeric(precision=10, scale=2), nullable=False)
    suggested_action = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
