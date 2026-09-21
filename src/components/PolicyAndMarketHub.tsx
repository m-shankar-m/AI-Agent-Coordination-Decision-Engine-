import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Globe,
  BookOpen,
  Search,
  Zap,
  ServerCrash,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import { RealtimeFinancialData } from '../types/banking.js';

interface PolicyItem {
  id: string;
  code: string;
  title: string;
  text: string;
  category: string;
  similarity?: number;
}

interface PolicyAndMarketHubProps {
  realtimeData: RealtimeFinancialData | null;
  onRefreshMarketData: () => void;
  onToggleOutage: (enableFailure: boolean) => void;
  isOutageActive: boolean;
}

export const PolicyAndMarketHub: React.FC<PolicyAndMarketHubProps> = ({
  realtimeData,
  onRefreshMarketData,
  onToggleOutage,
  isOutageActive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchPolicies = async (query?: string) => {
    setIsSearching(true);
    try {
      const url = query
        ? `/api/v1/policies?q=${encodeURIComponent(query)}`
        : '/api/v1/policies';
      const res = await fetch(url);
      const data = await res.json();
      if (query && data.results) {
        setPolicies(
          data.results.map((r: any) => ({
            ...r.policy,
            similarity: r.similarity,
          }))
        );
      } else if (data.policies) {
        setPolicies(data.policies);
      }
    } catch (e) {
      console.error('Failed to fetch policies:', e);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPolicies(searchQuery);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Market Data & Outage Simulation Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Globe className="w-4 h-4 mr-1.5 text-indigo-600" />
              Real-Time Financial Market Telemetry &amp; External API Adapter
            </h3>
            <p className="text-xs text-slate-500">
              Live macroeconomic benchmarks, central bank interest rates, and currency FX feeds
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onRefreshMarketData}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Rates</span>
            </button>
            <button
              onClick={() => onToggleOutage(!isOutageActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
                isOutageActive
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <ServerCrash className="w-3.5 h-3.5" />
              <span>{isOutageActive ? 'Outage Active (Circuit Tripped)' : 'Simulate API Outage'}</span>
            </button>
          </div>
        </div>

        {/* Market Data Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Central Bank Benchmark */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Central Bank Repo Rate
            </span>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {realtimeData ? `${realtimeData.central_bank_repo_rate}%` : '6.50%'}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Benchmark monetary reference
            </span>
          </div>

          {/* Inflation Benchmark */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Inflation Rate Benchmark
            </span>
            <div className="text-2xl font-mono font-bold text-slate-900">
              {realtimeData ? `${realtimeData.inflation_rate_benchmark}%` : '3.40%'}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Macroeconomic credit index
            </span>
          </div>

          {/* Live Currency FX Rates */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 sm:col-span-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
              Foreign Exchange (FX) Cross Rates
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">USD/EUR</span>
                <span className="font-mono font-bold text-sm text-slate-800">
                  {realtimeData?.currency_fx_rates?.USD_EUR || '0.924'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">USD/GBP</span>
                <span className="font-mono font-bold text-sm text-slate-800">
                  {realtimeData?.currency_fx_rates?.USD_GBP || '0.789'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">USD/INR</span>
                <span className="font-mono font-bold text-sm text-slate-800">
                  {realtimeData?.currency_fx_rates?.USD_INR || '83.45'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block">USD/JPY</span>
                <span className="font-mono font-bold text-sm text-slate-800">
                  {realtimeData?.currency_fx_rates?.USD_JPY || '155.80'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry metadata footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Data Source:</span>
            <span
              className={`font-mono px-2 py-0.5 rounded text-[10px] font-bold ${
                realtimeData?.is_realtime
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {realtimeData?.source_api || 'FALLBACK_RESERVE_CACHE'}
            </span>
          </div>
          <div>
            Timestamp: {realtimeData ? new Date(realtimeData.timestamp).toLocaleTimeString() : 'N/A'}
          </div>
        </div>
      </div>

      {/* Vector Policy Knowledge Base & Semantic Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <BookOpen className="w-4 h-4 mr-1.5 text-indigo-600" />
              Banking Policy Vector Store (pgvector Compatible)
            </h3>
            <p className="text-xs text-slate-500">
              Semantic similarity search over regulatory policies, AML mandates, and credit rules
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. KYC passport check, AML threshold"
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-64"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
            >
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchPolicies();
                }}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Policies List */}
        <div className="space-y-3">
          {isSearching ? (
            <p className="text-xs text-slate-400 text-center py-6">Computing vector cosine embeddings...</p>
          ) : policies.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No matching policies located.</p>
          ) : (
            policies.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
                      {p.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                  </div>
                  {p.similarity !== undefined && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                      Cosine Match: {Math.round(p.similarity * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{p.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
