import os
from typing import Dict, Any, List
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from pydantic import BaseModel, Field

load_dotenv()

class DecisionOutput(BaseModel):
    decision: str = Field(description="One of: APPROVAL_RECOMMENDATION, HUMAN_REVIEW_RECOMMENDED, REJECTION_RECOMMENDATION")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")
    reason: str = Field(description="A short explanation for the decision")

async def evaluate_application(customer_data: Dict[str, Any], documents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Uses LangChain and Gemini to evaluate the application asynchronously, with API key fallback."""
    api_keys = []
    
    if os.environ.get("GEMINI_API_KEY"):
        api_keys.append(os.environ.get("GEMINI_API_KEY"))
        
    idx = 1
    while os.environ.get(f"GEMINI_API_KEY_{idx}"):
        api_keys.append(os.environ.get(f"GEMINI_API_KEY_{idx}"))
        idx += 1
        
    if not api_keys:
        return {
            "decision": "HUMAN_REVIEW_RECOMMENDED",
            "confidence": 0.5,
            "reason": "System Error: Missing Gemini API Key."
        }
    
    last_error = None
    import asyncio
    import random
    
    random.shuffle(api_keys)
    
    for api_key in api_keys:
        try:
            # Added max_retries=2 to gracefully handle temporary 503 overloaded errors
            llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1, google_api_key=api_key, max_retries=2)
            structured_llm = llm.with_structured_output(DecisionOutput)
            
            system_prompt = (
                "You are an expert AI Banking Underwriter. "
                "Evaluate the provided customer profile and identity documents. "
                "Determine if the application should be approved, rejected, or sent for human review. "
                "Rules:\n"
                "- If credit score < 600 or PEP status is true or document is tampered -> REJECT.\n"
                "- If credit score is 600-700 or document has high blur score or document mismatch is true -> HUMAN REVIEW.\n"
                "- Otherwise -> APPROVE."
            )
            
            human_prompt = f"Customer Data: {customer_data}\n\nDocuments: {documents}"
            
            result = await structured_llm.ainvoke([
                SystemMessage(content=system_prompt),
                HumanMessage(content=human_prompt)
            ])
            
            return {
                "decision": result.decision,
                "confidence": result.confidence,
                "reason": result.reason
            }
        except Exception as e:
            last_error = e
            continue
            
    return {
        "decision": "HUMAN_REVIEW_RECOMMENDED",
        "confidence": 0.0,
        "reason": f"LLM Error (All {len(api_keys)} keys failed): {repr(last_error)}"
    }
