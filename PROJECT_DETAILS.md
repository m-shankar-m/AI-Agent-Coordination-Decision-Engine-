# Aegis Banking Multi-Agent AI Decision Engine

## Overview
Aegis Banking Multi-Agent AI Decision Engine is an enterprise-level, full-stack application designed to automate and augment banking decision-making and risk underwriting processes. It utilizes a multi-agent workflow architecture to handle customer applications, verify identities, assess credit risk, ensure compliance, and make final decisions.

## Architecture

The project follows a modern client-server architecture:

### 1. Backend (Python / FastAPI)
The backend is powered by FastAPI, providing a robust, asynchronous RESTful API and Server-Sent Events (SSE) streaming capabilities.

#### Key Components:
- **Multi-Agent System (`backend/agents/`)**: The core of the decision engine.
  - **Intake Agent**: Handles initial application ingestion and profile building.
  - **Document / Compliance Agent**: Verifies identity documents (OCR, tampering detection, blur scoring) and checks against AML (Anti-Money Laundering), OFAC, and PEP registries.
  - **Credit Risk Agent**: Evaluates financial standing, calculating metrics like Debt-to-Income (DTI) ratio based on predefined standards (e.g., Dodd-Frank).
  - **Decision Agent**: Consolidates findings from all other agents to issue a final recommendation (Approve, Reject, or Route for Human Review).
  - **Planning/Orchestrator Agent**: Analyzes the application, computes the dependency DAG, and routes the execution across different agents dynamically.

- **Workflows (`backend/workflows/`)**:
  - `multi_agent_engine.py`: Manages the state and execution trace of active workflows.
  - `decision_graph.py`: Defines the execution flow and rules routing the logic between agents.
  - `risk_engines.py`: Contains algorithms for numerical risk assessments.

- **Memory and Knowledge Base (`backend/memory/`)**:
  - `vector_store.py`: A semantic vector store using cosine similarity search. It stores banking policies, regulatory guidance (e.g., KYC, AML), and fraud protocols. Agents use this to fetch relevant legal and compliance contexts dynamically.

- **Database (`backend/db/`)**:
  - MongoDB is used for persistence, storing application data, human reviews, audit logs, and system states. Synthetic data generation is also integrated for testing and demonstrations.

### 2. Frontend (React / Vite)
The frontend is a modern web application designed for banking personnel to monitor workflows and review flagged applications.
- **Framework**: React 19 via Vite.
- **Styling**: Tailwind CSS for rapid and responsive UI development.
- **Icons**: Lucide React.
- **Animations**: Motion (Framer Motion).

## Workflow Execution
1. **Application Submission**: An application is submitted via the API.
2. **Orchestration**: The Planning Agent initializes the workflow, creating a state that acts as short-term memory (tracking documents, customer data, and execution traces).
3. **Agent Graph Execution**: The system routes the application through the required specialized agents (Document, Compliance, Credit Risk).
4. **Knowledge Retrieval**: Agents query the `vector_store` for relevant policies to guide their validation logic.
5. **Decision & Routing**: The Decision Agent provides a final recommendation. Applications with discrepancies, document tampering, or high risk are flagged for "REVIEW_REQUIRED".
6. **Audit & Logging**: The entire execution path, along with timestamps and agent reasoning, is persisted for auditability.

## Testing and Quality Assurance
The backend includes a comprehensive test suite (`backend/tests/`) built with `pytest`, covering core functionalities like banking tools and risk engine calculations. 

## Technical Stack
- **Language**: Python 3.14 (Backend), TypeScript/JavaScript (Frontend)
- **API Framework**: FastAPI
- **Frontend Framework**: React, Vite
- **Database**: MongoDB
- **Testing**: Pytest
- **Styling**: TailwindCSS
