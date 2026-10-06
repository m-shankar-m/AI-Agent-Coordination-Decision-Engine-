import re

with open("backend/server.py", "r") as f:
    content = f.read()

# 1. Add imports and startup event
import_target = "from fastapi.middleware.cors import CORSMiddleware"
startup_code = """from fastapi.middleware.cors import CORSMiddleware
from backend.db import mongo

@app.on_event("startup")
async def startup_db():
    await mongo.seed_mongodb_if_empty()
    
    global SEED_APPLICATIONS, SEED_PENDING_REVIEWS, SEED_AUDIT_LOGS
    
    apps = await mongo.applications_col.find().sort("_id", -1).to_list(1000)
    for a in apps: a.pop("_id", None)
    if apps: SEED_APPLICATIONS[:] = apps
        
    reviews = await mongo.reviews_col.find().sort("_id", -1).to_list(1000)
    for r in reviews: r.pop("_id", None)
    if reviews: SEED_PENDING_REVIEWS[:] = reviews
        
    logs = await mongo.audit_logs_col.find().sort("_id", -1).to_list(1000)
    for l in logs: l.pop("_id", None)
    if logs: SEED_AUDIT_LOGS[:] = logs
"""
content = content.replace(import_target, startup_code)

# 2. submit_review_decision
content = content.replace(
    'def submit_review_decision(application_id: str, payload: Dict[str, Any]):',
    'async def submit_review_decision(application_id: str, payload: Dict[str, Any]):'
)
content = content.replace(
    'SEED_PENDING_REVIEWS = [r for r in SEED_PENDING_REVIEWS if r["application_id"] != application_id]',
    'SEED_PENDING_REVIEWS = [r for r in SEED_PENDING_REVIEWS if r["application_id"] != application_id]\n    await mongo.reviews_col.delete_many({"application_id": application_id})'
)
content = content.replace(
    'app["status"] = "APPROVED"',
    'app["status"] = "APPROVED"\n                await mongo.applications_col.update_one({"id": application_id}, {"$set": {"status": "APPROVED"}})'
)
content = content.replace(
    'app["status"] = "REJECTED"',
    'app["status"] = "REJECTED"\n                await mongo.applications_col.update_one({"id": application_id}, {"$set": {"status": "REJECTED"}})'
)

# 3. create_application
content = content.replace(
    'def create_application(payload: Dict[str, Any]):',
    'async def create_application(payload: Dict[str, Any]):'
)
content = content.replace(
    'SEED_APPLICATIONS.insert(0, new_app)\n    return new_app',
    'SEED_APPLICATIONS.insert(0, new_app)\n    await mongo.applications_col.insert_one(new_app.copy())\n    return new_app'
)

# 4. stream_workflow
content = content.replace(
    'SEED_AUDIT_LOGS.insert(0, audit_record)',
    'SEED_AUDIT_LOGS.insert(0, audit_record)\n            await mongo.audit_logs_col.insert_one(audit_record.copy())'
)
review_target = """                SEED_PENDING_REVIEWS.append({
                    "application_id": state.get("application_id", "APP-UNKNOWN"),
                    "reason": review_reason,
                    "created_at": datetime.utcnow().isoformat() + "Z",
                    "priority": "HIGH",
                    "risk_level": risk_level,
                    "previous_ai_recommendation": "REVIEW_REQUIRED"
                })"""
review_replacement = """                new_review = {
                    "application_id": state.get("application_id", "APP-UNKNOWN"),
                    "reason": review_reason,
                    "created_at": datetime.utcnow().isoformat() + "Z",
                    "priority": "HIGH",
                    "risk_level": risk_level,
                    "previous_ai_recommendation": "REVIEW_REQUIRED"
                }
                SEED_PENDING_REVIEWS.append(new_review)
                await mongo.reviews_col.insert_one(new_review.copy())"""
content = content.replace(review_target, review_replacement)

with open("backend/server.py", "w") as f:
    f.write(content)

print("Patching complete!")
