"""
Aegis Banking Synthetic Data Service (Python Implementation)
Converted from server/services/syntheticData.ts
Provides realistic synthetic customer profiles, applications, and documents for demonstration.
"""
from typing import Dict, Any, List
from datetime import datetime, timedelta

SEED_SCENARIOS: List[Dict[str, Any]] = [
    {
        "customer": {
            "id": "cust-syn-001",
            "full_name": "Dr. Evelyn Reed",
            "date_of_birth": "1986-04-12",
            "email": "evelyn.reed.synth@bankdemo.internal",
            "phone": "+1-555-0192",
            "address": {
                "street": "742 Evergreen Terrace",
                "city": "Metropolis",
                "state": "IL",
                "postal_code": "62960",
                "country": "United States",
            },
            "employment_status": "EMPLOYED",
            "employer_name": "Metro University Medical Center",
            "annual_income": 145000,
            "monthly_expenses": 3200,
            "declared_id_type": "PASSPORT",
            "declared_id_number": "P98421074",
            "nationality": "United States",
            "pep_status": False,
            "existing_customer": False,
            "is_synthetic": True,
        },
        "application": {
            "id": "APP-2026-001",
            "customer_id": "cust-syn-001",
            "product_type": "PREMIUM_CHECKING",
            "status": "SUBMITTED",
            "customer_name": "Dr. Evelyn Reed",
            "customer_email": "evelyn.reed.synth@bankdemo.internal",
            "annual_income": 145000,
            "requested_credit_limit": 15000,
            "created_at": (datetime.utcnow() - timedelta(hours=1)).isoformat() + "Z",
            "updated_at": (datetime.utcnow() - timedelta(hours=1)).isoformat() + "Z",
            "scenario": "LOW_RISK",
            "is_synthetic": True,
        },
        "documents": [
            {
                "id": "doc-syn-001-a",
                "document_type": "IDENTITY_DOCUMENT",
                "file_name": "us_passport_evelyn_reed_synthetic.pdf",
                "extracted_name": "Dr. Evelyn Reed",
                "extracted_dob": "1986-04-12",
                "extracted_id_number": "P98421074",
                "issue_date": "2021-06-15",
                "expiry_date": "2031-06-14",
                "issuing_authority": "US Department of State",
                "tamper_flags_detected": False,
                "blur_score": 0.05,
                "is_synthetic": True,
            }
        ],
    },
    {
        "customer": {
            "id": "cust-syn-002",
            "full_name": "Marcus Alexander Vance",
            "date_of_birth": "1992-09-24",
            "email": "marcus.vance.synth@bankdemo.internal",
            "phone": "+1-555-0381",
            "address": {
                "street": "1204 Pine Hollow Way",
                "city": "Austin",
                "state": "TX",
                "postal_code": "78701",
                "country": "United States",
            },
            "employment_status": "EMPLOYED",
            "employer_name": "Vance Industrial Dynamics",
            "annual_income": 68000,
            "monthly_expenses": 2800,
            "declared_id_type": "DRIVERS_LICENSE",
            "declared_id_number": "DL-TX-448201",
            "nationality": "United States",
            "pep_status": False,
            "existing_customer": False,
            "is_synthetic": True,
        },
        "application": {
            "id": "APP-2026-002",
            "customer_id": "cust-syn-002",
            "product_type": "CREDIT_LINE",
            "status": "REVIEW_REQUIRED",
            "customer_name": "Marcus Alexander Vance",
            "customer_email": "marcus.vance.synth@bankdemo.internal",
            "annual_income": 68000,
            "requested_credit_limit": 10000,
            "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat() + "Z",
            "updated_at": (datetime.utcnow() - timedelta(hours=2)).isoformat() + "Z",
            "scenario": "DOCUMENT_MISMATCH",
            "is_synthetic": True,
        },
        "documents": [
            {
                "id": "doc-syn-002-a",
                "document_type": "IDENTITY_DOCUMENT",
                "file_name": "tx_drivers_license_marcus_vance_synthetic.pdf",
                "extracted_name": "Marcus Alexander Vance",
                "extracted_dob": "1992-09-28",  # 4-day discrepancy
                "extracted_id_number": "DL-TX-448201",
                "issue_date": "2020-04-10",
                "expiry_date": "2028-04-10",
                "issuing_authority": "Texas DPS",
                "tamper_flags_detected": False,
                "blur_score": 0.08,
                "is_synthetic": True,
            }
        ],
    },
    {
        "customer": {
            "id": "cust-syn-003",
            "full_name": "Viktor K. Sterling",
            "date_of_birth": "1978-11-03",
            "email": "viktor.sterling.temp@disposable-inbox.com",
            "phone": "+1-555-0994",
            "address": {
                "street": "100 Wall Street Suite 400",
                "city": "New York",
                "state": "NY",
                "postal_code": "10005",
                "country": "United States",
            },
            "employment_status": "SELF_EMPLOYED",
            "employer_name": "Sterling Capital Holdings LLC",
            "annual_income": 380000,
            "monthly_expenses": 9500,
            "declared_id_type": "PASSPORT",
            "declared_id_number": "P88301944",
            "nationality": "United States",
            "pep_status": True,
            "existing_customer": False,
            "is_synthetic": True,
        },
        "application": {
            "id": "APP-2026-003",
            "customer_id": "cust-syn-003",
            "product_type": "BUSINESS_ACCOUNT",
            "status": "REVIEW_REQUIRED",
            "customer_name": "Viktor K. Sterling",
            "customer_email": "viktor.sterling.temp@disposable-inbox.com",
            "annual_income": 380000,
            "requested_credit_limit": 50000,
            "created_at": (datetime.utcnow() - timedelta(hours=3)).isoformat() + "Z",
            "updated_at": (datetime.utcnow() - timedelta(hours=3)).isoformat() + "Z",
            "scenario": "FRAUD_INDICATOR",
            "is_synthetic": True,
        },
        "documents": [
            {
                "id": "doc-syn-003-a",
                "document_type": "IDENTITY_DOCUMENT",
                "file_name": "passport_scan_tampered_synthetic.pdf",
                "extracted_name": "Viktor K. Sterling",
                "extracted_dob": "1978-11-03",
                "extracted_id_number": "P88301944",
                "issue_date": "2019-01-05",
                "expiry_date": "2029-01-04",
                "issuing_authority": "US Department of State",
                "tamper_flags_detected": True,
                "blur_score": 0.35,
                "is_synthetic": True,
            }
        ],
    },
]

class SyntheticDataService:
    def __init__(self):
        self.scenarios = SEED_SCENARIOS

    def get_all_scenarios(self) -> List[Dict[str, Any]]:
        return self.scenarios

    def get_by_customer_id(self, customer_id: str) -> Dict[str, Any]:
        for s in self.scenarios:
            if s["customer"]["id"] == customer_id:
                return s
        return self.scenarios[0]

    def get_by_application_id(self, app_id: str) -> Dict[str, Any]:
        for s in self.scenarios:
            if s["application"]["id"] == app_id:
                return s
        return self.scenarios[0]

synthetic_data_service = SyntheticDataService()
