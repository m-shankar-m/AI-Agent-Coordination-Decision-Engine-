import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb+srv://shankar1612202_db_user:wIJc5uJwuZTh942D@cluster0.z07hiu0.mongodb.net/?appName=Cluster0")
DB_NAME = "aegis_banking_engine"

async def patch_logs():
    client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000, tls=True, tlsAllowInvalidCertificates=True)
    db = client[DB_NAME]
    
    logs = await db.audit_logs.find({}).to_list(1000)
    print(f"Found {len(logs)} logs.")
    updates = 0
    for log in logs:
        agent_name = log.get("agent_name", "")
        result = log.get("output_data", {})
        status_val = "SUCCESS"
        if agent_name == "Document Agent" and result.get("status") == "MISMATCH":
            status_val = "WARNING"
        elif agent_name == "KYC Agent" and result.get("status") == "FLAGGED":
            status_val = "FAILED"
        elif agent_name == "Risk Agent" and result.get("risk_level") in ["MEDIUM", "HIGH"]:
            status_val = "WARNING" if result.get("risk_level") == "MEDIUM" else "FAILED"
        elif agent_name == "Fraud Agent" and result.get("fraud_risk") == "HIGH":
            status_val = "FAILED"
        elif agent_name == "Decision Agent":
            dec = result.get("decision", "")
            if dec == "REJECTION_RECOMMENDATION":
                status_val = "FAILED"
            elif dec == "HUMAN_REVIEW_RECOMMENDED":
                status_val = "WARNING"
        
        if log.get("status") != status_val:
            await db.audit_logs.update_one({"_id": log["_id"]}, {"$set": {"status": status_val}})
            updates += 1
            print(f"Updated {log['_id']} to {status_val}")
    
    print(f"Patched {updates} logs.")

if __name__ == "__main__":
    asyncio.run(patch_logs())
