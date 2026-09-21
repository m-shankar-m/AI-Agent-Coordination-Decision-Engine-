# Aegis Banking Multi-Agent AI Decision Engine (Python / FastAPI Backend)

This repository contains the complete Python & FastAPI implementation of the Aegis Banking Multi-Agent Autonomous Decision Engine.

## Architecture Overview

- **FastAPI Core (`backend/server.py`)**: High-performance asynchronous REST API handling customer applications, supervisory human reviews, live SSE streams, and audit logging.
- **Pydantic Schemas (`backend/app/schemas/banking.py`)**: Strict regulatory schemas for customer profiles, document analysis, sanctions/KYC screening, deterministic credit risk calculation, and compliance.
- **Multi-Agent State Graph (`backend/app/workflows/decision_graph.py`)**: LangGraph workflow orchestrating Planning, Document, KYC, Risk, Fraud, Compliance, Decision, and Response agents.
- **Quantitative Risk & Basel III Engines (`backend/app/workflows/risk_engines.py`)**: Pure Python calculations for Dodd-Frank OCC Qualified Mortgage (QM), DTI/LTV ratios, Basel III CET1 Capital Ratios, Duration Shock, and 99% Value-at-Risk (VaR).

## How to Run Python Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

## Running Tests

```bash
pytest
```
