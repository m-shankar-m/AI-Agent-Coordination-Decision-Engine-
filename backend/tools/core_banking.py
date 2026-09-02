from typing import Dict, Any
import hashlib

class CoreBankingTool:
    """Enterprise Core Banking API Interface simulation."""

    name = "core_banking_ledger"
    description = "Queries core banking ledger for account history, average monthly balance, recurring salary deposits, and overdraft/NSF events."

    def execute(self, account_id: str, applicant_name: str, annual_income: float) -> Dict[str, Any]:
        # Deterministic generation based on account/name
        seed = int(hashlib.md5(f"{account_id}-{applicant_name}".encode()).hexdigest()[:6], 16)
        
        monthly_income_est = annual_income / 12.0
        avg_balance = round(monthly_income_est * (0.8 + (seed % 150) / 100.0), 2)
        nsf_count = seed % 3 if annual_income > 80000 else seed % 5
        has_direct_deposit = True
        account_tenure_months = 24 + (seed % 96)
        active_standing_orders = 2 + (seed % 4)

        return {
            "account_id": account_id,
            "account_status": "ACTIVE_IN_GOOD_STANDING" if nsf_count < 2 else "WARNING_OVERDRAFT_RECORD",
            "account_tenure_months": account_tenure_months,
            "average_6m_balance": avg_balance,
            "salary_direct_deposit_verified": has_direct_deposit,
            "verified_monthly_payroll": round(monthly_income_est * 0.96, 2),
            "nsf_bounced_checks_last_12m": nsf_count,
            "active_standing_orders": active_standing_orders,
            "core_banking_system": "Finacle / Temenos Enterprise Hub"
        }
