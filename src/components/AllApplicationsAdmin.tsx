import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, CheckCircle, AlertTriangle, XCircle, MoreVertical } from 'lucide-react';
import { ApplicationRecord } from '../types/banking.js';
import { formatINR } from '../utils/currency.js';

interface AllApplicationsAdminProps {
  applications: ApplicationRecord[];
  onSelectApplication: (id: string) => void;
  onLaunchWorkflow: (id: string) => void;
}

export const AllApplicationsAdmin: React.FC<AllApplicationsAdminProps> = ({
  applications,
  onSelectApplication,
  onLaunchWorkflow,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const totalApplications = applications.length;
  const clearedApproved = applications.filter(a => a.status === 'APPROVED').length;
  const pendingReview = applications.filter(a => a.status === 'REVIEW_REQUIRED' || a.status === 'IN_PROGRESS').length;
  const flaggedAction = applications.filter(a => a.status === 'REJECTED').length;

  const filteredApps = applications.filter(app => {
    if (filterRisk !== 'ALL') {
      if (app.scenario !== filterRisk) return false;
    }
    if (searchTerm) {
      const match =
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 mb-2">Total Applications</h3>
          <div className="text-3xl font-bold text-slate-900">{totalApplications}</div>
          <p className="text-xs text-slate-400 mt-1">All banking facilities</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-emerald-700 mb-2">Cleared &amp; Approved</h3>
          <div className="text-3xl font-bold text-emerald-800">{clearedApproved}</div>
          <p className="text-xs text-emerald-600 mt-1">Zero policy discrepancies</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-amber-700 mb-2">Pending Human Review</h3>
          <div className="text-3xl font-bold text-amber-800">{pendingReview}</div>
          <p className="text-xs text-amber-600 mt-1">Underwriter action required</p>
        </div>
        <div className="bg-rose-50 rounded-xl border border-rose-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-rose-700 mb-2">Flagged / Action Needed</h3>
          <div className="text-3xl font-bold text-rose-800">{flaggedAction}</div>
          <p className="text-xs text-rose-600 mt-1">Mistakes &amp; variance detected</p>
        </div>
      </div>

      {/* Applications Table section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              APPLICATIONS REGISTRY ({filteredApps.length})
            </h2>
            <p className="text-xs text-slate-500">Live status across all users • Underwriting oversight matrix</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="LOW_RISK">Low Risk</option>
              <option value="MEDIUM_RISK">Medium Risk</option>
              <option value="DOCUMENT_MISMATCH">Document Mismatch</option>
              <option value="FRAUD_INDICATOR">Fraud Indicator</option>
            </select>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 min-w-[250px]"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Applicant &amp; Email</th>
                <th className="py-3 px-4">Facility Product</th>
                <th className="py-3 px-4">Income / Limit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Discrepancy / Flags</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono text-indigo-600 font-medium">
                    {app.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{app.customer_name}</div>
                    <div className="text-xs text-slate-500">{app.customer_email}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {app.product_type.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-900">{formatINR(app.annual_income)}</div>
                    <div className="text-xs text-slate-500">
                      Req limit: {app.requested_credit_limit ? formatINR(app.requested_credit_limit) : 'N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : app.status === 'REVIEW_REQUIRED'
                          ? 'bg-amber-100 text-amber-800'
                          : app.status === 'IN_PROGRESS'
                          ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {app.status === 'APPROVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {app.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                      {app.status === 'REVIEW_REQUIRED' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium ${app.scenario !== 'LOW_RISK' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {app.scenario ? app.scenario.replace(/_/g, ' ') : 'NONE'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onSelectApplication(app.id)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:bg-indigo-50 rounded px-2 py-1 transition w-full"
                      >
                        View Details
                      </button>
                      {app.status === 'REJECTED' && (
                        <button
                          onClick={() => onLaunchWorkflow(app.id)}
                          className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded px-2 py-1 transition w-full flex items-center justify-center"
                        >
                          Manual Override
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No applications found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
