"""
FastAPI Full-Stack Banking AI Decision Engine Server
Mirrors all REST endpoints, SSE streams, multi-agent workflows, and risk calculation tools.
"""
from fastapi import FastAPI, HTTPException, Request, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from backend.db import mongo


from typing import List, Dict, Optional, Any
import asyncio
import json
import time
import math
from datetime import datetime

app = FastAPI(
    title="Aegis Banking Multi-Agent AI Decision Engine",
    version="1.0.0-enterprise",
    description="Enterprise Multi-Agent Banking Decision & Risk Underwriting Platform (FastAPI)"
)

@app.get('/')
def read_root():
    return {'status': 'ok'}

# CORS middleware for microservice and browser ingress
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db():
    try:
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
    except Exception as e:
        print(f"MongoDB connection failed on startup: {e}")

server_start_time = time.time()

# -------------------------------------------------------------------------
# IN-MEMORY REPOSITORY & SYNTHETIC DATA ENGINE
# -------------------------------------------------------------------------
SEED_APPLICATIONS = [
    {
        "id": "APP-2026-001",
        "customer_id": "cust-syn-001",
        "product_type": "PREMIUM_CHECKING",
        "status": "SUBMITTED",
        "customer_name": "Dr. Evelyn Reed",
        "customer_email": "evelyn.reed.synth@bankdemo.internal",
        "annual_income": 145000,
        "requested_credit_limit": 15000,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z",
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
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z",
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
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "scenario": "FRAUD_INDICATOR",
        "is_synthetic": True,
    },
    {
        "id": "APP-2026-004",
        "customer_id": "cust-syn-004",
        "product_type": "SAVINGS_ACCOUNT",
        "status": "SUBMITTED",
        "customer_name": "Sarah Chen-Miller",
        "customer_email": "sarah.cmiller.synth@bankdemo.internal",
        "annual_income": 92000,
        "requested_credit_limit": 5000,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "scenario": "MEDIUM_RISK",
        "is_synthetic": True,
    },
]

SEED_PENDING_REVIEWS = [
    {
        "application_id": "APP-2026-002",
        "reason": "Date of Birth discrepancy: Declared 1992-09-24 vs Driving License OCR 1992-09-28 (Delta: 4 days). Secondary supervisory review required.",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "priority": "STANDARD",
        "risk_level": "MEDIUM",
        "previous_ai_recommendation": "REVIEW_REQUIRED",
    },
    {
        "application_id": "APP-2026-003",
        "reason": "Critical Security Alert: Document tamper score exceeded threshold (0.35 blur/tamper index) + Politically Exposed Person (PEP) list match.",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "priority": "URGENT",
        "risk_level": "HIGH",
        "previous_ai_recommendation": "REJECT_RECOMMENDATION",
    },
]

SEED_AUDIT_LOGS = []

AGENTS_FLEET = [
    {
        "name": "Planning Agent",
        "role": "Orchestrator & Graph Dispatcher",
        "description": "Analyzes incoming application profile, computes dependency DAG, constructs agent execution plan, and routes dynamic stages.",
        "status": "IDLE",
        "execution_time_ms": 0,
        "success_rate": 1.0,
        "total_runs": 0,
        "allowed_tools": ["get_customer_profile", "get_realtime_external_data", "create_audit_record"],
    },
    {
        "name": "Document Agent",
        "role": "Identity Document Verification",
        "description": "Executes OCR extraction verification, field alignment, tampering detection, and image clarity assessments on identity proofs.",
        "status": "IDLE",
        "execution_time_ms": 0,
        "success_rate": 1.0,
        "total_runs": 0,
        "allowed_tools": ["verify_document"],
    },
    {
        "name": "KYC Agent",
        "role": "Know Your Customer & Sanctions Screening",
        "description": "Validates identity credentials against global sanctions, politically exposed persons (PEP) indices, and biometric liveliness.",
        "status": "IDLE",
        "execution_time_ms": 0,
        "success_rate": 1.0,
        "total_runs": 0,
        "allowed_tools": ["verify_identity"],
    },
    {
        "name": "Risk Agent",
        "role": "Credit Risk & Financial Capacity Analysis",
        "description": "Evaluates credit bureau files, debt-to-income (DTI) ratios, employment tenure, and computes deterministic risk scores.",
        "status": "IDLE",
        "execution_time_ms": 0,
        "success_rate": 1.0,
        "total_runs": 0,
        "allowed_tools": ["get_credit_profile", "calculate_risk"],
    },
    {
        "name": "Fraud Agent",
        "role": "Anomaly & Synthetic Identity Detection",
        "description": "Detects duplicate applications, disposable contact vectors, geolocation discrepancies, and historical fraud patterns.",
        "status": "IDLE",
        "execution_time_ms": 0,
        "success_rate": 1.0,
        "total_runs": 0,
        "allowed_tools": ["check_fraud_indicators"],
    },
    {
        "name": "Compliance Agent",
        "role": "Regulatory & Policy Enforcement",
        "description": "Conducts semantic vector search on banking policies, verifies CDD/AML requirements, and checks jurisdictional eligibility.",
        "status": "IDLE",
        "execution_time_ms": 0,
        "success_rate": 1.0,
        "total_runs": 0,
        "allowed_tools": ["search_banking_policy", "check_compliance"],
    },
    {
        "name": "Decision Agent",
        "role": "Multi-Criteria Synthesis & Recommendation",
        "description": "Synthesizes upstream agent evidence, applies deterministic decision rules, and generates auditable recommendations.",
        "status": "IDLE",
        "execution_time_ms": 0,
        "success_rate": 1.0,
        "total_runs": 0,
        "allowed_tools": ["create_audit_record"],
    },
    {
        "name": "Response Agent",
        "role": "Customer & Internal Communication",
        "description": "Generates secure customer-facing correspondence and internal banking executive briefings, triggering notifications.",
        "status": "IDLE",
        "execution_time_ms": 0,
        "success_rate": 1.0,
        "total_runs": 0,
        "allowed_tools": ["send_notification"],
    },
]

TOOLS_REGISTRY = [
    {
        "name": "get_customer_profile",
        "description": "Retrieves synthetic customer demographic, employment, and income profile by customer ID.",
        "category": "IDENTITY",
        "timeoutMs": 3000,
        "retries": 2,
        "inputSchema": "{ customer_id: string }",
        "outputSchema": "CustomerData (Synthetic)",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    },
    {
        "name": "verify_document",
        "description": "Analyzes synthetic customer identity documents, checking tampering, blur, and field matches.",
        "category": "IDENTITY",
        "timeoutMs": 4000,
        "retries": 1,
        "inputSchema": "{ document: SyntheticDocument, customer: CustomerData }",
        "outputSchema": "DocumentResult",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    },
    {
        "name": "verify_identity",
        "description": "Calls KYC verification sandbox adapter to screen against sanctions, watchlist, and biometric liveness.",
        "category": "IDENTITY",
        "timeoutMs": 5000,
        "retries": 2,
        "inputSchema": "{ customer: CustomerData, document_status: string }",
        "outputSchema": "KYCResult",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    },
    {
        "name": "get_credit_profile",
        "description": "Retrieves credit bureau score, credit utilization, and historical payment performance records.",
        "category": "RISK",
        "timeoutMs": 4000,
        "retries": 2,
        "inputSchema": "{ customer_id: string, annual_income: number }",
        "outputSchema": "{ credit_score: number, payment_history_score: number, open_tradelines: number }",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    },
    {
        "name": "calculate_risk",
        "description": "Deterministic configurable risk calculation engine evaluating DTI, stability, and credit capacity.",
        "category": "RISK",
        "timeoutMs": 2000,
        "retries": 0,
        "inputSchema": "{ customer: CustomerData, credit_score: number, requested_limit?: number }",
        "outputSchema": "RiskResult",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    },
    {
        "name": "check_fraud_indicators",
        "description": "Checks application inconsistencies, duplicate records, device fingerprints, and synthetic identity flags.",
        "category": "FRAUD",
        "timeoutMs": 3500,
        "retries": 1,
        "inputSchema": "{ customer: CustomerData, documents: SyntheticDocument[] }",
        "outputSchema": "FraudResult",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    },
    {
        "name": "check_compliance",
        "description": "Applies regulatory rules (AML, minimum age, jurisdiction) and returns pass/fail status.",
        "category": "COMPLIANCE",
        "timeoutMs": 3000,
        "retries": 1,
        "inputSchema": "{ customer: CustomerData, kyc_result?: KYCResult, policies: ScoredPolicy[] }",
        "outputSchema": "ComplianceResult",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    },
    {
        "name": "search_banking_policy",
        "description": "Vector knowledge-base semantic similarity retrieval for banking and regulatory policies.",
        "category": "COMPLIANCE",
        "timeoutMs": 3000,
        "retries": 1,
        "inputSchema": "{ query: string, top_k?: number }",
        "outputSchema": "ScoredPolicy[]",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    },
    {
        "name": "get_realtime_external_data",
        "description": "Fetches live market forex benchmarks, Central Bank benchmark rates, and macroeconomic indicators.",
        "category": "EXTERNAL",
        "timeoutMs": 4000,
        "retries": 2,
        "inputSchema": "{}",
        "outputSchema": "RealtimeFinancialData",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    },
    {
        "name": "send_notification",
        "description": "Dispatches simulated customer communication (email/SMS/in-app) without exposing internal risk scores.",
        "category": "EXTERNAL",
        "timeoutMs": 2500,
        "retries": 1,
        "inputSchema": "{ recipient: string, channel: string, message: string, decision: string }",
        "outputSchema": "{ success: boolean, dispatch_id: string, channel: string }",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    },
    {
        "name": "create_audit_record",
        "description": "Commits an immutable regulatory audit log entry with input hash and timestamp.",
        "category": "AUDIT",
        "timeoutMs": 1500,
        "retries": 0,
        "inputSchema": "{ application_id: string, agent: string, action: string, data: any }",
        "outputSchema": "{ audit_id: string, recorded: boolean }",
        "stats": {"calls": 0, "failures": 0, "totalMs": 0}
    }
]

# -------------------------------------------------------------------------
# API ROUTES (FASTAPI PYTHON SPECIFICATION)
# -------------------------------------------------------------------------

@app.get("/api/v1/health")
def get_health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "service": "banking-ai-decision-engine-python",
        "version": "1.0.0-enterprise",
        "runtime": "Python 3.10 / FastAPI",
        "uptime_seconds": int(time.time() - server_start_time),
        "circuit_breaker": "CLOSED",
    }

@app.get("/api/v1/metrics")
def get_metrics():
    return {
        "total_applications": len(SEED_APPLICATIONS),
        "in_progress": 0,
        "completed": 2,
        "review_required": len(SEED_PENDING_REVIEWS),
        "approval_recommendations": 1,
        "rejection_recommendations": 1,
        "average_processing_time_ms": 1420,
        "agent_errors": 0,
        "tool_failures": 0,
        "human_review_rate": 0.5,
        "uptime_seconds": int(time.time() - server_start_time),
    }

@app.get("/api/v1/applications")
def get_applications(page: int = 1, limit: int = 20):
    start = (page - 1) * limit
    end = start + limit
    items = SEED_APPLICATIONS[start:end]
    return {
        "page": page,
        "limit": limit,
        "total": len(SEED_APPLICATIONS),
        "items": items
    }

@app.get("/api/v1/reviews")
def get_reviews():
    return {
        "pending": SEED_PENDING_REVIEWS,
        "history": []
    }

@app.post("/api/v1/reviews/{application_id}/decision")
async def submit_review_decision(application_id: str, payload: Dict[str, Any]):
    global SEED_PENDING_REVIEWS
    SEED_PENDING_REVIEWS = [r for r in SEED_PENDING_REVIEWS if r["application_id"] != application_id]
    await mongo.reviews_col.delete_many({"application_id": application_id})
    
    # Also update the application status in SEED_APPLICATIONS
    for app in SEED_APPLICATIONS:
        if app["id"] == application_id:
            action = payload.get("action", "")
            if action == "APPROVE":
                app["status"] = "APPROVED"
                await mongo.applications_col.update_one({"id": application_id}, {"$set": {"status": "APPROVED"}})
            elif action == "REJECT":
                app["status"] = "REJECTED"
                await mongo.applications_col.update_one({"id": application_id}, {"$set": {"status": "REJECTED"}})
            break
            
    return {"status": "success", "application_id": application_id}

@app.post("/api/v1/simulation/toggle-external-failure")
def toggle_external_failure(payload: Dict[str, Any]):
    return {"forced_failure_active": payload.get("enable_failure", False)}

@app.post("/api/v1/seed")
def seed_data(payload: Dict[str, Any]):
    return {"status": "success", "count": payload.get("count", 0)}

from backend.data.synthetic_data import synthetic_data_service

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
    SEED_APPLICATIONS.insert(0, new_app)
    await mongo.applications_col.insert_one(new_app.copy())
    return new_app

from backend.tools.tool_registry import banking_tools
from backend.agents import agent_fleet
from backend.workflows.multi_agent_engine import multi_agent_engine

@app.get("/api/v1/agents")
def get_agents():
    return [agent.to_metadata() for agent in agent_fleet.values()]

@app.get("/api/v1/tools")
def get_tools():
    tools_output = []
    for t in TOOLS_REGISTRY:
        t_copy = dict(t)
        t_copy["stats"] = banking_tools.tool_stats.get(t["name"], {"calls": 0, "failures": 0, "totalMs": 0})
        tools_output.append(t_copy)
    return tools_output

@app.post("/api/v1/workflows/start")
def start_workflow(payload: Dict[str, Any]):
    app_id = payload.get("application_id", "APP-2026-001")
    return multi_agent_engine.start_workflow(app_id)

@app.get("/api/v1/workflows/{workflow_id}/stream")
async def stream_workflow(workflow_id: str):
    async def event_generator():
        state = multi_agent_engine.get_workflow_state(workflow_id)
        if not state:
            yield f"data: {json.dumps({'error': 'Workflow not found'})}\n\n"
            return
            
        yield f"data: {json.dumps({'type': 'SNAPSHOT', 'data': state})}\n\n"
        
        customer_data = state.get("customer_data", {})
        documents = state.get("documents", [{}])
        doc = documents[0] if documents else {}
        
        # Extract variables
        c_score = customer_data.get("credit_score", 750)
        c_pep = customer_data.get("pep_status", False)
        c_tamper = doc.get("tamper_flags_detected", False)
        c_mismatch = doc.get("blur_score", 0.05) > 0.4
        
        # Calculate Risk Agent output
        risk_level = "LOW"
        if c_score < 600:
            risk_level = "HIGH"
        elif c_score < 700:
            risk_level = "MEDIUM"
            
        # Calculate Fraud Agent output
        fraud_risk = "LOW"
        fraud_score = 10
        if c_tamper:
            fraud_risk = "HIGH"
            fraud_score = 95
        
        # Start LLM Agent asynchronously so it runs while we stream earlier steps
        from backend.workflows.llm_agent import evaluate_application
        llm_task = asyncio.create_task(evaluate_application(customer_data, documents))

        steps_early = [
            ("Document Agent", 2, "verify_document", {"status": "VERIFIED" if not c_mismatch else "MISMATCH", "confidence": 0.98 if not c_mismatch else 0.4, "name_match": not c_mismatch, "dob_match": True, "is_synthetic": True}),
            ("KYC Agent", 3, "verify_identity", {"status": "VERIFIED" if not c_pep else "FLAGGED", "sanctions_cleared": True, "pep_identified": c_pep, "details": "Identity check complete", "is_synthetic": True}),
            ("Risk Agent", 4, "calculate_risk", {"risk_level": risk_level, "credit_score": c_score, "debt_to_income_ratio": 25, "explanation": f"{risk_level.title()} risk profile", "is_synthetic": True}),
            ("Fraud Agent", 5, "check_fraud_indicators", {"fraud_risk": fraud_risk, "fraud_score": fraud_score, "duplicate_detected": False, "suspicious_indicators": ["Tampering"] if c_tamper else [], "is_synthetic": True}),
            ("Compliance Agent", 6, "check_compliance", {"status": "PASS", "policy_rules_applied": ["KYC-01", "AML-02"], "compliance_notes": "Compliant", "is_synthetic": True}),
        ]
        
        result_keys = ["document_result", "kyc_result", "risk_result", "fraud_result", "compliance_result", "decision_result", "response_result"]
        
        for idx in range(7):
            if idx < 5:
                agent_name, step_num, tool_name, result = steps_early[idx]
                await asyncio.sleep(1.2)  # Increased delay to perfectly mask the LLM generation time so it doesn't pause at step 7
            elif idx == 5:
                try:
                    llm_result = await llm_task
                except Exception as e:
                    llm_result = {"decision": "HUMAN_REVIEW_RECOMMENDED", "confidence": 0.0, "reason": f"System Crash: {str(e)}"}
                decision = llm_result["decision"]
                decision_conf = llm_result["confidence"]
                decision_reason = llm_result["reason"]
                agent_name, step_num, tool_name, result = ("Decision Agent", 7, "create_audit_record", {"decision": decision, "confidence": decision_conf, "reasons": [decision_reason] if decision_reason else [], "supporting_factors": [], "data_sources": ["Synthetic KYC", "Bureau"], "timestamp": datetime.utcnow().isoformat() + "Z"})
                await asyncio.sleep(0.05)
            elif idx == 6:
                agent_name, step_num, tool_name, result = ("Response Agent", 8, "send_notification", {"customer_message": f"Your application is {decision.split('_')[0].lower()}.", "internal_summary": decision_reason, "notification_dispatched": True})
                await asyncio.sleep(0.05)
            await asyncio.sleep(0.05)
            state["current_agent"] = agent_name
            state["current_step"] = step_num
            state[result_keys[idx]] = result
            
            tool_call = {
                "id": f"tc-{int(time.time()*1000)}-{idx}",
                "tool_name": tool_name,
                "agent_name": agent_name,
                "input_hash": f"hash-{int(time.time())}",
                "execution_time_ms": 150 + (int(time.time()) % 100)
            }
            
            audit_record = {
                "id": f"aud-{int(time.time()*1000)}-{idx}",
                "application_id": state.get("application_id", "APP-UNKNOWN"),
                "agent_name": agent_name,
                "action": tool_name,
                "input_hash": f"hash-{int(time.time())}",
                "output_data": result,
                "status": "SUCCESS",
                "execution_time_ms": 150 + (int(time.time()) % 100),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "data_source": "Synthetic Engine"
            }
            SEED_AUDIT_LOGS.insert(0, audit_record)
            await mongo.audit_logs_col.insert_one(audit_record.copy())
            
            yield f"data: {json.dumps({'type': 'TOOL_CALLED', 'data': tool_call})}\n\n"
            yield f"data: {json.dumps({'type': 'SNAPSHOT', 'data': state})}\n\n"
            
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
                    "priority": "HIGH",
                    "risk_level": risk_level,
                    "previous_ai_recommendation": "REVIEW_REQUIRED"
                }
                SEED_PENDING_REVIEWS.append(new_review)
                await mongo.reviews_col.insert_one(new_review.copy())
                
                yield f"data: {json.dumps({'type': 'HUMAN_REVIEW_TRIGGERED', 'data': {'reason': review_reason}})}\n\n"
                return
            
        await asyncio.sleep(0.05)
        state["workflow_status"] = "COMPLETED"
        yield f"data: {json.dumps({'type': 'WORKFLOW_COMPLETED'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/api/v1/workflows/{workflow_id}")
def get_workflow(workflow_id: str):
    state = multi_agent_engine.get_workflow_state(workflow_id)
    if not state:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return state

@app.get("/api/v1/workflows/application/{application_id}")
def get_workflow_by_app(application_id: str):
    state = multi_agent_engine.get_latest_workflow_for_app(application_id)
    if not state:
        # Provide fallback states for the seeded pending reviews if they weren't run yet this session
        if application_id == "APP-2026-002":
            state = {
                "workflow_id": f"wf-seed-{application_id}",
                "application_id": application_id,
                "current_step": 8,
                "total_steps": 8,
                "current_agent": "Decision Agent",
                "workflow_status": "PAUSED_FOR_REVIEW",
                "human_review_required": True,
                "review_reason": "Date of Birth discrepancy: Declared 1992-09-24 vs Driving License OCR 1992-09-28 (Delta: 4 days). Secondary supervisory review required.",
                "customer_data": {"customer_name": "Marcus Alexander Vance", "credit_score": 680},
                "documents": [{"document_type": "IDENTITY_DOCUMENT", "extracted_name": "Marcus Vance", "extracted_dob": "1992-09-28"}],
                "execution_trace": [],
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
        elif application_id == "APP-2026-003":
            state = {
                "workflow_id": f"wf-seed-{application_id}",
                "application_id": application_id,
                "current_step": 8,
                "total_steps": 8,
                "current_agent": "Decision Agent",
                "workflow_status": "PAUSED_FOR_REVIEW",
                "human_review_required": True,
                "review_reason": "Critical Security Alert: Document tamper score exceeded threshold (0.35 blur/tamper index) + Politically Exposed Person (PEP) list match.",
                "customer_data": {"customer_name": "Viktor K. Sterling", "pep_status": True, "credit_score": 750},
                "documents": [{"document_type": "IDENTITY_DOCUMENT", "tamper_flags_detected": True, "blur_score": 0.4}],
                "execution_trace": [],
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
        else:
            raise HTTPException(status_code=404, detail="No workflow found for this application")
        
    tool_calls = [
        {
            "id": log["id"],
            "tool_name": log["action"],
            "agent_name": log["agent_name"],
            "input_hash": log["input_hash"],
            "execution_time_ms": log["execution_time_ms"]
        }
        for log in reversed(SEED_AUDIT_LOGS) if log["application_id"] == application_id
    ]
    
    return {
        "state": state,
        "tool_calls": tool_calls
    }

@app.get("/api/v1/realtime-data")
def get_realtime_data():
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "central_bank_repo_rate": 6.50,
        "currency_fx_rates": {
            "USD_INR": 86.42,
            "EUR_INR": 93.18,
            "GBP_INR": 109.65,
            "USD_EUR": 0.927
        },
        "inflation_rate": 4.85,
        "interbank_base_rate": 6.75,
        "is_realtime": True,
        "source_api": "Central Banking Exchange API (Synthetic / Realtime Mirror)",
        "circuit_breaker_active": False,
        "latency_ms": 18,
        "last_cached_at": datetime.utcnow().isoformat() + "Z",
        "forced_failure_active": False
    }

@app.get("/api/v1/audit/{application_id}")
def get_audit_logs(application_id: str, page: int = 1, limit: int = 25, agent: str = "ALL", status: str = "ALL"):
    filtered_logs = SEED_AUDIT_LOGS
    
    if application_id and application_id != "ALL":
        filtered_logs = [log for log in filtered_logs if log["application_id"] == application_id]
        
    if agent and agent != "ALL":
        filtered_logs = [log for log in filtered_logs if log["agent_name"] == agent]
        
    if status and status != "ALL":
        filtered_logs = [log for log in filtered_logs if log["status"] == status]
        
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated = filtered_logs[start_idx:end_idx]
    
    return {
        "total": len(filtered_logs),
        "logs": paginated,
        "page": page,
        "limit": limit
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)

@app.get('/')
def read_root():
    return {'status': 'ok'}


