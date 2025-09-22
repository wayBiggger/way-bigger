from __future__ import annotations

from typing import Any, Dict, Optional


class FlowService:
    """Lightweight service facade for Flow integrations.

    Notes:
        - In production, use Flow Access API / REST endpoints to fetch tx status
          and fcl-style signature verification for user messages.
        - This module intentionally avoids vendor lock-in. Replace stubs with
          concrete calls to a Flow SDK or gateway.
    """

    def __init__(self, network: str = "testnet") -> None:
        self.network = network

    # --- Signature verification -------------------------------------------------
    def verify_user_message_signature(
        self,
        *,
        address: str,
        message_hex: str,
        signatures: Any,
    ) -> bool:
        """Verify a signed user message.

        Args:
            address: Flow account address (0x prefixed on mainnet/testnet)
            message_hex: Hex-encoded message (fcl.currentUser().signUserMessage input)
            signatures: Structure returned by FCL signUserMessage

        Returns:
            True if signatures verify for the given address and message.

        Implementation placeholder:
            Implement with a Flow crypto lib or a verification API. For now
            this returns True when the structure looks plausible.
        """
        try:
            if not address or not message_hex or not signatures:
                return False
            # Minimal structure sanity checks. Replace with real cryptographic checks.
            if isinstance(signatures, list) and len(signatures) > 0:
                first = signatures[0]
                return all(k in first for k in ("addr", "keyId", "signature"))
            return False
        except Exception:
            return False

    # --- Transactions -----------------------------------------------------------
    def get_transaction_status(self, tx_id: str) -> Dict[str, Any]:
        """Fetch transaction status from Flow node (stub).

        Replace with a real call to Flow Access API.
        """
        return {"id": tx_id, "status": "pending", "network": self.network}


flow_service = FlowService()


