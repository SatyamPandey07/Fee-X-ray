from typing import List, Optional
from decimal import Decimal
from app.models import Transaction

def detect_undisputed_chargebacks(transactions: List[Transaction], org_id: str) -> List[dict]:
    """
    Undisputed Chargeback Detection Rule:
    Scans for chargeback/dispute transactions that lack matching reversal or win dispute records.
    """
    chargeback_keywords = ["chargeback", "customer dispute", "disputed charge"]
    reversal_keywords = ["dispute won", "chargeback won", "dispute reversal", "chargeback reversal"]
    
    chargebacks = []
    reversals = []
    
    for tx in transactions:
        name_lower = tx.name.lower()
        if any(kw in name_lower for kw in chargeback_keywords):
            chargebacks.append(tx)
        elif any(kw in name_lower for kw in reversal_keywords):
            reversals.append(tx)
            
    findings = []
    
    for cb in chargebacks:
        # Check if there is a matching reversal (e.g. same amount or close in value)
        has_reversal = False
        cb_amount = Decimal(str(cb.amount))
        
        for rev in reversals:
            rev_amount = Decimal(str(rev.amount))
            # Payout reversal or win might match the absolute chargeback amount
            if abs(rev_amount) == abs(cb_amount):
                has_reversal = True
                break
                
        if not has_reversal:
            findings.append({
                "org_id": org_id,
                "category": "chargeback",
                "explanation": f"Detected an undisputed customer chargeback/dispute for transaction '{cb.name}' totaling ${cb_amount:.2f} with no corresponding dispute response or won event.",
                "dollar_impact": float(round(cb_amount, 2)),
                "suggested_action": f"Provide shipment tracking, delivery proof, or customer interaction logs to your merchant dashboard to contest the '{cb.name}' chargeback before it expires."
            })
            
    return findings
