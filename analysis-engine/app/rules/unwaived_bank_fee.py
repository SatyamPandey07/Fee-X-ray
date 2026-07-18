from typing import List, Optional
from decimal import Decimal
from app.models import Transaction

def detect_unwaived_bank_fees(transactions: List[Transaction], org_id: str) -> Optional[dict]:
    """
    Unwaived Bank Fee Detection Rule:
    Identifies typical bank charges (overdraft, wire, account maintenance) which banks commonly waive upon request.
    """
    bank_fee_keywords = ["overdraft fee", "wire transfer fee", "maintenance fee", "monthly service fee", "insufficient funds"]
    
    total_bank_fees = Decimal("0.0")
    matching_tx_names = []
    
    for tx in transactions:
        name_lower = tx.name.lower()
        if any(kw in name_lower for kw in bank_fee_keywords) or (tx.category and "service charge" in tx.category.lower()):
            total_bank_fees += Decimal(str(tx.amount))
            matching_tx_names.append(tx.name)
            
    if total_bank_fees > 0:
        return {
            "org_id": org_id,
            "category": "unwaived_bank_fee",
            "explanation": f"You paid a total of ${total_bank_fees:.2f} in bank service charges and transaction fees. Most commercial banks will waive these charges as a courtesy if contacted.",
            "dollar_impact": float(round(total_bank_fees, 2)),
            "suggested_action": "Call your bank relationship manager or customer service line and request a courtesy refund for these service fees using our automated bank script."
        }
        
    return None
