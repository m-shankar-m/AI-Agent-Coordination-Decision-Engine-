import React from 'react';
import {
  Activity,
  Cpu,
  Wrench,
  CheckCircle,
  AlertOctagon,
  Clock,
  Shield,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { AgentMetadata } from '../types/banking.js';

interface ToolItem {
  name: string;
  description: string;
  category: string;
  timeoutMs: number;
  retries: number;
  inputSchema: string;
  outputSchema: string;
  stats: { calls: number; failures: number; totalMs: number };
}

interface AgentObservabilityProps {
  agents: AgentMetadata[];
  tools: ToolItem[];
  circuitBreakerStatus?: {
    state: string;
    failures: number;
    threshold: number;
    resetTimeoutMs: number;
  };
}

export const AgentObservability: React.FC<AgentObservabilityProps> = ({
  agents,
  tools,
  circuitBreakerStatus,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Status Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Cpu className="w-4 h-4 mr-1.5 text-indigo-600" />
              Multi-Agent Fleet Status ({agents.length} Specialized Agents)
            </h3>
            <p className="text-xs text-slate-500">
              Autonomous agents coordinated via LangGraph shared state DAG architecture
            </p>
          </div>

          {circuitBreakerStatus && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-slate-700">Circuit Breaker:</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                  circuitBreakerStatus.state === 'CLOSED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {circuitBreakerStatus.state}
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500">
                Failures: {circuitBreakerStatus.failures}/{circuitBreakerStatus.threshold}
              </span>
            </div>
          )}
        </div>

        {/* 8 Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => {
            const isExecuting = agent.status === 'EXECUTING';
            const isCompleted = agent.status === 'COMPLETED';

            return (
              <div
                key={agent.name}
                id={`agent-card-${agent.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">{agent.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isExecuting
                          ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <span className="text-[11px] font-medium text-indigo-600 block mb-1.5">
                    {agent.role}
                  </span>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {agent.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Runs:</span>
                    <span className="font-mono font-semibold">{agent.total_runs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Latency:</span>
                    <span className="font-mono">{agent.execution_time_ms}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Success Rate:</span>
                    <span className="font-mono text-emerald-600 font-semibold">
                      {Math.round(agent.success_rate * 100)}%
                    </span>
                  </div>
                  <div className="mt-1.5 pt-1 border-t border-slate-100 flex flex-wrap gap-1">
                    {agent.allowed_tools.map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 11 Enterprise Tools Registry */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Wrench className="w-4 h-4 mr-1.5 text-indigo-600" />
              Deterministic Tool &amp; Adapter Registry (11 Enterprise Tools)
            </h3>
            <p className="text-xs text-slate-500">
              Each tool features input hashing, deterministic schemas, timeout guards, and automated audit logging
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Tool Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Timeout / Retries</th>
                <th className="py-2.5 px-3">Total Calls</th>
                <th className="py-2.5 px-3">Failures</th>
                <th className="py-2.5 px-3">Avg Latency</th>
                <th className="py-2.5 px-3">Input Schema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tools.map((tool) => {
                const avgLatency =
                  tool.stats.calls > 0 ? Math.round(tool.stats.totalMs / tool.stats.calls) : 0;
                return (
                  <tr key={tool.name} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {tool.name}()
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {tool.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {tool.timeoutMs}ms / {tool.retries} retries
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {tool.stats.calls}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={
                          tool.stats.failures > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'
                        }
                      >
                        {tool.stats.failures}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">
                      {avgLatency}ms
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 max-w-xs truncate text-[11px]">
                      {tool.inputSchema}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
