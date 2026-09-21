import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, Copy, Play } from 'lucide-react';

interface EndpointDef {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  category: string;
  sampleBody?: any;
}

const ENDPOINTS: EndpointDef[] = [
  {
    method: 'GET',
    path: '/api/v1/health',
    description: 'System health check and active circuit breaker state',
    category: 'System',
  },
  {
    method: 'GET',
    path: '/api/v1/metrics',
    description: 'System-wide metrics (applications, tool execution latency, human review rates)',
    category: 'System',
  },
  {
    method: 'GET',
    path: '/api/v1/applications?page=1&limit=10',
    description: 'List synthetic banking onboarding applications with pagination',
    category: 'Applications',
  },
  {
    method: 'POST',
    path: '/api/v1/applications',
    description: 'Submit a new customer onboarding application',
    category: 'Applications',
    sampleBody: {
      customer_name: 'Sophia Patel',
      email: 'sophia.patel@synthetic.bank',
      annual_income: 115000,
      product_type: 'PREMIUM_CHECKING',
      scenario: 'LOW_RISK',
    },
  },
  {
    method: 'POST',
    path: '/api/v1/workflows/start',
    description: 'Initiate autonomous multi-agent LangGraph workflow execution for an application',
    category: 'Workflows',
    sampleBody: {
      application_id: 'APP-SYN-001',
    },
  },
  {
    method: 'GET',
    path: '/api/v1/agents',
    description: 'List all 8 specialized agents, roles, and allowed tools',
    category: 'Agents',
  },
  {
    method: 'GET',
    path: '/api/v1/reviews',
    description: 'Retrieve pending human review queue and historical supervisory decisions',
    category: 'Reviews',
  },
  {
    method: 'GET',
    path: '/api/v1/audit/APP-SYN-001',
    description: 'Query immutable SHA-256 hashed audit log for an application',
    category: 'Audit',
  },
  {
    method: 'GET',
    path: '/api/v1/policies?q=AML',
    description: 'Semantic vector similarity search across banking policies',
    category: 'Policies',
  },
  {
    method: 'GET',
    path: '/api/v1/tools',
    description: 'List the 11 registered banking tools, timeout configs, and execution metrics',
    category: 'Tools',
  },
];

export const ApiDocumentation: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState<string>(
    ENDPOINTS[0].sampleBody ? JSON.stringify(ENDPOINTS[0].sampleBody, null, 2) : ''
  );
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const handleSelect = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.sampleBody ? JSON.stringify(ep.sampleBody, null, 2) : '');
    setResponseOutput(null);
    setStatusCode(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (selectedEndpoint.method === 'POST' && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      setStatusCode(res.status);
      const data = await res.json();
      setResponseOutput(data);
    } catch (err: any) {
      setStatusCode(500);
      setResponseOutput({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Terminal className="w-4 h-4 mr-1.5 text-indigo-600" />
              FastAPI / REST Banking Engine API Explorer
            </h3>
            <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
              Python FastAPI &amp; LangGraph Backend
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            All endpoints strictly follow enterprise banking API specifications with Pydantic validation, LangGraph agents, and audit logging.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <div className="space-y-2 border-r border-slate-100 pr-4">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Available Endpoints
            </span>
            {ENDPOINTS.map((ep, i) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(ep)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition flex items-center justify-between ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="truncate">
                    <span
                      className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded mr-1.5 ${
                        ep.method === 'GET'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-[11px]">{ep.path.split('?')[0]}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 ml-1">{ep.category}</span>
                </button>
              );
            })}
          </div>

          {/* Test Runner & Payload */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span
                    className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                      selectedEndpoint.method === 'GET'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {selectedEndpoint.path}
                  </span>
                </div>
                <button
                  onClick={handleExecute}
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1 transition disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                  <span>{isLoading ? 'Executing...' : 'Test Request'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-600">{selectedEndpoint.description}</p>
            </div>

            {/* Request Body Editor if POST */}
            {selectedEndpoint.method === 'POST' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  JSON Request Body
                </label>
                <textarea
                  rows={6}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  className="w-full text-xs font-mono p-3 bg-slate-900 text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Response Output Console */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700">API Response Console</span>
                {statusCode && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      statusCode >= 200 && statusCode < 300
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    HTTP {statusCode}
                  </span>
                )}
              </div>
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs max-h-72 overflow-y-auto">
                {responseOutput ? (
                  <pre>{JSON.stringify(responseOutput, null, 2)}</pre>
                ) : (
                  <span className="text-slate-500 italic">
                    Click "Test Request" to execute this API call against the live running server.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
