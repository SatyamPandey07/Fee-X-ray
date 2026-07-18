from typing import List
from sqlalchemy.orm import Session
from app.models import Transaction, Finding
from app.rules.processor_rate import detect_processor_rate_fees
from app.rules.zombie_subscription import detect_zombie_subscriptions
from app.rules.unwaived_bank_fee import detect_unwaived_bank_fees
from app.rules.chargeback import detect_undisputed_chargebacks

def run_all_rules(db: Session, org_id: str) -> List[Finding]:
    """
    Runs all 4 modular fee detection rules on organization transactions,
    persists findings in database, and returns them sorted by dollar impact.
    """
    # 1. Fetch transactions for org
    transactions = db.query(Transaction).filter(Transaction.org_id == org_id).all()
    
    findings_data = []
    
    # 2. Execute Rules
    # Rule 1: Processor Rate
    pr_finding = detect_processor_rate_fees(transactions, org_id)
    if pr_finding:
        findings_data.append(pr_finding)
        
    # Rule 2: Zombie Subscriptions
    zs_findings = detect_zombie_subscriptions(transactions, org_id)
    findings_data.extend(zs_findings)
    
    # Rule 3: Unwaived Bank Fees
    ub_finding = detect_unwaived_bank_fees(transactions, org_id)
    if ub_finding:
        findings_data.append(ub_finding)
        
    # Rule 4: Undisputed Chargebacks
    cb_findings = detect_undisputed_chargebacks(transactions, org_id)
    findings_data.extend(cb_findings)
    
    # 3. Clear existing findings for this org
    db.query(Finding).filter(Finding.org_id == org_id).delete()
    
    # 4. Save new findings
    db_findings = []
    for data in findings_data:
        db_f = Finding(
            org_id=data["org_id"],
            category=data["category"],
            explanation=data["explanation"],
            dollar_impact=data["dollar_impact"],
            suggested_action=data["suggested_action"]
        )
        db.add(db_f)
        db_findings.append(db_f)
        
    db.commit()
    
    # Refresh to load IDs & timestamps
    for db_f in db_findings:
        db.refresh(db_f)
        
    # 5. Return sorted findings
    db_findings.sort(key=lambda f: f.dollar_impact, reverse=True)
    return db_findings
