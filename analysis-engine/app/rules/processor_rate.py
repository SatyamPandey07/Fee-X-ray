from typing import List, Optional
from decimal import Decimal
from app.models import Transaction

def detect_processor_rate_fees(transactions: List[Transaction], org_id: str) -> Optional[dict]:
    """
    Processor Rate Benchmarking Rule:
    Finds merchant card processing fees (e.g., Stripe, PayPal, Square).
    Calculates the effective fee rate and flags if it exceeds standard 3.5% markup.
    """
    processing_keywords = ["stripe fee", "paypal fee", "square fee", "merchant fee", "card processing"]
    sales_keywords = ["stripe payout", "paypal transfer", "square payout", "merchant transfer"]
    
    total_fees = Decimal("0.0")
    total_sales = Decimal("0.0")
    
    for tx in transactions:
        name_lower = tx.name.lower()
        if any(kw in name_lower for kw in processing_keywords):
            total_fees += Decimal(str(tx.amount))
        elif any(kw in name_lower for kw in sales_keywords):
            total_sales += Decimal(str(tx.amount))
            
    # Fallback default sales calculation if no explicit sales payouts found
    if total_sales == 0 and total_fees > 0:
        total_sales = total_fees * Decimal("25.0") # estimate volume at 4% rate
        
    if total_sales > 0 and total_fees > 0:
        effective_rate = (total_fees / total_sales) * Decimal("100.0")
        
        # Benchmark is 2.5%. If effective rate exceeds 3.5%, flag it
        if effective_rate > Decimal("3.5"):
            benchmark_rate = Decimal("2.5")
            excess_rate = effective_rate - benchmark_rate
            dollar_impact = total_sales * (excess_rate / Decimal("100.0"))
            
            return {
                "org_id": org_id,
                "category": "processor_rate",
                "explanation": f"Your payment processing fee rate is averaging {effective_rate:.2f}%, which is significantly higher than the standard interchange-plus benchmark of {benchmark_rate:.2f}%.",
                "dollar_impact": float(round(dollar_impact, 2)),
                "suggested_action": "Request interchange-plus pricing from Stripe or PayPal, or route credit card transactions through a processor offering lower volume-based markups."
            }
            
    return None
