import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  UploadCloud, 
  SlidersHorizontal, 
  CheckCircle, 
  AlertOctagon, 
  FileText,
  DollarSign,
  TrendingDown,
  User,
  Building,
  Globe,
  Shield,
  Clock,
  Plus,
  Trash2,
  CheckSquare
} from 'lucide-react';
import LiveReasoningStream from './LiveReasoningStream';
import DecisionView from './DecisionView';

export default function WorkflowStudio({ 
  onRunWorkflow, 
  isRunning, 
  currentSteps, 
  workflowResult, 
  onResolveHitl,
  selectedWorkflow,
  setSelectedWorkflow
}) {
  const [scenarios, setScenarios] = useState({});
  const [selectedScenarioId, setSelectedScenarioId] = useState('');

  // --- Visual Form State: Loan Underwriting ---
  const [loanForm, setLoanForm] = useState({
    applicant_id: "APP-2026-9041",
    applicant_name: "Alexander Wright",
    annual_income: 145000,
    requested_amount: 380000,
    loan_purpose: "Residential Mortgage - Primary Residence",
    loan_tenure_months: 360,
    monthly_debt_obligations: 2100,
    collateral_type: "Single Family Real Estate",
    collateral_estimated_value: 520000,
    has_uploaded_documents: true,
    document_notes: "W-2 tax returns, recent 3-month pay stubs, appraisal report attached."
  });

  // --- Visual Form State: Fraud Detection ---
  const [fraudForm, setFraudForm] = useState({
    transaction_id: "TXN-8849-0192",
    account_id: "ACC-992014-CORP",
    customer_name: "Meridian Trade Logistics Ltd",
    amount: 485000,
    currency: "USD",
    transaction_type: "Cross-Border International Wire",
    origin_country: "United States",
    destination_country: "Cayman Islands",
    destination_bank: "First Offshore Horizon Bank",
    beneficiary_name: "Silver Crest Ventures SPV",
    ip_address: "185.220.101.5",
    device_id: "DEV-PROXY-TOR-99",
    user_historical_avg_amount: 24000,
    velocity_last_24h_count: 8,
    is_weekend_or_holiday: true,
    notes: "Urgent high-value payment transfer initiated at 02:45 AM local time"
  });

  // --- Visual Form State: Claims Processing ---
  const [claimsForm, setClaimsForm] = useState({
    claim_id: "CLM-2026-7712",
    policy_id: "POL-AUTO-99824",
    claimant_name: "Elena Rostova",
    incident_date: "2026-08-24",
    claim_type: "Comprehensive Motor Vehicle Collision",
    total_claimed_amount: 28500,
    incident_location: "Interstate 80 Milepost 44",
    police_report_filed: true,
    police_report_number: "PR-NV-2026-0881",
    incident_description: "Rear-end collision during sudden brake wave on wet highway.",
    has_prior_claims_count: 1,
    damage_items: [
      { item_description: "Front & Rear Bumper Replacement", claimed_cost: 7800, invoiced_receipt_match: true },
      { item_description: "Radiator & Sensor Assembly", claimed_cost: 6200, invoiced_receipt_match: true },
      { item_description: "Frame Realignment & Labor", claimed_cost: 14500, invoiced_receipt_match: true }
    ],
    supporting_documents: ["repair_estimate_certified.pdf", "police_accident_report.pdf"]
  });

  // --- Visual Form State: Portfolio Risk ---
  const [portfolioForm, setPortfolioForm] = useState({
    portfolio_id: "PORT-INST-502",
    institution_name: "Global Prime Asset Management",
    total_portfolio_value: 125000000,
    macro_stress_scenario: "Interest Rate Spike (+250 bps) & Tech Sector Correction (-22%)",
    holdings: [
      { asset_name: "US Treasury 10Y Benchmark", asset_class: "Sovereign Bond", weight_pct: 35.0, market_value: 43750000, credit_rating: "AAA", duration_years: 8.2, sector: "Government" },
      { asset_name: "MegaCap Tech Growth Equity Basket", asset_class: "Equity", weight_pct: 30.0, market_value: 37500000, credit_rating: "AA", duration_years: 0.0, sector: "Technology" },
      { asset_name: "Investment Grade Corporate Credit ETF", asset_class: "Corporate Bond", weight_pct: 20.0, market_value: 25000000, credit_rating: "BBB", duration_years: 5.4, sector: "Financials" },
      { asset_name: "Commercial Real Estate Debt Trust", asset_class: "Real Estate", weight_pct: 10.0, market_value: 12500000, credit_rating: "BB", duration_years: 6.8, sector: "Real Estate" },
      { asset_name: "Liquid Cash & Overnight Repo", asset_class: "Cash Equivalent", weight_pct: 5.0, market_value: 6250000, credit_rating: "AAA", duration_years: 0.1, sector: "Treasury Cash" }
    ]
  });

  const workflows = [
    { id: 'loan_underwriting', label: 'Loan Underwriting', icon: DollarSign, color: '#00f2fe', apiName: 'Google Gemini API', apiBadge: 'Google Gemini API' },
    { id: 'fraud_detection', label: 'Fraud & AML Screening', icon: AlertOctagon, color: '#f43f5e', apiName: 'Groq Cloud API', apiBadge: 'Groq Cloud API' },
    { id: 'claims_processing', label: 'Claims Adjudication', icon: FileText, color: '#a855f7', apiName: 'OpenAI API', apiBadge: 'OpenAI API' },
    { id: 'portfolio_risk', label: 'Portfolio Risk Analysis', icon: TrendingDown, color: '#38bdf8', apiName: 'Google Gemini API', apiBadge: 'Google Gemini API' }
  ];

  // Fetch presets on load
  useEffect(() => {
    fetch('http://localhost:8000/api/workflows/sample-scenarios')
      .then(res => res.json())
      .then(data => {
        setScenarios(data);
        if (data[selectedWorkflow] && data[selectedWorkflow].length > 0) {
          const first = data[selectedWorkflow][0];
          setSelectedScenarioId(first.id);
          applyPresetToForm(selectedWorkflow, first.payload);
        }
      })
      .catch(err => console.error("Error fetching scenarios:", err));
  }, [selectedWorkflow]);

  const applyPresetToForm = (wfId, payload) => {
    if (wfId === 'loan_underwriting') setLoanForm(payload);
    else if (wfId === 'fraud_detection') setFraudForm(payload);
    else if (wfId === 'claims_processing') setClaimsForm(payload);
    else if (wfId === 'portfolio_risk') setPortfolioForm(payload);
  };

  const handleSelectScenario = (scenario) => {
    setSelectedScenarioId(scenario.id);
    applyPresetToForm(selectedWorkflow, scenario.payload);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let currentPayload = {};
    if (selectedWorkflow === 'loan_underwriting') currentPayload = loanForm;
    else if (selectedWorkflow === 'fraud_detection') currentPayload = fraudForm;
    else if (selectedWorkflow === 'claims_processing') currentPayload = claimsForm;
    else if (selectedWorkflow === 'portfolio_risk') currentPayload = portfolioForm;

    onRunWorkflow(selectedWorkflow, currentPayload);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1.25fr', gap: '24px', alignItems: 'start' }}>
      {/* Left Column: Easy Visual Form Inputs */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* 1. Workflow Selection Buttons */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
            1. Select Workflow & Dedicated AI Engine
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {workflows.map((wf) => {
              const Icon = wf.icon;
              const isSelected = selectedWorkflow === wf.id;
              return (
                <button
                  key={wf.id}
                  type="button"
                  onClick={() => setSelectedWorkflow(wf.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '12px',
                    borderRadius: '10px',
                    background: isSelected ? `linear-gradient(135deg, ${wf.color}25, rgba(15, 23, 42, 0.8))` : 'rgba(15, 23, 42, 0.4)',
                    border: isSelected ? `2px solid ${wf.color}` : '1px solid rgba(255,255,255,0.06)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Icon size={18} color={isSelected ? wf.color : 'var(--text-muted)'} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{wf.label}</span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? wf.color : 'var(--text-muted)',
                    background: isSelected ? `${wf.color}20` : 'rgba(255,255,255,0.04)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    width: 'fit-content'
                  }}>
                    ⚡ Powered by {wf.apiBadge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. One-Click Quick Presets */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              2. Quick Scenario Presets
            </label>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>Auto-fills boxes below</span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {(scenarios[selectedWorkflow] || []).map((sc) => {
              const isSelected = selectedScenarioId === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => handleSelectScenario(sc)}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(10, 15, 30, 0.6)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)',
                    color: isSelected ? '#38bdf8' : '#e2e8f0',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div>{sc.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Interactive Visual Input Boxes Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
              3. Fill in Details (Edit Any Box)
            </label>

            {/* --- FORM A: LOAN UNDERWRITING BOXES --- */}
            {selectedWorkflow === 'loan_underwriting' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      👤 Applicant Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={loanForm.applicant_name}
                      onChange={(e) => setLoanForm({ ...loanForm, applicant_name: e.target.value })}
                      placeholder="e.g. Alexander Wright"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      💼 Employer / Company
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={loanForm.employer_name || "Apex Horizon Tech Labs"}
                      onChange={(e) => setLoanForm({ ...loanForm, employer_name: e.target.value })}
                      placeholder="e.g. Apex Tech Corp"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      💵 Annual Income ($)
                    </label>
                    <input
                      type="number"
                      className="input-field font-mono"
                      value={loanForm.annual_income}
                      onChange={(e) => setLoanForm({ ...loanForm, annual_income: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      💰 Requested Loan Amount ($)
                    </label>
                    <input
                      type="number"
                      className="input-field font-mono"
                      value={loanForm.requested_amount}
                      onChange={(e) => setLoanForm({ ...loanForm, requested_amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      💳 Monthly Debt Obligations ($)
                    </label>
                    <input
                      type="number"
                      className="input-field font-mono"
                      value={loanForm.monthly_debt_obligations}
                      onChange={(e) => setLoanForm({ ...loanForm, monthly_debt_obligations: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      🏡 Collateral Estimated Value ($)
                    </label>
                    <input
                      type="number"
                      className="input-field font-mono"
                      value={loanForm.collateral_estimated_value}
                      onChange={(e) => setLoanForm({ ...loanForm, collateral_estimated_value: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      🎯 Loan Purpose
                    </label>
                    <select
                      className="input-field"
                      value={loanForm.loan_purpose}
                      onChange={(e) => setLoanForm({ ...loanForm, loan_purpose: e.target.value })}
                    >
                      <option value="Residential Mortgage - Primary Residence">Residential Mortgage</option>
                      <option value="Commercial Real Estate Loan">Commercial Real Estate</option>
                      <option value="Debt Consolidation Loan">Debt Consolidation</option>
                      <option value="Personal / Home Improvement">Home Improvement</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      ⏱️ Loan Tenure
                    </label>
                    <select
                      className="input-field"
                      value={loanForm.loan_tenure_months}
                      onChange={(e) => setLoanForm({ ...loanForm, loan_tenure_months: parseInt(e.target.value) })}
                    >
                      <option value="360">30 Years (360 Months)</option>
                      <option value="240">20 Years (240 Months)</option>
                      <option value="180">15 Years (180 Months)</option>
                      <option value="60">5 Years (60 Months)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <input
                    type="checkbox"
                    id="doc_check"
                    checked={loanForm.has_uploaded_documents}
                    onChange={(e) => setLoanForm({ ...loanForm, has_uploaded_documents: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#00f2fe' }}
                  />
                  <label htmlFor="doc_check" style={{ fontSize: '0.75rem', color: '#e2e8f0', cursor: 'pointer' }}>
                    📄 Attach Verified Income Documents (W-2, 3-Month Paystubs, Bank Statements)
                  </label>
                </div>
              </div>
            )}

            {/* --- FORM B: FRAUD & AML SCREENING BOXES --- */}
            {selectedWorkflow === 'fraud_detection' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      🏢 Origin Customer / Account Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={fraudForm.customer_name}
                      onChange={(e) => setFraudForm({ ...fraudForm, customer_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      👤 Beneficiary / Receiver Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={fraudForm.beneficiary_name}
                      onChange={(e) => setFraudForm({ ...fraudForm, beneficiary_name: e.target.value })}
                      placeholder="e.g. Silver Crest Ventures SPV"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      💰 Wire Transfer Amount ($)
                    </label>
                    <input
                      type="number"
                      className="input-field font-mono"
                      value={fraudForm.amount}
                      onChange={(e) => setFraudForm({ ...fraudForm, amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      📊 Historical Average Transaction ($)
                    </label>
                    <input
                      type="number"
                      className="input-field font-mono"
                      value={fraudForm.user_historical_avg_amount}
                      onChange={(e) => setFraudForm({ ...fraudForm, user_historical_avg_amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      🌍 Destination Country
                    </label>
                    <select
                      className="input-field"
                      value={fraudForm.destination_country}
                      onChange={(e) => setFraudForm({ ...fraudForm, destination_country: e.target.value })}
                    >
                      <option value="United States">United States (Domestic Low Risk)</option>
                      <option value="United Kingdom">United Kingdom (Standard)</option>
                      <option value="Germany">Germany (Standard)</option>
                      <option value="Cayman Islands">Cayman Islands (FATF Monitored / High Risk)</option>
                      <option value="Panama">Panama (Enhanced Scrutiny)</option>
                      <option value="Switzerland">Switzerland (Private Banking)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      ⚡ 24-Hour Velocity (Transaction Count)
                    </label>
                    <input
                      type="number"
                      className="input-field font-mono"
                      value={fraudForm.velocity_last_24h_count}
                      onChange={(e) => setFraudForm({ ...fraudForm, velocity_last_24h_count: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    🛡️ Device & Network Security Fingerprint
                  </label>
                  <select
                    className="input-field"
                    value={fraudForm.device_id}
                    onChange={(e) => setFraudForm({ ...fraudForm, device_id: e.target.value })}
                  >
                    <option value="DEV-OFFICE-MAC-01">Verified Corporate Mac (Standard Static IP)</option>
                    <option value="DEV-PROXY-TOR-99">Tor Exit Node / Anonymizing Proxy (High Anomaly)</option>
                    <option value="DEV-MOBILE-IOS">Verified Employee iOS Biometric</option>
                  </select>
                </div>
              </div>
            )}

            {/* --- FORM C: INSURANCE CLAIMS BOXES --- */}
            {selectedWorkflow === 'claims_processing' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      👤 Claimant / Policyholder Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={claimsForm.claimant_name}
                      onChange={(e) => setClaimsForm({ ...claimsForm, claimant_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      🛡️ Claim Type
                    </label>
                    <select
                      className="input-field"
                      value={claimsForm.claim_type}
                      onChange={(e) => setClaimsForm({ ...claimsForm, claim_type: e.target.value })}
                    >
                      <option value="Comprehensive Motor Vehicle Collision">Motor Vehicle Collision</option>
                      <option value="Commercial Property Damage">Property Storm/Water Damage</option>
                      <option value="Comprehensive Theft & Loss">Vehicle Theft</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      💵 Total Claimed Amount ($)
                    </label>
                    <input
                      type="number"
                      className="input-field font-mono"
                      value={claimsForm.total_claimed_amount}
                      onChange={(e) => setClaimsForm({ ...claimsForm, total_claimed_amount: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      🚓 Police Accident Report Filed?
                    </label>
                    <select
                      className="input-field"
                      value={claimsForm.police_report_filed ? "yes" : "no"}
                      onChange={(e) => setClaimsForm({ ...claimsForm, police_report_filed: e.target.value === "yes" })}
                    >
                      <option value="yes">Yes (Official Report Attached)</option>
                      <option value="no">No Police Report Filed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    📝 Incident Description
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={claimsForm.incident_description}
                    onChange={(e) => setClaimsForm({ ...claimsForm, incident_description: e.target.value })}
                    placeholder="Describe how incident occurred..."
                    required
                  />
                </div>
              </div>
            )}

            {/* --- FORM D: PORTFOLIO RISK BOXES --- */}
            {selectedWorkflow === 'portfolio_risk' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      🏛️ Institution / Asset Fund Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={portfolioForm.institution_name}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, institution_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      💼 Total Portfolio Book Value ($)
                    </label>
                    <input
                      type="number"
                      className="input-field font-mono"
                      value={portfolioForm.total_portfolio_value}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, total_portfolio_value: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    🌪️ Macroeconomic Stress Scenario
                  </label>
                  <select
                    className="input-field"
                    value={portfolioForm.macro_stress_scenario}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, macro_stress_scenario: e.target.value })}
                  >
                    <option value="Moderate Rate Adjustment (+50 bps)">Moderate Rate Adjustment (+50 bps)</option>
                    <option value="Interest Rate Spike (+250 bps) & Tech Sector Correction (-22%)">Severe Rate Hike (+250 bps) & Tech Correction</option>
                    <option value="Severe Stagflation Shock (+350 bps Rate Spike & -35% Tech Crash)">Stagflation Crisis (+350 bps & Market Crash)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Execute Button */}
          <button
            type="submit"
            disabled={isRunning}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '0.9375rem', marginTop: '10px' }}
          >
            {isRunning ? (
              <>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid #030712',
                  borderTopColor: 'transparent',
                  animation: 'spin 0.8s linear infinite'
                }} />
                <span>4 AI Agents Collaborating...</span>
              </>
            ) : (
              <>
                <Play size={18} fill="#030712" />
                <span>Execute Multi-Agent Workflow</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Right Column: Live Multi-Agent Output */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <LiveReasoningStream steps={currentSteps} isRunning={isRunning} />
        {workflowResult && (
          <DecisionView 
            workflowType={selectedWorkflow}
            result={workflowResult} 
            onResolveHitl={onResolveHitl} 
          />
        )}
      </div>
    </div>
  );
}
