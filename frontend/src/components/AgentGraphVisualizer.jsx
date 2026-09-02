import React from 'react';
import { 
  FileSearch, 
  TrendingUp, 
  Scale, 
  Gavel, 
  CheckCircle2, 
  Clock, 
  Zap,
  DollarSign,
  AlertOctagon,
  FileText,
  TrendingDown,
  Shield,
  Search,
  Activity,
  FileSpreadsheet,
  Briefcase
} from 'lucide-react';

export default function AgentGraphVisualizer({ selectedWorkflow = 'loan_underwriting', activeAgentRole, steps = [], onSelectAgent }) {
  // 4 Distinct Teams for each of the 4 Workflows
  const workflowAgentTeams = {
    loan_underwriting: {
      title: "Mortgage & Credit Underwriting Swarm",
      engineBadge: "Google Gemini API",
      agents: [
        {
          id: 'loan_intake',
          name: 'Loan Document & Income Extraction Agent',
          role: 'Intake & Extraction Agent',
          icon: FileSearch,
          color: '#00f2fe',
          desc: 'Multimodal OCR, W-2 & Paystub Extraction',
          tools: ['document_ocr', 'payroll_verifier']
        },
        {
          id: 'loan_risk',
          name: 'Mortgage Credit & DTI Underwriter Agent',
          role: 'Credit & Risk Analyst Agent',
          icon: TrendingUp,
          color: '#38bdf8',
          desc: 'CIBIL/Experian Score, DTI & LTV Ratio Modeler',
          tools: ['credit_bureau', 'core_banking']
        },
        {
          id: 'loan_compliance',
          name: 'OCC & Fair Lending Compliance Agent',
          role: 'Regulatory Compliance Agent',
          icon: Scale,
          color: '#a855f7',
          desc: 'OCC Qualified Mortgage 43% DTI & CFPB Limits',
          tools: ['policy_retriever', 'fair_lending_rules']
        },
        {
          id: 'loan_decision',
          name: 'Senior Underwriting Approver Agent',
          role: 'Decision Approver Agent',
          icon: Gavel,
          color: '#10b981',
          desc: 'Final Pricing, Interest APR & Escrow Conditions',
          tools: ['arbitration_rules', 'pricing_engine']
        }
      ]
    },
    fraud_detection: {
      title: "Financial Crime & AML Screening Swarm",
      engineBadge: "Groq Cloud API",
      agents: [
        {
          id: 'fraud_intake',
          name: 'Transaction Ingestion & Profiler Agent',
          role: 'Intake & Extraction Agent',
          icon: Search,
          color: '#f43f5e',
          desc: 'Geo-IP, Device Fingerprint & Velocity Profiler',
          tools: ['document_ocr', 'device_fingerprinter']
        },
        {
          id: 'fraud_risk',
          name: 'AML Anomaly & Risk Scoring Agent',
          role: 'Credit & Risk Analyst Agent',
          icon: AlertOctagon,
          color: '#fb7185',
          desc: 'Z-Score Anomaly & Structuring Pattern Detector',
          tools: ['aml_sanctions', 'core_banking']
        },
        {
          id: 'fraud_compliance',
          name: 'OFAC Sanctions & PEP Watchlist Agent',
          role: 'Regulatory Compliance Agent',
          icon: Shield,
          color: '#c084fc',
          desc: 'OFAC SDN, UN Watchlist & FATF High-Risk Screener',
          tools: ['policy_retriever', 'sanctions_checker']
        },
        {
          id: 'fraud_decision',
          name: 'BSA Compliance & SAR Decision Agent',
          role: 'Decision Approver Agent',
          icon: Gavel,
          color: '#f59e0b',
          desc: 'FinCEN SAR Filing & Asset Freeze Arbitrator',
          tools: ['sar_generator', 'block_enforcer']
        }
      ]
    },
    claims_processing: {
      title: "Insurance Adjudication & Settlement Swarm",
      engineBadge: "OpenAI API",
      agents: [
        {
          id: 'claims_intake',
          name: 'Claim Document & Damage OCR Agent',
          role: 'Intake & Extraction Agent',
          icon: FileSpreadsheet,
          color: '#a855f7',
          desc: 'Police Report & Repair Invoice Line-Item Parser',
          tools: ['document_ocr', 'parts_cross_ref']
        },
        {
          id: 'claims_risk',
          name: 'Loss Assessment & Estimation Adjustor Agent',
          role: 'Credit & Risk Analyst Agent',
          icon: TrendingUp,
          color: '#c084fc',
          desc: 'Labor Hours & Deductible Payout Modeler',
          tools: ['damage_calculator', 'core_banking']
        },
        {
          id: 'claims_compliance',
          name: 'Policy Coverage & Exclusion Auditor Agent',
          role: 'Regulatory Compliance Agent',
          icon: Scale,
          color: '#38bdf8',
          desc: 'Statutory Exclusion & Rideshare Rider Checker',
          tools: ['policy_retriever', 'exclusion_evaluator']
        },
        {
          id: 'claims_decision',
          name: 'Claims Settlement Adjudicator Agent',
          role: 'Decision Approver Agent',
          icon: Gavel,
          color: '#10b981',
          desc: 'Binding Net Settlement & SIU Escalation Gate',
          tools: ['settlement_engine', 'siu_trigger']
        }
      ]
    },
    portfolio_risk: {
      title: "Quantitative Risk & Capital Adequacy Swarm",
      engineBadge: "Google Gemini API",
      agents: [
        {
          id: 'port_intake',
          name: 'Asset Allocation & Holdings Aggregator Agent',
          role: 'Intake & Extraction Agent',
          icon: Briefcase,
          color: '#38bdf8',
          desc: 'Multi-Asset Duration & Sector Exposure Aggregator',
          tools: ['document_ocr', 'asset_deconstruct']
        },
        {
          id: 'port_risk',
          name: 'Quantitative Stress Test & VaR Modeler Agent',
          role: 'Credit & Risk Analyst Agent',
          icon: TrendingDown,
          color: '#00f2fe',
          desc: '95% Daily VaR & Macroeconomic Shocker Modeler',
          tools: ['var_calculator', 'stress_engine']
        },
        {
          id: 'port_compliance',
          name: 'Basel III Prudential & Capital Buffer Agent',
          role: 'Regulatory Compliance Agent',
          icon: Scale,
          color: '#a855f7',
          desc: 'CET1 Buffer & Liquidity Coverage (LCR) Auditor',
          tools: ['policy_retriever', 'basel_evaluator']
        },
        {
          id: 'port_decision',
          name: 'Chief Risk Officer (CRO) Rebalancing Agent',
          role: 'Decision Approver Agent',
          icon: Gavel,
          color: '#10b981',
          desc: 'Mandatory Duration Hedging & Rebalancer',
          tools: ['rebalancer_rules', 'hedge_adviser']
        }
      ]
    }
  };

  const currentTeam = workflowAgentTeams[selectedWorkflow] || workflowAgentTeams.loan_underwriting;
  const agents = currentTeam.agents;

  return (
    <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: agents[0].color, boxShadow: `0 0 10px ${agents[0].color}` }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
            {currentTeam.title}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
            ⚡ Powered by {currentTeam.engineBadge}
          </span>
          <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
            4-Agent Swarm
          </span>
        </div>
      </div>

      {/* Grid of 4 Specialized Agent Nodes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', position: 'relative' }}>
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const isActive = activeAgentRole === agent.role || activeAgentRole === agent.name;
          const agentSteps = steps.filter(s => s.agent_role === agent.role || s.agent_role === agent.name);
          const hasExecuted = agentSteps.length > 0;
          const lastStep = agentSteps[agentSteps.length - 1];

          return (
            <div
              key={agent.id}
              onClick={() => onSelectAgent && onSelectAgent(agent)}
              style={{
                background: isActive ? 'linear-gradient(135deg, rgba(16, 24, 48, 0.95), rgba(30, 41, 79, 0.9))' : 'rgba(11, 17, 34, 0.65)',
                border: isActive ? `2px solid ${agent.color}` : (hasExecuted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.08)'),
                borderRadius: '14px',
                padding: '16px',
                position: 'relative',
                boxShadow: isActive ? `0 0 25px ${agent.color}40, inset 0 0 15px ${agent.color}20` : 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
            >
              {/* Active Pulse Glow Indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: agent.color,
                  color: '#030712',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  boxShadow: `0 0 12px ${agent.color}`
                }}>
                  ACTIVE
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${agent.color}20, ${agent.color}40)`,
                  border: `1px solid ${agent.color}60`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={20} color={agent.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#f8fafc', lineHeight: '1.25' }}>
                    {agent.name}
                  </h3>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    Phase {index + 1} of 4
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px', minHeight: '32px' }}>
                {agent.desc}
              </p>

              {/* Tools list */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                {agent.tools.map((t) => (
                  <span key={t} style={{
                    fontSize: '0.65rem',
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    color: '#94a3b8'
                  }}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Status footer */}
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                paddingTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.7rem'
              }}>
                <span style={{ color: hasExecuted ? '#34d399' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {hasExecuted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {hasExecuted ? 'Phase Complete' : (isActive ? 'Computing...' : 'Standby')}
                </span>
                {lastStep && (
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {lastStep.latency_ms}ms
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
