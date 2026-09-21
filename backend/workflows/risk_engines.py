"""
Specialized Banking Quantitative Risk & Basel III Calculation Engines in Python.
"""
import math
from typing import Dict, Any

def calculate_loan_underwriting(
    base_salary: float,
    monthly_bonus: float,
    existing_emi: float,
    new_loan_emi: float,
    prop_tax_ins: float,
    purchase_price: float,
    down_payment: float,
    tenure_years: int = 20,
    interest_rate: float = 8.75
) -> Dict[str, Any]:
    gross_monthly = base_salary + monthly_bonus
    loan_amount = max(0.0, purchase_price - down_payment)
    total_monthly_debt = existing_emi + new_loan_emi + prop_tax_ins
    
    front_end_dti = ((new_loan_emi + prop_tax_ins) / gross_monthly * 100) if gross_monthly > 0 else 0
    back_end_dti = (total_monthly_debt / gross_monthly * 100) if gross_monthly > 0 else 0
    ltv = (loan_amount / purchase_price * 100) if purchase_price > 0 else 0
    
    status = "QUALIFIED" if back_end_dti <= 43 and ltv <= 80 else ("MANUAL_REVIEW" if back_end_dti <= 50 else "DECLINED")
    
    return {
        "gross_monthly_income": gross_monthly,
        "loan_amount": loan_amount,
        "front_end_dti": round(front_end_dti, 2),
        "back_end_dti": round(back_end_dti, 2),
        "ltv_ratio": round(ltv, 2),
        "underwriting_status": status,
    }

def calculate_basel_iii_capital(
    total_assets: float,
    rwa: float,
    cet1_capital: float,
    tier2_capital: float,
    duration_years: float = 4.5,
    rate_shock_bps: float = 200.0,
    confidence_level: float = 0.99
) -> Dict[str, Any]:
    cet1_ratio = (cet1_capital / rwa * 100) if rwa > 0 else 0
    total_capital_ratio = ((cet1_capital + tier2_capital) / rwa * 100) if rwa > 0 else 0
    
    # Duration shock loss: Assets * Duration * delta_y
    rate_shock_delta = rate_shock_bps / 10000.0
    duration_shock_loss = total_assets * duration_years * rate_shock_delta
    
    # Parametric Value-at-Risk (VaR)
    # z = 2.326 for 99%
    daily_vol = 0.012
    var_99 = total_assets * 2.326 * daily_vol
    
    compliant = cet1_ratio >= 4.5 and total_capital_ratio >= 8.0
    
    return {
        "cet1_ratio": round(cet1_ratio, 2),
        "total_capital_ratio": round(total_capital_ratio, 2),
        "duration_shock_loss": round(duration_shock_loss, 2),
        "daily_var_99": round(var_99, 2),
        "basel_compliant": compliant,
        "minimum_cet1_required": 4.5,
        "minimum_total_capital_required": 8.0,
    }
