from typing import Dict, Any, List
import re

class PolicyRetrieverTool:
    """Vector Knowledge & Policy Search Tool for Banking, Regulatory & Insurance Guidelines."""

    name = "policy_knowledge_retriever"
    description = "Searches the vector knowledge base of banking regulations (Basel III, OCC, RBI, FinCEN, AML/BSA) and insurance policy clauses for compliance evaluation."

    # Regulatory and policy corpus
    POLICY_DATABASE = [
        {
            "doc_id": "REG-OCC-LEND-401",
            "title": "OCC Residential Underwriting Standards & DTI Limits",
            "category": "Banking / Underwriting",
            "regulatory_body": "Office of the Comptroller of the Currency (OCC) / CFPB",
            "keywords": ["dti", "debt", "income", "mortgage", "underwriting", "ltv", "credit score", "ratio", "loan"],
            "clause_text": "Qualified Mortgages (QM) require total Debt-to-Income (DTI) ratio not exceeding 43.0%. Exceptions up to 45.0% permitted only with documented prime credit scores (>= 720) and verified liquid reserves >= 6 months. Maximum Loan-to-Value (LTV) exceeding 80.0% mandates Private Mortgage Insurance (PMI) escrow."
        },
        {
            "doc_id": "REG-FINCEN-AML-102",
            "title": "FinCEN Bank Secrecy Act & SAR Filing Mandate",
            "category": "AML / Compliance",
            "regulatory_body": "Financial Crimes Enforcement Network (FinCEN)",
            "keywords": ["aml", "sanction", "sar", "fincen", "wire", "ofac", "velocity", "launder", "offshore", "fraud", "spike"],
            "clause_text": "Financial institutions must file a Suspicious Activity Report (SAR) within 30 days for any transaction over $5,000 involving potential money laundering, OFAC list intersections, shell entity intermediaries, or uncharacteristic velocity spikes lacking verifiable commercial justification. Transactions involving sanctioned persons must be immediately frozen."
        },
        {
            "doc_id": "REG-BASEL-III-CAP-305",
            "title": "Basel III Capital Adequacy & Liquidity Coverage Framework",
            "category": "Portfolio Risk / Prudential",
            "regulatory_body": "Basel Committee on Banking Supervision (BCBS)",
            "keywords": ["basel", "capital", "adequacy", "var", "stress", "liquidity", "lcr", "tier 1", "cet1", "risk-weighted", "portfolio"],
            "clause_text": "Institutions must maintain a minimum Common Equity Tier 1 (CET1) ratio of 4.5%, Total Tier 1 of 6.0%, and a Capital Conservation Buffer of 2.5% (Total 10.5%). Daily Value at Risk (VaR 99% / 95%) and stress loss projections exceeding 15% of portfolio book value trigger mandatory risk-weighted asset rebalancing and capital reserve augmentation."
        },
        {
            "doc_id": "POL-INS-AUTO-COLL-708",
            "title": "Comprehensive Motor Vehicle Collision Adjudication Standards",
            "category": "Insurance Claims",
            "regulatory_body": "State Insurance Commissioner Standards",
            "keywords": ["claim", "insurance", "collision", "deductible", "payout", "damage", "repair", "accident", "police"],
            "clause_text": "Claims under Comprehensive Collision Coverage are payable upon certified third-party repair invoice verification and official law enforcement accident report matching. Standard deductible of $1,000 applies to gross approved claim. Exclusions apply if unauthorized commercial transport was active at time of incident or if deliberate fraud / pre-existing structural wear is determined."
        },
        {
            "doc_id": "REG-KYC-CIP-009",
            "title": "Customer Identification Program (CIP) & Beneficial Ownership Norms",
            "category": "Compliance / KYC",
            "regulatory_body": "Federal Reserve & Financial Action Task Force (FATF)",
            "keywords": ["kyc", "cip", "beneficial", "owner", "identity", "corporate", "spv", "entity"],
            "clause_text": "Accounts engaging in high-value wire transactions (> $250,000) with Special Purpose Vehicles (SPVs) or offshore shell entities must disclose 25%+ beneficial ownership and undergo enhanced due diligence (EDD) before settlement release."
        }
    ]

    def execute(self, query: str, category: str = "", top_k: int = 2) -> Dict[str, Any]:
        query_words = set(re.findall(r'\w+', query.lower()))
        
        scored_docs = []
        for doc in self.POLICY_DATABASE:
            score = 0.0
            # Keyword matching score
            for kw in doc["keywords"]:
                if kw in query_words or any(kw in qw for qw in query_words):
                    score += 2.0
            
            # Content match score
            content_lower = doc["clause_text"].lower()
            for qw in query_words:
                if len(qw) > 3 and qw in content_lower:
                    score += 0.5

            if category and category.lower() in doc["category"].lower():
                score += 3.0

            if score > 0:
                relevance = min(0.99, max(0.60, score / 6.0))
                scored_docs.append({
                    "doc_id": doc["doc_id"],
                    "title": doc["title"],
                    "category": doc["category"],
                    "regulatory_body": doc["regulatory_body"],
                    "relevance_score": round(relevance, 2),
                    "clause_text": doc["clause_text"]
                })

        # Sort by score descending
        scored_docs.sort(key=lambda x: x["relevance_score"], reverse=True)
        results = scored_docs[:top_k] if scored_docs else [{
            "doc_id": "GEN-PRUDENCE-001",
            "title": "General Institutional Prudence & Risk Governance",
            "category": "Governance",
            "regulatory_body": "Internal Risk Committee",
            "relevance_score": 0.75,
            "clause_text": "All transactions, credit underwriting decisions, and insurance claim approvals must adhere to strict fiduciary duty and regulatory transparency."
        }]

        return {
            "query": query,
            "matched_policy_count": len(results),
            "policies": results
        }
