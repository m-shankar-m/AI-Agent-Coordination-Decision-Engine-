import pytest
import os
import sys

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.tools.tool_registry import banking_tools

def test_verify_document_passed():
    document = {
        "id": "DOC-123",
        "extracted_name": "Jane Doe",
        "extracted_dob": "1985-10-25",
        "tamper_flags_detected": False,
        "blur_score": 0.05
    }
    customer = {
        "full_name": "Jane Doe",
        "date_of_birth": "1985-10-25"
    }
    
    result = banking_tools.verify_document(document, customer)
    assert result["status"] == "PASSED"
    assert result["confidence_score"] == 0.98
    assert result["name_match"] is True
    assert result["tamper_detected"] is False

def test_verify_document_flagged():
    document = {
        "id": "DOC-456",
        "extracted_name": "Jane Doe",
        "extracted_dob": "1985-10-25",
        "tamper_flags_detected": True, # Tampering detected!
        "blur_score": 0.20
    }
    customer = {
        "full_name": "Jane Doe",
        "date_of_birth": "1985-10-25"
    }
    
    result = banking_tools.verify_document(document, customer)
    assert result["status"] == "FLAGGED"
    assert result["tamper_detected"] is True

def test_verify_identity_passed():
    customer = {
        "id": "CUST-001",
        "pep_status": False
    }
    result = banking_tools.verify_identity(customer, "PASSED")
    assert result["kyc_status"] == "VERIFIED"
    assert result["sanctions_screen_passed"] is True

def test_verify_identity_pep_failed():
    customer = {
        "id": "CUST-002",
        "pep_status": True # PEP match!
    }
    result = banking_tools.verify_identity(customer, "PASSED")
    assert result["kyc_status"] == "FAILED"
    assert result["sanctions_screen_passed"] is False

def test_calculate_risk_low():
    customer = {
        "annual_income": 120000.0,
        "monthly_expenses": 2000.0 # DTI = 20%
    }
    result = banking_tools.calculate_risk(customer, credit_score=750, requested_limit=10000.0)
    assert result["risk_tier"] == "LOW"
    assert result["recommendation"] == "APPROVE"
    assert result["assigned_limit"] == 10000.0

def test_calculate_risk_high():
    customer = {
        "annual_income": 50000.0,
        "monthly_expenses": 3000.0 # DTI = 72%
    }
    result = banking_tools.calculate_risk(customer, credit_score=500, requested_limit=10000.0)
    assert result["risk_tier"] == "HIGH"
    assert result["recommendation"] == "REJECT"
    assert result["assigned_limit"] == 0.0

def test_check_fraud_indicators_disposable():
    customer = {
        "email": "test@disposable.com"
    }
    documents = [{"tamper_flags_detected": False}]
    
    result = banking_tools.check_fraud_indicators(customer, documents)
    assert "DISPOSABLE_EMAIL_DOMAIN" in result["flags"]
    assert result["fraud_score"] == 0.60
    assert result["status"] == "MEDIUM_RISK"
