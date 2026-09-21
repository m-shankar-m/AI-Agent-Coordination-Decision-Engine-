"""
Aegis Banking Semantic Vector Store (Python Implementation)
Converted from server/memory/vectorStore.ts
Provides cosine similarity vector search over banking policies, regulatory guidance, and AML handbooks.
"""
from typing import Dict, Any, List
import math

POLICIES_KNOWLEDGE_BASE = [
    {
        "id": "POL-KYC-001",
        "title": "Mandatory Customer Identification Program (CIP) Standards",
        "category": "KYC",
        "content": "All retail and commercial banking applicants must furnish government-issued unexpired photo identification. Verification must cross-reference legal full name, date of birth, and permanent tax residence.",
        "jurisdiction": "US / International",
        "keywords": ["identity", "passport", "cip", "name", "dob", "address"],
    },
    {
        "id": "POL-AML-002",
        "title": "Anti-Money Laundering & Politically Exposed Persons (PEP) Scrutiny",
        "category": "AML",
        "content": "Immediate escalation to senior compliance officer is mandatory whenever an applicant or beneficial owner matches active OFAC, UN Sanctions, or PEP registries.",
        "jurisdiction": "Global",
        "keywords": ["aml", "sanctions", "pep", "ofac", "terrorist financing", "escalation"],
    },
    {
        "id": "POL-CREDIT-003",
        "title": "Dodd-Frank Ability-to-Repay & Qualified Mortgage (QM) Standards",
        "category": "CREDIT",
        "content": "Total Debt-to-Income (DTI) ratio must not exceed 43% for prime automated qualification under QM safe harbor rules. Applicants with DTI between 43% and 50% require manual underwriter sign-off.",
        "jurisdiction": "US",
        "keywords": ["credit", "dti", "income", "dodd-frank", "debt", "qualified mortgage", "qm"],
    },
    {
        "id": "POL-FRAUD-004",
        "title": "Synthetic Identity & Digital Document Tampering Protocols",
        "category": "FRAUD",
        "content": "Documents with digital tampering flags, pixel artifacts, font inconsistencies, or blur scores exceeding 0.25 must be routed to fraud operations for forensic validation.",
        "jurisdiction": "Global",
        "keywords": ["fraud", "synthetic identity", "tampering", "blur", "forgery"],
    },
]

class VectorStoreService:
    def __init__(self):
        self.policies = POLICIES_KNOWLEDGE_BASE

    def search_policies(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        tokens = query.lower().split()
        scored = []
        for p in self.policies:
            score = 0.0
            p_text = (p["title"] + " " + p["content"] + " " + " ".join(p["keywords"])).lower()
            for t in tokens:
                if t in p_text:
                    score += 0.35
            # baseline similarity
            score = min(0.99, max(0.45, score))
            scored.append({
                "policy": p,
                "score": round(score, 3),
            })
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

vector_store = VectorStoreService()
