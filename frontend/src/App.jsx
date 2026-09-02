import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import AgentGraphVisualizer from './components/AgentGraphVisualizer';
import WorkflowStudio from './components/WorkflowStudio';
import HITLQueueModal from './components/HITLQueueModal';
import KnowledgeExplorer from './components/KnowledgeExplorer';
import AuditAnalytics from './components/AuditAnalytics';
import ConfigSettingsModal from './components/ConfigSettingsModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio'); // 'studio' | 'graph' | 'hitl' | 'knowledge' | 'audit'
  const [selectedWorkflow, setSelectedWorkflow] = useState('loan_underwriting');
  const [isRunning, setIsRunning] = useState(false);
  const [currentSteps, setCurrentSteps] = useState([]);
  const [activeAgentRole, setActiveAgentRole] = useState(null);
  const [workflowResult, setWorkflowResult] = useState(null);
  const [pendingHitl, setPendingHitl] = useState([]);
  const [selectedHitlItem, setSelectedHitlItem] = useState(null);
  const [llmStatus, setLlmStatus] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const wsRef = useRef(null);

  // Initialize WebSocket & fetch pending HITL
  useEffect(() => {
    fetchLlmStatus();
    fetchPendingHitl();

    const connectWs = () => {
      try {
        const ws = new WebSocket('ws://localhost:8000/ws/stream/global');
        ws.onopen = () => {
          console.log('[WS] Connected to BFSI Multi-Agent stream.');
          setWsConnected(true);
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'AGENT_STEP') {
              setCurrentSteps((prev) => [...prev, data.step]);
              setActiveAgentRole(data.step.agent_role);
            } else if (data.type === 'WORKFLOW_COMPLETE') {
              setIsRunning(false);
              setWorkflowResult(data.result);
              setActiveAgentRole(null);
              fetchPendingHitl();

              // Trigger celebratory confetti on approved loans/claims
              if (data.result?.decision?.includes('APPROV') || data.result?.decision?.includes('ALLOW')) {
                confetti({
                  particleCount: 80,
                  spread: 70,
                  origin: { y: 0.6 }
                });
              }
            }
          } catch (e) {
            console.warn('[WS] Parse error:', e);
          }
        };
        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWs, 3000);
        };
        wsRef.current = ws;
      } catch (e) {
        console.error('[WS] Connection failed:', e);
      }
    };

    connectWs();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const fetchLlmStatus = () => {
    fetch('http://localhost:8000/api/config/status')
      .then(res => res.json())
      .then(data => setLlmStatus(data))
      .catch(e => console.error("Error fetching LLM status:", e));
  };

  const fetchPendingHitl = () => {
    fetch('http://localhost:8000/api/decisions/pending-hitl')
      .then(res => res.json())
      .then(data => setPendingHitl(data.pending_decisions || []))
      .catch(e => console.error("Error fetching pending HITL:", e));
  };

  const handleRunWorkflow = async (wfType, payload) => {
    setIsRunning(true);
    setCurrentSteps([]);
    setWorkflowResult(null);
    setActiveAgentRole('Intake & Extraction Agent');

    const endpointMap = {
      loan_underwriting: '/loan-underwriting',
      fraud_detection: '/fraud-detection',
      claims_processing: '/claims-processing',
      portfolio_risk: '/portfolio-risk'
    };

    const endpoint = endpointMap[wfType] || '/loan-underwriting';

    try {
      const response = await fetch(`http://localhost:8000/api/workflows${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      setWorkflowResult(resData);
      setIsRunning(false);
      setActiveAgentRole(null);
      fetchPendingHitl();

      if (resData.final_verdict?.includes('APPROV') || resData.final_verdict?.includes('ALLOW')) {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error("Workflow execution failed:", err);
      alert("Workflow execution error: " + err.message);
      setIsRunning(false);
      setActiveAgentRole(null);
    }
  };

  const handleResolveHitl = async (actionPayload) => {
    const response = await fetch('http://localhost:8000/api/decisions/resolve-hitl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(actionPayload)
    });
    const data = await response.json();
    fetchPendingHitl();
    return data;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        llmStatus={llmStatus}
        pendingHitlCount={pendingHitl.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        connected={wsConnected}
      />

      {/* Main Workspace Area */}
      <main style={{ flex: 1, padding: '0 24px 32px' }}>
        {/* Agent Topology Graph Banner (Visible across relevant views) */}
        {(activeTab === 'studio' || activeTab === 'graph') && (
          <AgentGraphVisualizer
            selectedWorkflow={selectedWorkflow}
            activeAgentRole={activeAgentRole}
            steps={currentSteps}
          />
        )}

        {/* Tab 1: Workflow Studio */}
        {activeTab === 'studio' && (
          <WorkflowStudio
            onRunWorkflow={handleRunWorkflow}
            isRunning={isRunning}
            currentSteps={currentSteps}
            workflowResult={workflowResult}
            selectedWorkflow={selectedWorkflow}
            setSelectedWorkflow={setSelectedWorkflow}
            onResolveHitl={(item) => {
              setSelectedHitlItem(item);
              setActiveTab('hitl');
            }}
          />
        )}

        {/* Tab 2: Dedicated Graph View */}
        {activeTab === 'graph' && (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '10px' }}>
              Specialized Multi-Agent Swarm Topology
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 24px' }}>
              Autonomous orchestration layer coordinating Intake, Credit/Risk Analyst, Regulatory Compliance, and Decision Approver agents with shared blackboard memory and policy vector retrieval.
            </p>
            <button onClick={() => setActiveTab('studio')} className="btn btn-primary">
              Launch Workflow Execution in Studio
            </button>
          </div>
        )}

        {/* Tab 3: HITL Review Queue */}
        {activeTab === 'hitl' && (
          <HITLQueueModal
            pendingList={pendingHitl}
            selectedItem={selectedHitlItem}
            onSelectItem={setSelectedHitlItem}
            onResolve={handleResolveHitl}
          />
        )}

        {/* Tab 4: Vector Policy Knowledge Explorer */}
        {activeTab === 'knowledge' && (
          <KnowledgeExplorer />
        )}

        {/* Tab 5: Audit & Telemetry Analytics */}
        {activeTab === 'audit' && (
          <AuditAnalytics />
        )}
      </main>

      {/* Settings Modal */}
      <ConfigSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={(st) => setLlmStatus(st)}
      />
    </div>
  );
}
