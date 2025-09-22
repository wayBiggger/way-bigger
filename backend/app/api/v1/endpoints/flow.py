from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.flow import FlowWallet, FlowAsset, FlowTransaction

router = APIRouter()


class LinkWalletRequest(BaseModel):
    address: str
    provider: str | None = None
    network: str | None = "testnet"


@router.post("/wallet/link", response_model=Dict[str, Any])
def link_wallet(req: LinkWalletRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(FlowWallet).filter(FlowWallet.address == req.address).first()
    if existing:
        if existing.user_id != current_user.id:
            raise HTTPException(status_code=409, detail="Wallet already linked to another account")
        return {"message": "Wallet already linked", "address": existing.address}

    wallet = FlowWallet(user_id=current_user.id, address=req.address, provider=req.provider, network=req.network or "testnet")
    db.add(wallet)
    db.commit()
    db.refresh(wallet)
    return {"message": "Wallet linked", "address": wallet.address, "provider": wallet.provider, "network": wallet.network}


@router.get("/assets", response_model=List[Dict[str, Any]])
def list_assets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    assets = db.query(FlowAsset).filter(FlowAsset.user_id == current_user.id).order_by(FlowAsset.created_at.desc()).all()
    return [
        {
            "id": a.id,
            "asset_type": a.asset_type,
            "contract": {
                "name": a.contract_name,
                "address": a.contract_address,
            },
            "token_id": a.token_id,
            "metadata": a.metadata,
            "preview_image": a.preview_image,
            "created_at": str(a.created_at),
        }
        for a in assets
    ]


class RecordTxRequest(BaseModel):
    tx_id: str
    action: str
    wallet_address: str
    payload: Dict[str, Any] | None = None
    status: str | None = "pending"
    error: str | None = None


@router.post("/tx", response_model=Dict[str, Any])
def record_tx(req: RecordTxRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tx = FlowTransaction(
        user_id=current_user.id,
        wallet_address=req.wallet_address,
        tx_id=req.tx_id,
        action=req.action,
        status=req.status or "pending",
        error=req.error,
        payload=req.payload,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return {"id": tx.id, "tx_id": tx.tx_id, "status": tx.status}


