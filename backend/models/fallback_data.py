"""
Aegis Banking Fallback Data (Python Implementation)
Converted from src/data/fallbackData.ts
Provides resilient mock data for applications, metrics, reviews, agents, tools, policies, and audits.
"""
from datetime import datetime

FALLBACK_METRICS = {
    "total_applications": 4,
    "in_progress": 0,
    "completed": 2,
    "review_required": 2,
    "approval_recommendations": 1,
    "rejection_recommendations": 1,
    "average_processing_time_ms": 1420,
    "agent_errors": 0,
    "tool_failures": 0,
    "human_review_rate": 0.5,
    "uptime_seconds": 3600,
}

FALLBACK_APPLICATIONS = [
    {
        "id": "APP-2026-001",
        "customer_id": "cust-syn-001",
        "product_type": "PREMIUM_CHECKING",
        "status": "SUBMITTED",
        "customer_name": "Dr. Evelyn Reed",
        "customer_email": "evelyn.reed.synth@bankdemo.internal",
        "annual_income": 145000,
        "requested_credit_limit": 15000,
        "created_at": "2026-09-21T03:00:00.000Z",
        "updated_at": "2026-09-21T03:00:00.000Z",
        "scenario": "LOW_RISK",
        "is_synthetic": True,
    },
    {
        "id": "APP-2026-002",
        "customer_id": "cust-syn-002",
        "product_type": "CREDIT_LINE",
        "status": "REVIEW_REQUIRED",
        "customer_name": "Marcus Alexander Vance",
        "customer_email": "marcus.vance.synth@bankdemo.internal",
        "annual_income": 68000,
        "requested_credit_limit": 10000,
        "created_at": "2026-09-21T02:00:00.000Z",
        "updated_at": "2026-09-21T02:00:00.000Z",
        "scenario": "DOCUMENT_MISMATCH",
        "is_synthetic": True,
    },
    {
        "id": "APP-2026-003",
        "customer_id": "cust-syn-003",
        "product_type": "BUSINESS_ACCOUNT",
        "status": "REVIEW_REQUIRED",
        "customer_name": "Viktor K. Sterling",
        "customer_email": "viktor.sterling.temp@disposable-inbox.com",
        "annual_income": 380000,
        "requested_credit_limit": 50000,
        "created_at": "2026-09-21T01:00:00.000Z",
        "updated_at": "2026-09-21T01:00:00.000Z",
        "scenario": "FRAUD_INDICATOR",
        "is_synthetic": True,
    },
]
