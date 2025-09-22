from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..core.database import Base


class FlowWallet(Base):
    __tablename__ = "flow_wallets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    address = Column(String, unique=True, index=True, nullable=False)
    provider = Column(String, nullable=True)  # blocto, dapper, ledger, etc
    network = Column(String, default="testnet")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="flow_wallets")


class FlowAsset(Base):
    __tablename__ = "flow_assets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    wallet_address = Column(String, index=True, nullable=False)
    asset_type = Column(String, nullable=False)  # nft|badge|token
    contract_name = Column(String, nullable=True)
    contract_address = Column(String, nullable=True)
    token_id = Column(String, nullable=True)
    metadata = Column(JSON, nullable=True)
    preview_image = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="flow_assets")


class FlowTransaction(Base):
    __tablename__ = "flow_transactions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    wallet_address = Column(String, index=True, nullable=False)
    tx_id = Column(String, unique=True, index=True, nullable=False)
    action = Column(String, nullable=False)  # mint_nft|reward_badge|reward_token|link_wallet
    status = Column(String, default="pending")  # pending|sealed|failed
    error = Column(Text, nullable=True)
    payload = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="flow_transactions")


