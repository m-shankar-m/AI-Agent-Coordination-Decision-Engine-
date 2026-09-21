import pytest
import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.workflows.risk_engines import calculate_loan_underwriting, calculate_basel_iii_capital

def test_calculate_loan_underwriting_qualified():
    # Low DTI, Low LTV -> QUALIFIED
    result = calculate_loan_underwriting(
        base_salary=10000.0,
        monthly_bonus=2000.0,
        existing_emi=1000.0,
        new_loan_emi=2000.0,
        prop_tax_ins=500.0,
        purchase_price=500000.0,
        down_payment=150000.0 # 350k loan, 70% LTV
    )
    
    assert result["underwriting_status"] == "QUALIFIED"
    assert result["front_end_dti"] == round((2500 / 12000) * 100, 2)
    assert result["back_end_dti"] == round((3500 / 12000) * 100, 2)
    assert result["ltv_ratio"] == 70.0

def test_calculate_loan_underwriting_manual_review():
    # High DTI but < 50%, Low LTV -> MANUAL_REVIEW
    result = calculate_loan_underwriting(
        base_salary=10000.0,
        monthly_bonus=0.0,
        existing_emi=2500.0,
        new_loan_emi=2000.0,
        prop_tax_ins=400.0,
        purchase_price=500000.0,
        down_payment=150000.0 
    )
    
    assert result["underwriting_status"] == "MANUAL_REVIEW"
    assert result["back_end_dti"] == 49.0

def test_calculate_loan_underwriting_declined():
    # High DTI > 50% -> DECLINED
    result = calculate_loan_underwriting(
        base_salary=8000.0,
        monthly_bonus=0.0,
        existing_emi=3000.0,
        new_loan_emi=2000.0,
        prop_tax_ins=500.0,
        purchase_price=500000.0,
        down_payment=150000.0
    )
    
    assert result["underwriting_status"] == "DECLINED"
    assert result["back_end_dti"] > 50.0

def test_calculate_basel_iii_capital_compliant():
    # High Capital -> Compliant
    result = calculate_basel_iii_capital(
        total_assets=10000000.0,
        rwa=5000000.0,
        cet1_capital=500000.0,  # 10%
        tier2_capital=250000.0  # 5%
    )
    
    assert result["basel_compliant"] is True
    assert result["cet1_ratio"] == 10.0
    assert result["total_capital_ratio"] == 15.0

def test_calculate_basel_iii_capital_non_compliant():
    # Low Capital -> Non-Compliant
    result = calculate_basel_iii_capital(
        total_assets=10000000.0,
        rwa=8000000.0,
        cet1_capital=300000.0,  # 3.75% (< 4.5%)
        tier2_capital=100000.0 
    )
    
    assert result["basel_compliant"] is False
    assert result["cet1_ratio"] == 3.75
