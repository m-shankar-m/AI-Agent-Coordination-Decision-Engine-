import React from 'react';
import { Shield, Activity, RefreshCw, UserCheck, AlertTriangle, Database } from 'lucide-react';
import { RBACRole, RealtimeFinancialData } from '../types/banking.js';

interface HeaderProps {
  currentRole: RBACRole;
  onRoleChange: (role: RBACRole) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingReviewCount: number;
  realtimeData?: RealtimeFinancialData | null;
  onRefreshData?: () => void;
  isStreaming?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  pendingReviewCount,
  realtimeData,
  onRefreshData,
  isStreaming,
}) => {
  const tabs = [
    { id: 'workflows', label: 'Workflow & Agents' },
    { id: 'applications', label: 'Applications & Custom Data' },
    { id: 'risk_engines', label: 'Specialized Risk & Underwriting' },
    { id: 'reviews', label: 'Human Review Queue', badge: pendingReviewCount },
    { id: 'observability', label: 'Agent & Tool Matrix' },
    { id: 'market_policy', label: 'Real-Time & Policies' },
    { id: 'audit', label: 'Regulatory Audit Log' },
    { id: 'api', label: 'REST API Specs' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg text-slate-900 tracking-tight">
                  AEGIS BANK
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI Decision Engine
                </span>
                {isStreaming && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 animate-pulse">
                    <span className="w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full"></span>
                    Live Workflow Stream
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Multi-Agent Banking Onboarding, Risk & Decision Platform
              </p>
            </div>
          </div>

          {/* Real-time Ticker & Market Indicator */}
          <div className="hidden lg:flex items-center space-x-4 text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-slate-700">Central Bank Rate:</span>
              <span className="font-mono text-slate-900">
                {realtimeData ? `${realtimeData.central_bank_repo_rate}%` : '6.50%'}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-1.5">
              <span className="font-medium text-slate-700">USD/INR:</span>
              <span className="font-mono text-slate-900">
                {realtimeData?.currency_fx_rates?.USD_INR || '83.45'}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-slate-700">Source:</span>
              <span
                className={`font-mono px-1.5 py-0.5 rounded text-[10px] ${
                  realtimeData?.is_realtime
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {realtimeData?.is_realtime ? 'LIVE API' : 'FALLBACK RESERVE'}
              </span>
            </div>
            {realtimeData?.circuit_breaker_active && (
              <span className="inline-flex items-center text-amber-600 font-medium">
                <AlertTriangle className="w-3 h-3 mr-1" /> Circuit Open
              </span>
            )}
          </div>

          {/* RBAC Role Selector & Actions */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <span className="text-xs font-medium text-slate-500 pl-1.5 flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1 text-slate-400" /> Role:
              </span>
              <select
                id="rbac-role-select"
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value as RBACRole)}
                className="bg-white text-xs font-semibold text-slate-800 rounded px-2 py-1 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="REVIEWER">REVIEWER</option>
                <option value="OPERATIONS">OPERATIONS</option>
                <option value="ANALYST">ANALYST</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            </div>

            {onRefreshData && (
              <button
                id="refresh-btn"
                onClick={onRefreshData}
                title="Refresh system state"
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto border-t border-slate-100 py-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
