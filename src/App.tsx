/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.js';
import { WorkflowVisualizer } from './components/WorkflowVisualizer.js';
import { ApplicationLauncher } from './components/ApplicationLauncher.js';
import { ReviewPortal } from './components/ReviewPortal.js';
import { AgentObservability } from './components/AgentObservability.js';
import { PolicyAndMarketHub } from './components/PolicyAndMarketHub.js';
import { AuditLogExplorer } from './components/AuditLogExplorer.js';
import { ApiDocumentation } from './components/ApiDocumentation.js';
import { SpecializedRiskEngines } from './components/SpecializedRiskEngines.js';
import {
  FALLBACK_AGENTS,
  FALLBACK_TOOLS,
  FALLBACK_PENDING_REVIEWS,
  FALLBACK_APPLICATIONS,
} from './data/fallbackData.js';

import {
  AgentMetadata,
  ApplicationRecord,
  HumanReviewRecord,
  RBACRole,
  RealtimeFinancialData,
  SharedAgentState,
  ToolCallRecord,
} from './types/banking.js';

export default function App() {
  const [currentRole, setCurrentRole] = useState<RBACRole>('ADMIN');
  const [activeTab, setActiveTab] = useState<string>('workflows');

  // Application & Workflow State
  const [applications, setApplications] = useState<ApplicationRecord[]>(FALLBACK_APPLICATIONS);
  const [totalApplications, setTotalApplications] = useState<number>(FALLBACK_APPLICATIONS.length);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(FALLBACK_APPLICATIONS[0].id);

  const [activeWorkflow, setActiveWorkflow] = useState<SharedAgentState | null>(null);
  const [toolCalls, setToolCalls] = useState<ToolCallRecord[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // Review & Observability State
  const [pendingReviews, setPendingReviews] = useState<any[]>(FALLBACK_PENDING_REVIEWS);
  const [reviewHistory, setReviewHistory] = useState<HumanReviewRecord[]>([]);
  const [agents, setAgents] = useState<AgentMetadata[]>(FALLBACK_AGENTS);
  const [tools, setTools] = useState<any[]>(FALLBACK_TOOLS);

  // Telemetry & Market Data
  const [realtimeData, setRealtimeData] = useState<RealtimeFinancialData | null>(null);
  const [isOutageActive, setIsOutageActive] = useState<boolean>(false);

  // SSE EventSource reference
  const sseRef = useRef<EventSource | null>(null);

  // 1. Initial Data Fetching with Resilient Fallback Handling
  const fetchApplications = async (page = currentPage) => {
    try {
      const res = await fetch(`/api/v1/applications?page=${page}&limit=20`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        setApplications(data.items);
        setTotalApplications(data.total || data.items.length);
        if (!selectedAppId) {
          setSelectedAppId(data.items[0].id);
        }
      }
    } catch (err) {
      console.warn('Backend /applications endpoint unavailable, using seeded dataset:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/v1/reviews');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data && Array.isArray(data.pending)) {
        setPendingReviews(data.pending);
      }
      if (data && Array.isArray(data.history)) {
        setReviewHistory(data.history);
      }
    } catch (err) {
      console.warn('Backend /reviews endpoint temporarily unreachable, utilizing in-memory state:', err);
    }
  };

  const fetchAgentsAndTools = async () => {
    try {
      const [agentRes, toolRes] = await Promise.all([
        fetch('/api/v1/agents'),
        fetch('/api/v1/tools'),
      ]);
      if (agentRes.ok) {
        const agentData = await agentRes.json();
        if (Array.isArray(agentData) && agentData.length > 0) {
          setAgents(agentData);
        }
      }
      if (toolRes.ok) {
        const toolData = await toolRes.json();
        if (Array.isArray(toolData) && toolData.length > 0) {
          setTools(toolData);
        }
      }
    } catch (err) {
      console.warn('Backend /agents and /tools endpoint temporarily unreachable, utilizing pre-configured registry:', err);
    }
  };

  const fetchRealtimeMarketData = async () => {
    try {
      const res = await fetch('/api/v1/realtime-data');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRealtimeData(data);
      setIsOutageActive(Boolean(data.forced_failure_active));
    } catch (err) {
      console.warn('Market data feed temporarily syncing:', err);
    }
  };

  useEffect(() => {
    fetchApplications(1);
    fetchReviews();
    fetchAgentsAndTools();
    fetchRealtimeMarketData();

    const interval = setInterval(() => {
      fetchReviews();
      fetchAgentsAndTools();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // 2. Launch Multi-Agent Workflow
  const handleLaunchWorkflow = async (appId: string) => {
    setSelectedAppId(appId);
    setActiveTab('workflows');
    setToolCalls([]);

    if (sseRef.current) {
      sseRef.current.close();
    }

    try {
      const res = await fetch('/api/v1/workflows/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId }),
      });

      if (!res.ok) {
        throw new Error('Failed to start workflow');
      }

      const initialState: SharedAgentState = await res.json();
      setActiveWorkflow(initialState);
      setIsStreaming(true);

      // Connect to Server-Sent Events (SSE) stream for live updates
      const eventSource = new EventSource(`/api/v1/workflows/${initialState.workflow_id}/stream`);
      sseRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.type === 'SNAPSHOT') {
            setActiveWorkflow(payload.data);
          } else if (payload.type === 'AGENT_STARTED') {
            setActiveWorkflow((prev) =>
              prev ? { ...prev, current_agent: payload.agent } : null
            );
          } else if (payload.type === 'TOOL_CALLED') {
            setToolCalls((prev) => [payload.data, ...prev]);
          } else if (payload.type === 'HUMAN_REVIEW_TRIGGERED') {
            fetchReviews();
            setActiveWorkflow((prev) =>
              prev
                ? {
                    ...prev,
                    workflow_status: 'PAUSED_FOR_REVIEW',
                    human_review_required: true,
                    review_reason: payload.data.reason,
                  }
                : null
            );
          } else if (payload.type === 'WORKFLOW_COMPLETED') {
            setIsStreaming(false);
            fetchApplications();
            fetchReviews();
            fetchAgentsAndTools();
            // Refresh full state
            fetch(`/api/v1/workflows/${initialState.workflow_id}`)
              .then((r) => r.json())
              .then((finalState) => setActiveWorkflow(finalState))
              .catch(console.error);

            eventSource.close();
          } else if (payload.type === 'WORKFLOW_ERROR') {
            setIsStreaming(false);
            eventSource.close();
          }
        } catch (e) {
          console.error('Error parsing SSE event:', e);
        }
      };

      eventSource.onerror = () => {
        setIsStreaming(false);
        eventSource.close();
      };
    } catch (err) {
      console.error('Error starting workflow:', err);
      setIsStreaming(false);
    }
  };

  // 3. Human Review Decision Submission
  const handleSubmitReviewDecision = async (params: {
    applicationId: string;
    action: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO';
    reason: string;
    notes?: string;
  }) => {
    try {
      const res = await fetch(`/api/v1/reviews/${params.applicationId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer_name: `Officer ${currentRole}`,
          reviewer_role: currentRole,
          action: params.action,
          reason: params.reason,
          notes: params.notes,
        }),
      });

      if (res.ok) {
        await fetchReviews();
        await fetchApplications();
        if (activeWorkflow?.application_id === params.applicationId) {
          setActiveWorkflow((prev) =>
            prev
              ? {
                  ...prev,
                  workflow_status: params.action === 'APPROVE' ? 'COMPLETED' : 'REJECTED',
                  human_review_required: false,
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error('Error committing review decision:', err);
    }
  };

  // 4. Toggle Outage Simulation (Scenario 4)
  const handleToggleOutage = async (enableFailure: boolean) => {
    try {
      const res = await fetch('/api/v1/simulation/toggle-external-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable_failure: enableFailure }),
      });
      const data = await res.json();
      setIsOutageActive(data.forced_failure_active);
      await fetchRealtimeMarketData();
    } catch (err) {
      console.error('Failed to toggle outage simulation:', err);
    }
  };

  // 5. Bulk Seed 1,000+ Records
  const handleBulkSeed = async (count: number) => {
    try {
      await fetch('/api/v1/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      await fetchApplications(1);
    } catch (err) {
      console.error('Error generating bulk seed records:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingReviewCount={pendingReviews.length}
        realtimeData={realtimeData}
        onRefreshData={() => {
          fetchApplications();
          fetchReviews();
          fetchAgentsAndTools();
          fetchRealtimeMarketData();
        }}
        isStreaming={isStreaming}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'workflows' && (
          <WorkflowVisualizer
            workflowState={activeWorkflow}
            toolCalls={toolCalls}
            onTriggerReview={() => setActiveTab('reviews')}
            onNavigateToApplications={() => setActiveTab('applications')}
            onSelectApplication={(id) => {
              setSelectedAppId(id);
              handleLaunchWorkflow(id);
            }}
          />
        )}

        {activeTab === 'applications' && (
          <ApplicationLauncher
            applications={applications}
            totalApplications={totalApplications}
            currentPage={currentPage}
            onPageChange={(p) => {
              setCurrentPage(p);
              fetchApplications(p);
            }}
            onLaunchWorkflow={handleLaunchWorkflow}
            onSelectApplication={setSelectedAppId}
            selectedApplicationId={selectedAppId}
            onBulkSeed={handleBulkSeed}
            onSimulateOutageToggle={handleToggleOutage}
            isOutageActive={isOutageActive}
          />
        )}

        {activeTab === 'risk_engines' && (
          <SpecializedRiskEngines />
        )}

        {activeTab === 'reviews' && (
          <ReviewPortal
            pendingReviews={pendingReviews}
            reviewHistory={reviewHistory}
            currentRole={currentRole}
            onSelectApplication={(id) => {
              setSelectedAppId(id);
              setActiveTab('workflows');
            }}
            onSubmitDecision={handleSubmitReviewDecision}
          />
        )}

        {activeTab === 'observability' && (
          <AgentObservability
            agents={agents}
            tools={tools}
            circuitBreakerStatus={
              realtimeData
                ? {
                    state: realtimeData.circuit_breaker_active ? 'OPEN' : 'CLOSED',
                    failures: realtimeData.circuit_breaker_active ? 3 : 0,
                    threshold: 3,
                    resetTimeoutMs: 30000,
                  }
                : undefined
            }
          />
        )}

        {activeTab === 'market_policy' && (
          <PolicyAndMarketHub
            realtimeData={realtimeData}
            onRefreshMarketData={fetchRealtimeMarketData}
            onToggleOutage={handleToggleOutage}
            isOutageActive={isOutageActive}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogExplorer selectedApplicationId={selectedAppId} />
        )}

        {activeTab === 'api' && <ApiDocumentation />}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">AegisBank Decision Engine</span>
            <span>•</span>
            <span className="font-mono">Port 3000 (Vite + Express)</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">SOC-2 / ISO-27001 Compliant Architecture</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            DEMONSTRATION &amp; SYNTHETIC DATA FIXTURES ONLY
          </div>
        </div>
      </footer>
    </div>
  );
}
