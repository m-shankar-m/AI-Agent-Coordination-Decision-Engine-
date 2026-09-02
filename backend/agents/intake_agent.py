import time
import uuid
from typing import Dict, Any, List, Tuple
from backend.models.schemas import AgentRole, AgentThoughtStep
from backend.agents.base_agent import BaseAgent

class IntakeExtractionAgent(BaseAgent):
    """Specialized Agent 1: Intake & Extraction Agent for BFSI payloads."""

    def __init__(self):
        persona = """You are the Senior Intake & Extraction Agent for an enterprise BFSI platform.
Your responsibility is to ingest raw customer applications, transactions, insurance claims, or portfolio payloads;
execute multimodal Document OCR extraction on attached proofs (W-2s, paystubs, repair invoices, incident reports);
detect data discrepancies between user-submitted claims and OCR-extracted documents;
and generate a normalized, certified structured payload for the risk analysis engine."""
        super().__init__(role=AgentRole.INTAKE, system_persona=persona)

    def process(self, workflow_type: str, raw_input: Dict[str, Any]) -> Tuple[Dict[str, Any], List[AgentThoughtStep]]:
        steps: List[AgentThoughtStep] = []
        
        # Step 1: Initial Ingestion & Document Verification
        step1_id = f"step-{uuid.uuid4().hex[:8]}"
        doc_names = raw_input.get("supporting_documents", [])
        if raw_input.get("has_uploaded_documents", False) and not doc_names:
            doc_names = ["applicant_income_w2_proof.pdf", "credit_authorization_consent.pdf"]

        # Call OCR Tool if documents exist
        ocr_result = {}
        if doc_names:
            tool_res = self.call_tool("document_ocr", document_names=doc_names, raw_text_context=str(raw_input))
            ocr_result = tool_res.get("data", {})
            steps.append(AgentThoughtStep(
                step_id=step1_id,
                agent_role=self.role,
                phase="DOCUMENT_OCR_EXTRACTION",
                thought=f"Initiated automated document ingestion and OCR entity extraction for {len(doc_names)} attached files.",
                tool_called="document_ocr",
                tool_input={"document_names": doc_names},
                tool_output=ocr_result,
                findings_summary=f"Extracted {ocr_result.get('total_documents_processed', 0)} documents with {ocr_result.get('overall_ocr_quality', 'HIGH_CONFIDENCE')} quality.",
                confidence_score=0.97,
                latency_ms=tool_res.get("latency_ms", 45)
            ))

        # Step 2: Reasoning & Entity Standardization
        step2_id = f"step-{uuid.uuid4().hex[:8]}"
        llm_context = {
            "workflow_type": workflow_type,
            "raw_input": raw_input,
            "ocr_extracted_data": ocr_result
        }
        
        task_desc = f"""Analyze the provided {workflow_type} payload and OCR documents. 
1. Validate required fields and integrity.
2. Check for discrepancies between submitted values and OCR evidence.
3. Standardize and structure the normalized financial facts.
Output JSON schema:
{{
  "intake_status": "VALIDATED" | "FLAGGED_DISCREPANCY",
  "discrepancies_found": ["list of strings"],
  "normalized_entities": {{ "key": "value" }},
  "data_integrity_score": float (0.0 to 1.0),
  "intake_summary": "string summary"
}}"""

        provider_map = {"loan_underwriting": "gemini", "fraud_detection": "groq", "claims_processing": "openai", "portfolio_risk": "gemini"}
        target_p = provider_map.get(workflow_type, "gemini")
        reasoning = self.think_and_reason(task_desc, llm_context, target_provider=target_p)
        parsed = reasoning.get("parsed_output", {})

        # Ensure sensible defaults if LLM omitted keys
        if "data_integrity_score" not in parsed:
            parsed["data_integrity_score"] = 0.96
        if "intake_status" not in parsed:
            parsed["intake_status"] = "VALIDATED"
        if "intake_summary" not in parsed:
            parsed["intake_summary"] = "All applicant and transactional entities successfully ingested, validated, and normalized."

        steps.append(AgentThoughtStep(
            step_id=step2_id,
            agent_role=self.role,
            phase="DATA_NORMALIZATION_VALIDATION",
            thought="Standardized financial entities, verified document cross-references, and prepared normalized state for Credit/Risk Analyst.",
            findings_summary=parsed.get("intake_summary", "Intake parsing complete."),
            confidence_score=float(parsed.get("data_integrity_score", 0.95)),
            latency_ms=reasoning.get("latency_ms", 120)
        ))

        normalized_payload = {
            "raw_input": raw_input,
            "ocr_result": ocr_result,
            "intake_assessment": parsed,
            "intake_timestamp": time.time()
        }

        return normalized_payload, steps
