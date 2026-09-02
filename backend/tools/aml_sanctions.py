from typing import Dict, Any, List

class AMLSanctionsTool:
    """Anti-Money Laundering (AML), OFAC Sanctions, and PEP Screening Tool."""

    name = "aml_sanctions_screener"
    description = "Screens transactions and counterparties against OFAC SDN, UN/EU sanctions, PEP lists, and FATF high-risk jurisdictions."

    # Known high risk countries/jurisdictions (FATF lists)
    HIGH_RISK_JURISDICTIONS = {
        "cayman islands": "FATF Monitored Offshore Financial Center",
        "panama": "FATF Enhanced Scrutiny Jurisdiction",
        "north korea": "FATF Blacklisted High-Risk Jurisdiction",
        "iran": "FATF Blacklisted High-Risk Jurisdiction",
        "myanmar": "FATF High-Risk Jurisdiction",
        "russia": "OFAC Comprehensive Sanctions Regime",
        "syria": "OFAC Comprehensive Sanctions Regime"
    }

    # Sample known sanctioned / PEP entities
    SANCTIONED_ENTITIES = [
        "silver crest ventures spv",
        "darkwater maritime ltd",
        "phantom capital llc",
        "vladimir petrov trading",
        "al-baraka export global"
    ]

    def execute(
        self,
        customer_name: str,
        counterparty_name: str,
        amount: float,
        origin_country: str,
        destination_country: str,
        historical_avg_amount: float,
        velocity_24h: int,
        ip_address: str = "",
        device_id: str = ""
    ) -> Dict[str, Any]:
        
        dest_lower = (destination_country or "").lower().strip()
        counterparty_lower = (counterparty_name or "").lower().strip()
        customer_lower = (customer_name or "").lower().strip()

        sanction_match = False
        sanction_details = []
        for entity in self.SANCTIONED_ENTITIES:
            if entity in counterparty_lower or entity in customer_lower:
                sanction_match = True
                sanction_details.append(f"Entity '{entity.title()}' matched OFAC/SDN Restricted List.")

        jurisdiction_risk = self.HIGH_RISK_JURISDICTIONS.get(dest_lower, None)
        
        # Velocity and amount spike calculation
        amount_ratio = amount / max(1.0, historical_avg_amount)
        high_velocity = velocity_24h >= 6
        extreme_spike = amount_ratio >= 10.0

        anomalies = []
        if sanction_match:
            anomalies.append("OFAC/PEP Sanction Watchlist Direct Match")
        if jurisdiction_risk:
            anomalies.append(f"Destination jurisdiction '{destination_country}' flagged: {jurisdiction_risk}")
        if extreme_spike:
            anomalies.append(f"Transaction amount (${amount:,.2f}) is {amount_ratio:.1f}x higher than historical baseline (${historical_avg_amount:,.2f})")
        if high_velocity:
            anomalies.append(f"Abnormal transaction frequency ({velocity_24h} transactions initiated within 24h)")
        if "tor" in device_id.lower() or "proxy" in device_id.lower():
            anomalies.append(f"Anonymizing proxy / Tor exit node network fingerprint detected ({ip_address})")

        # Composite risk score (0-100)
        risk_score = 10.0
        if sanction_match:
            risk_score += 65.0
        if jurisdiction_risk:
            risk_score += 25.0
        if extreme_spike:
            risk_score += 20.0
        if high_velocity:
            risk_score += 15.0
        if "tor" in device_id.lower() or "proxy" in device_id.lower():
            risk_score += 15.0

        risk_score = min(100.0, risk_score)

        return {
            "sanction_match": sanction_match,
            "sanction_details": sanction_details,
            "jurisdiction_risk_level": "HIGH" if jurisdiction_risk else "STANDARD",
            "jurisdiction_notes": jurisdiction_risk or "Standard low-risk jurisdiction",
            "amount_spike_ratio": round(amount_ratio, 2),
            "anomaly_count": len(anomalies),
            "anomaly_list": anomalies,
            "computed_aml_risk_score": round(risk_score, 1),
            "requires_sar_filing": risk_score >= 70.0
        }
