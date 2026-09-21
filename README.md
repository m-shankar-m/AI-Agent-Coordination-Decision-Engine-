# AegisBank AI Multi-Agent Decision & Risk Engine

A production-grade, enterprise banking onboarding, risk assessment, and decision engine powered by specialized collaborative AI agents, LangGraph-style dynamic state routing, deterministic financial rules engines, real-time external adapters, and human-in-the-loop oversight.

---

## 🏛 Core Architectural Principles

1. **Deterministic Guardrails**: The LLM is **never** the database, the rules engine, or the regulated financial source of truth.
   - Flow: **Reasoning / Intent → Specialized Tool Invocations → Verified Data → Deterministic Rules → Explainable Recommendation → Human Review**.
2. **Strict Data Isolation**: All customer, application, credit bureau, and identity document data are synthetic fixtures explicitly tagged with `is_synthetic: true`.
3. **Cryptographic Auditing**: Every tool call, agent action, and supervisory override records an immutable SHA-256 hash of its inputs, status, execution duration, and data source.
4. **Resilience & Circuit Breakers**: External financial API calls feature exponential backoff, configurable timeouts, and an automated circuit breaker that switches to internal reserve benchmark caches during outages.

---

## 🤖 Multi-Agent Fleet

| Agent | Role | Allowed Tools | Dynamic Routing Condition |
| :--- | :--- | :--- | :--- |
| **Planning Agent** | DAG Orchestration & Plan Formulation | `get_customer_profile`, `get_realtime_external_data` | Emits initial dependency state |
| **Document Agent** | OCR verification, tampering & blur analysis | `verify_document` | `VERIFIED` → KYC; `FAILED` → Human Review |
| **KYC Agent** | Sanctions screening, PEP & biometric liveness | `verify_identity` | `VERIFIED` → Risk; `PARTIAL` → Review; `FAILED` → Rejection |
| **Risk Agent** | Bureau scoring & Debt-to-Income calculation | `get_credit_profile`, `calculate_risk` | `LOW` → Fraud; `MEDIUM`/`HIGH` → Review Escalation |
| **Fraud Agent** | Velocity, duplicate, & anomaly detection | `check_fraud_indicators` | `LOW` → Compliance; `HIGH` → Security Rejection |
| **Compliance Agent** | Vector policy search & regulatory checks | `search_banking_policy`, `check_compliance` | `PASS` → Decision; `REVIEW` → Human Review |
| **Decision Agent** | Multi-criteria synthesis & explainable output | `create_audit_record` | Synthesizes scores with deterministic matrix |
| **Response Agent** | Secure communication generation | `send_notification` | Dispatches customer & internal briefs |

---

## 🛠 11 Deterministic Banking Tools

1. `get_customer_profile` — Synthetic demographic and financial profile retrieval.
2. `verify_document` — OCR extraction, tamper detection, and field matching.
3. `verify_identity` — KYC sandbox API for sanctions screening and watchlist checks.
4. `get_credit_profile` — Credit bureau inquiry with score and payment performance.
5. `calculate_risk` — Deterministic mathematical risk calculation (DTI, debt obligations).
6. `check_fraud_indicators` — Anomaly detection, disposable domains, and duplicate applications.
7. `check_compliance` — Regulatory validation against CDD, AML, and age restrictions.
8. `search_banking_policy` — Vector semantic search across banking policies (`pgvector` compatible).
9. `get_realtime_external_data` — Live foreign exchange (FX) and central bank benchmark rates.
10. `send_notification` — Customer notification dispatcher avoiding sensitive data leakage.
11. `create_audit_record` — Cryptographic ledger logging with SHA-256 hash.

---

## 🚀 Demonstration Scenarios

- **Scenario 1: Normal Low-Risk Approval**: Clean document, zero sanctions, 760 credit score, low DTI → Fast-track approval recommendation.
- **Scenario 2: Document Discrepancy & Review**: OCR name discrepancy & moderate debt ratio → Routes to Human Reviewer queue.
- **Scenario 3: Suspicious Application**: Tampered document flags and sanctions watch-list match → Immediate security escalation & rejection.
- **Scenario 4: Real-Time API Outage & Recovery**: Simulates upstream market API outage; circuit breaker trips, tool fails over to cached reserves gracefully without crashing.

---

## ⚡ Deployment & Running

### Local Development (Frontend + Python Backend)

You will need to run the frontend and backend in two separate terminals.

**Terminal 1 (Frontend):**
```bash
npm install
npm run dev
```
*This will start the React Vite frontend on `http://localhost:3000`.*

**Terminal 2 (Backend):**
```bash
.\venv\Scripts\activate
python run_python_app.py
```
*This will start the Python backend API on `http://localhost:8000`.*

### Docker Compose
```bash
docker-compose up --build
```
Includes `app` on port 3000, `postgres` with `pgvector` on port 5432, and `redis` on port 6379.
