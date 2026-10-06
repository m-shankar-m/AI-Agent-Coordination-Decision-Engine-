import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://shankar1612202_db_user:wIJc5uJwuZTh942D@cluster0.z07hiu0.mongodb.net/?appName=Cluster0")
DB_NAME = "aegis_banking_engine"

client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]

# Collections
applications_col = db.applications
reviews_col = db.reviews
audit_logs_col = db.audit_logs
workflows_col = db.workflows
policies_col = db.policies
scenarios_col = db.scenarios

async def seed_mongodb_if_empty():
    app_count = await applications_col.count_documents({})
    if app_count > 0:
        return # Already seeded

    # Seed Applications
    from backend.server import SEED_APPLICATIONS, SEED_PENDING_REVIEWS
    
    if SEED_APPLICATIONS:
        await applications_col.insert_many(SEED_APPLICATIONS)
        
    if SEED_PENDING_REVIEWS:
        await reviews_col.insert_many(SEED_PENDING_REVIEWS)
        
    # Seed Policies
    SEED_POLICIES = [
        {
            "id": "pol-001",
            "code": "KYC-01",
            "title": "Customer Identification Program",
            "text": "All customers must provide a valid government-issued ID. For non-resident aliens, a valid passport and proof of address are required. Verification must occur before account activation.",
            "category": "Identity"
        },
        {
            "id": "pol-002",
            "code": "AML-02",
            "title": "Anti-Money Laundering Thresholds",
            "text": "Any cash transaction exceeding $10,000 USD must be reported to FinCEN within 15 days. Structuring transactions to avoid this threshold is strictly prohibited and triggers immediate SAR filing.",
            "category": "Compliance"
        },
        {
            "id": "pol-003",
            "code": "CRED-04",
            "title": "Unsecured Credit Line Requirements",
            "text": "Applicants for premium unsecured credit lines must demonstrate a DTI (Debt-to-Income) ratio below 36%, a minimum credit score of 720, and continuous employment for at least 24 months.",
            "category": "Risk"
        },
        {
            "id": "pol-004",
            "code": "FRAUD-99",
            "title": "Synthetic Identity Mitigation",
            "text": "Applications exhibiting inconsistent cross-bureau SSN histories or rapidly fabricated credit files (piggybacking) must undergo Tier 2 manual review and enhanced biometric verification.",
            "category": "Fraud"
        }
    ]
    await policies_col.insert_many(SEED_POLICIES)
    
    # Add dummy audit logs
    SEED_AUDIT_LOGS = [
        {
            "application_id": "APP-2026-001",
            "agent_name": "Planning Agent",
            "action": "WORKFLOW_INITIATED",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "details": "Orchestrator initialized standard low-risk workflow."
        },
        {
            "application_id": "APP-2026-001",
            "agent_name": "Decision Agent",
            "action": "AUTO_APPROVED",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "details": "Application auto-approved based on high credit score."
        }
    ]
    await audit_logs_col.insert_many(SEED_AUDIT_LOGS)

    print("MongoDB successfully seeded with initial synthetic data.")
