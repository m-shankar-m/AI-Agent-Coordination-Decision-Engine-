# 🏛️ Enterprise BFSI AI Agent Coordination & Decision Engine

An enterprise-grade autonomous multi-agent coordination and decision intelligence platform tailored for the **Banking, Financial Services & Insurance (BFSI)** domain.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5+-646CFF.svg?logo=vite)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?logo=python)](https://python.org)
[![Tests](https://img.shields.io/badge/Pytest-Passing-brightgreen.svg?logo=pytest)](https://docs.pytest.org)

---

## 🌟 Key Features

- **4 Core BFSI Workflows:**
  1. **💵 Loan Underwriting**: Automated W-2/paystub extraction, Debt-to-Income (DTI) computation, Loan-to-Value (LTV) limits, and OCC Qualified Mortgage (QM) 43% compliance.
  2. **🚨 Fraud Detection & AML Screening**: Sub-second transaction velocity profiling, Z-score anomaly scoring, OFAC sanctions / PEP watchlist screening, and automated FinCEN SAR drafting.
  3. **🛡️ Insurance Claims Processing**: Line-item OCR cross-validation (repair estimates vs. police reports), statutory deductible auditing, and settlement decisions.
  4. **📉 Portfolio Risk Analysis**: Multi-asset portfolio deconstruction, 95% Daily Value at Risk (VaR), macroeconomic stress modeling (+250 bps interest rate shocks), and Basel III CET1 capital buffer auditing.

- **Dedicated Multi-LLM Routing:**
  - 💵 **Loan Underwriting** ➔ **Google Gemini API** (`gemini-2.5-flash`)
  - 🚨 **Fraud & AML** ➔ **Groq Cloud API** (`qwen/qwen3.8-27b`)
  - 🛡️ **Insurance Claims** ➔ **OpenAI API** (`gpt-4o-mini`)
  - 📉 **Portfolio Risk** ➔ **Google Gemini API** (`gemini-2.5-flash`)
  - *Includes deterministic heuristic fallback for 100% operational uptime.*

- **Hybrid Agent Memory & Shared Blackboard:**
  - Short-term session blackboard enabling sequential state enrichment across specialized agents.
  - Persistent JSON audit ledger tracking every decision, latency (ms), confidence score, and human override.

- **Interactive Visual Studio UI:**
  - Modern dark-mode dashboard with interactive visual form boxes (no JSON editing required).
  - Dynamic agent topology graph visualizing active agent states, tools, and latencies in real time.
  - Real-time thought streaming terminal via WebSockets.
  - Human-in-the-Loop (HITL) compliance review queue for borderline risk escalation.

---

## 🏗️ Architecture

```
+---------------------------------------------------------------------------------------------------------+
|                                    MULTI-AGENT SYSTEM TOPOLOGY                                          |
+---------------------------------------------------------------------------------------------------------+
|  [ Multi-LLM Gateway: Gemini 2.5 Flash | Groq Cloud Qwen 3.8 | OpenAI GPT-4o ]                          |
|                                                     |                                                   |
|                                       [ Shared Blackboard Memory ]                                      |
|                                                     |                                                   |
|      +---------------------+------------------------+------------------------+-------------------+      |
|      |                     |                        |                        |                   |      |
|      v                     v                        v                        v                   |      |
|  [ Phase 1: Intake ] -> [ Phase 2: Risk ]    -> [ Phase 3: Compliance ] -> [ Phase 4: Decision ]     |      |
|  (OCR & Validation)    (Quantitative Models)   (Statutes & Policies)    (Arbitration & HITL)    |      |
|      |                     |                        |                        |                   |      |
|      +---------------------+------------------------+------------------------+-------------------+      |
|                                                     |                                                   |
|              [ External Tools: Core Banking, Credit Bureau, OFAC AML, Policy Vector DB ]                |
+---------------------------------------------------------------------------------------------------------+
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/m-shankar-m/AI-Agent-Coordination-Decision-Engine-.git
cd AI-Agent-Coordination-Decision-Engine-
```

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env` and add your API keys:
```bash
cp .env.example backend/.env
```

### 3. Install Dependencies & Run Backend
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI backend server (Port 8000)
py -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000
```

### 4. Install Dependencies & Run Frontend
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

### 5. Access the Web Dashboard
Open your browser and navigate to:
👉 **`http://localhost:5173`**

---

## 🧪 Running Automated Tests

Run the complete 6-suite integration test pipeline:
```bash
py -m pytest backend/tests/test_multiagent_engine.py -v
```

---

## 📄 License
MIT License
