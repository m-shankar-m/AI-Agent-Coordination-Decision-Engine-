import re

with open("backend/server.py.backup", "r") as f:
    content = f.read()

# Add mongo imports at the top
imports = """import asyncio
import json
import time
import math
from datetime import datetime
from contextlib import asynccontextmanager

from backend.db.mongo import (
    seed_mongodb_if_empty, applications_col, reviews_col, 
    audit_logs_col, workflows_col, policies_col, scenarios_col
)
"""
content = re.sub(r"import asyncio\nimport json\nimport time\nimport math\nfrom datetime import datetime", imports, content)

# Change app startup to seed DB
startup_code = """
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await seed_mongodb_if_empty()
    yield
    # Shutdown

app = FastAPI(
    title="Aegis Banking Multi-Agent AI Decision Engine",
    version="1.0.0-enterprise",
    description="Enterprise Multi-Agent Banking Decision & Risk Underwriting Platform (FastAPI)",
    lifespan=lifespan
)
"""
content = re.sub(r"app = FastAPI\([\s\S]*?\)", startup_code.strip(), content)

# Remove SEED_APPLICATIONS and SEED_PENDING_REVIEWS from being global variables used everywhere.
# We'll just leave them for the seed logic in mongo.py (we already moved them, but wait, mongo.py imports them from server.py!)
# So I should keep them in server.py, but change the endpoints to not use them.

# Rewrite get_applications
new_get_applications = """
@app.get("/api/v1/applications")
async def get_applications(page: int = 1, limit: int = 20):
    skip = (page - 1) * limit
    cursor = applications_col.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    total = await applications_col.count_documents({})
    return {
        "page": page,
        "limit": limit,
        "total": total,
        "items": items
    }
"""
content = re.sub(r"@app\.get\(\"/api/v1/applications\"\)\ndef get_applications[\s\S]*?return \{[\s\S]*?\"items\": items\n    \}", new_get_applications.strip(), content)

# Rewrite get_reviews
new_get_reviews = """
@app.get("/api/v1/reviews")
async def get_reviews():
    pending_cursor = reviews_col.find({"action": {"$exists": False}}, {"_id": 0}).sort("created_at", -1)
    pending = await pending_cursor.to_list(length=100)
    
    history_cursor = reviews_col.find({"action": {"$exists": True}}, {"_id": 0}).sort("created_at", -1)
    history = await history_cursor.to_list(length=100)
    
    return {
        "pending": pending,
        "history": history
    }
"""
content = re.sub(r"@app\.get\(\"/api/v1/reviews\"\)\ndef get_reviews[\s\S]*?\"history\": \[\]\n    \}", new_get_reviews.strip(), content)

# Rewrite submit_review_decision
new_submit_review = """
@app.post("/api/v1/reviews/{application_id}/decision")
async def submit_review_decision(application_id: str, payload: Dict[str, Any]):
    action = payload.get("action", "")
    
    # Update review
    await reviews_col.update_many(
        {"application_id": application_id},
        {"$set": {"action": action, "decision_notes": payload.get("notes", "")}}
    )
    
    # Update application status
    new_status = "APPROVED" if action == "APPROVE" else "REJECTED" if action == "REJECT" else "REVIEW_REQUIRED"
    await applications_col.update_one(
        {"id": application_id},
        {"$set": {"status": new_status, "updated_at": datetime.utcnow().isoformat() + "Z"}}
    )
            
    return {"status": "success", "application_id": application_id}
"""
content = re.sub(r"@app\.post\(\"/api/v1/reviews/\{application_id\}/decision\"\)\ndef submit_review_decision[\s\S]*?return \{\"status\": \"success\", \"application_id\": application_id\}", new_submit_review.strip(), content)

# Add policies and audit logs endpoints right before create_application
new_endpoints = """
@app.get("/api/v1/policies")
async def get_policies(q: str = None):
    if q:
        # Simple text search simulation
        cursor = policies_col.find({"$text": {"$search": q}}, {"_id": 0})
        # For a real app, use vector search. Here we just return all for simulation if no text index exists
        # Actually let's just use regex for simplicity in this demo
        cursor = policies_col.find({"text": {"$regex": q, "$options": "i"}}, {"_id": 0})
        items = await cursor.to_list(length=20)
        results = [{"policy": item, "similarity": 0.95} for item in items]
        return {"results": results}
    else:
        cursor = policies_col.find({}, {"_id": 0})
        items = await cursor.to_list(length=50)
        return {"policies": items}

@app.get("/api/v1/audit-logs")
async def get_audit_logs(application_id: str = None):
    query = {}
    if application_id:
        query["application_id"] = application_id
    cursor = audit_logs_col.find(query, {"_id": 0}).sort("timestamp", -1)
    items = await cursor.to_list(length=100)
    return {"logs": items}

@app.post("/api/v1/applications")
"""
content = content.replace('@app.post("/api/v1/applications")', new_endpoints.strip())


# Rewrite create_application to use async await applications_col.insert_one
new_create_app = """
@app.post("/api/v1/applications")
async def create_application(payload: Dict[str, Any]):
    app_id = f"APP-2026-CUST-{int(time.time())}"
    cust_id = f"cust-syn-{int(time.time())}"
    
    new_app = {
        "id": app_id,
        "customer_id": cust_id,
        "product_type": payload.get("product_type", "UNKNOWN"),
        "status": "SUBMITTED",
        "customer_name": payload.get("customer_name", "Unknown"),
        "customer_email": payload.get("email", ""),
        "annual_income": payload.get("annual_income", 0),
        "requested_credit_limit": payload.get("requested_credit_limit", 0),
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "scenario": payload.get("scenario", "LOW_RISK"),
        "is_synthetic": True,
    }
    
    new_customer = {
        "id": cust_id,
        "full_name": payload.get("customer_name", "Unknown"),
        "date_of_birth": payload.get("dob", "1990-01-01"),
        "email": payload.get("email", ""),
        "phone": payload.get("phone", ""),
        "address": {
            "street": payload.get("address", ""),
            "city": "Unknown",
            "state": "XX",
            "postal_code": "00000",
            "country": "United States"
        },
        "employment_status": payload.get("employment_status", "EMPLOYED"),
        "employer_name": payload.get("employer_name", ""),
        "annual_income": payload.get("annual_income", 0),
        "monthly_expenses": payload.get("monthly_expenses", 0),
        "declared_id_type": payload.get("id_type", "PASSPORT"),
        "declared_id_number": payload.get("id_number", ""),
        "nationality": "United States",
        "pep_status": payload.get("pep_status", False),
        "existing_customer": False,
        "is_synthetic": True,
        "credit_score": payload.get("credit_score", 700)
    }
    
    new_doc = {
        "id": f"doc-{cust_id}",
        "document_type": "IDENTITY_DOCUMENT",
        "file_name": "custom_doc.pdf",
        "extracted_name": payload.get("customer_name", "Unknown"),
        "extracted_dob": payload.get("dob", "1990-01-01"),
        "extracted_id_number": payload.get("id_number", ""),
        "issue_date": "2020-01-01",
        "expiry_date": "2030-01-01",
        "issuing_authority": "Custom",
        "tamper_flags_detected": payload.get("tamper_flags_detected", False),
        "blur_score": 0.05 if not payload.get("has_document_mismatch") else 0.5,
        "is_synthetic": True,
    }
    
    scenario_obj = {
        "customer": new_customer,
        "application": new_app,
        "documents": [new_doc]
    }
    
    synthetic_data_service.add_scenario(scenario_obj)
    
    # Insert to Mongo
    await applications_col.insert_one(new_app)
    # Remove _id before returning to avoid serialization error
    new_app.pop("_id", None)
    
    return new_app
"""
content = re.sub(r"@app\.post\(\"/api/v1/applications\"\)\ndef create_application[\s\S]*?return new_app", new_create_app.strip(), content)


# Fix the stream generator to save audit logs and workflows
new_stream_generator_mongo_additions = """
            if agent_name == "Decision Agent" and result.get("decision") == "HUMAN_REVIEW_RECOMMENDED":
                state["workflow_status"] = "PAUSED_FOR_REVIEW"
                state["human_review_required"] = True
                review_reason = result.get("reasons", ["Requires manual review"])[0] if result.get("reasons") else "Requires manual review"
                state["review_reason"] = review_reason
                
                # Add to global review queue
                new_review = {
                    "application_id": state.get("application_id", "APP-UNKNOWN"),
                    "reason": review_reason,
                    "created_at": datetime.utcnow().isoformat() + "Z",
                    "priority": "HIGH"
                }
                
                # We need to run async operations in the generator. It's already an async def.
                await reviews_col.insert_one(new_review)
                
                yield f"data: {json.dumps({'type': 'HUMAN_REVIEW_TRIGGERED', 'data': {'reason': review_reason}})}\\n\\n"
                return
            
            # Log audit
            await audit_logs_col.insert_one({
                "application_id": state.get("application_id", "APP-UNKNOWN"),
                "agent_name": agent_name,
                "action": "TOOL_EXECUTION",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "details": f"Agent {agent_name} executed {tool_name} successfully."
            })
"""
content = re.sub(r"if agent_name == \"Decision Agent\" and result\.get\(\"decision\"\) == \"HUMAN_REVIEW_RECOMMENDED\":[\s\S]*?yield f\"data: \{json\.dumps\(\{'type': 'HUMAN_REVIEW_TRIGGERED', 'data': \{'reason': review_reason\}\}\)\}\\n\\n\"\n                return", new_stream_generator_mongo_additions.strip(), content)

# Write back to file
with open("backend/server.py", "w") as f:
    f.write(content)
print("Updated server.py")
