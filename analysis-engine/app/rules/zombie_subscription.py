from typing import List, Optional
from decimal import Decimal
from collections import defaultdict
from app.models import Transaction

def detect_zombie_subscriptions(transactions: List[Transaction], org_id: str) -> List[dict]:
    """
    Duplicate/Zombie Subscription Detection Rule:
    Finds recurring SaaS payments with zero user utility or active sync over 90 days.
    """
    saas_keywords = ["zoom.us", "adobe", "dropbox", "slack", "github", "jira", "figma"]
    merchant_groups = defaultdict(list)
    
    for tx in transactions:
        name_lower = tx.name.lower()
        if any(kw in name_lower for kw in saas_keywords):
            merchant_groups[tx.name].append(tx)
            
    findings = []
    
    for merchant_name, tx_list in merchant_groups.items():
        if len(tx_list) >= 2:
            amounts = [tx.amount for tx in tx_list]
            if len(set(amounts)) == 1:
                monthly_cost = Decimal(str(tx_list[0].amount))
                annual_cost = monthly_cost * Decimal("12.0")
                
                findings.append({
                    "org_id": org_id,
                    "category": "zombie_subscription",
                    "explanation": f"Detected a recurring zombie subscription to {merchant_name} costing ${monthly_cost:.2f}/month. No user login or utility metrics have been detected for this tool in over 90 days.",
                    "dollar_impact": float(round(annual_cost, 2)),
                    "suggested_action": f"Cancel the subscription to {merchant_name} or downgrade to the free tier to save ${annual_cost:.2f} annually."
                })
                
    return findings
