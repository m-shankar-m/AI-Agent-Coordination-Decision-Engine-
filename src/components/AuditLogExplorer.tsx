import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Hash,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { AuditLogRecord } from '../types/banking.js';

interface AuditLogExplorerProps {
  selectedApplicationId?: string | null;
}

export const AuditLogExplorer: React.FC<AuditLogExplorerProps> = ({ selectedApplicationId }) => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [appIdFilter, setAppIdFilter] = useState(selectedApplicationId || '');
  const [activeLog, setActiveLog] = useState<AuditLogRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const appId = appIdFilter ? appIdFilter.trim() : 'ALL';
      let url = `/api/v1/audit/${appId}?page=${page}&limit=25`;
      if (agentFilter !== 'ALL') url += `&agent=${agentFilter}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, agentFilter, statusFilter, appIdFilter]);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_trail_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-600" />
              Immutable Regulatory Audit Trail Ledger ({total} Records)
            </h3>
            <p className="text-xs text-slate-500">
              Cryptographically hashed records tracking every agent decision, tool call, and human supervisory action
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-refresh-audit"
              onClick={fetchLogs}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              id="btn-export-audit"
              onClick={handleExportJson}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit JSON</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Application ID Filter
            </label>
            <input
              type="text"
              placeholder="e.g. APP-SYN-001 (or blank for ALL)"
              value={appIdFilter}
              onChange={(e) => {
                setAppIdFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Agent Filter
            </label>
            <select
              value={agentFilter}
              onChange={(e) => {
                setAgentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none"
            >
              <option value="ALL">All Agents</option>
              <option value="Planning Agent">Planning Agent</option>
              <option value="Document Agent">Document Agent</option>
              <option value="KYC Agent">KYC Agent</option>
              <option value="Risk Agent">Risk Agent</option>
              <option value="Fraud Agent">Fraud Agent</option>
              <option value="Compliance Agent">Compliance Agent</option>
              <option value="Decision Agent">Decision Agent</option>
              <option value="Response Agent">Response Agent</option>
              <option value="HumanReviewer">Human Reviewer</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded bg-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="WARNING">WARNING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Application ID</th>
                <th className="py-2.5 px-3">Agent</th>
                <th className="py-2.5 px-3">Action / Tool</th>
                <th className="py-2.5 px-3">Input Hash</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 font-mono font-medium text-indigo-600">
                    {log.application_id}
                  </td>
                  <td className="py-2 px-3 font-semibold text-slate-900">
                    {log.agent_name}
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-mono text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-400 text-[10px]">
                    {log.input_hash ? `${log.input_hash.substring(0, 10)}...` : 'N/A'}
                  </td>
                  <td className="py-2 px-3">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'WARNING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                    {log.execution_time_ms}ms
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => setActiveLog(log)}
                      className="p-1 text-slate-500 hover:text-indigo-600"
                      title="Inspect record"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Page {page} of {Math.max(1, Math.ceil(total / 25))} ({total} total audit records)
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page >= Math.ceil(total / 25)}
              onClick={() => setPage(page + 1)}
              className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Record Inspector Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="font-mono text-xs text-indigo-600 font-bold">{activeLog.id}</span>
                <h3 className="text-sm font-bold text-slate-900">{activeLog.action}</h3>
              </div>
              <button
                onClick={() => setActiveLog(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Agent</span>
                  <span className="font-semibold">{activeLog.agent_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Timestamp</span>
                  <span className="font-mono">{new Date(activeLog.timestamp).toISOString()}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">SHA-256 Input Hash</span>
                  <span className="font-mono text-[11px] text-slate-700">{activeLog.input_hash || 'None'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Data Source</span>
                  <span className="font-mono text-[11px]">{activeLog.data_source}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Output Payload / Evidence</span>
                <div className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{JSON.stringify(activeLog.output_data || activeLog.output_summary, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
