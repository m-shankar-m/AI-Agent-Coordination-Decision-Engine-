import React from 'react';
import { RefreshCw, Plus, FileText, Play } from 'lucide-react';
import { ApplicationRecord } from '../types/banking.js';

interface MyStatusProps {
  applications: ApplicationRecord[];
  totalApplications: number;
  onRefreshData?: () => void;
  onNavigateToApply: () => void;
  onLaunchWorkflow: (applicationId: string) => void;
  onSelectApplication: (appId: string) => void;
  selectedApplicationId: string | null;
}

export const MyStatus: React.FC<MyStatusProps> = ({
  applications,
  totalApplications,
  onRefreshData,
  onNavigateToApply,
  onLaunchWorkflow,
  onSelectApplication,
  selectedApplicationId,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h2 className="text-2xl font-bold text-slate-900">Welcome to Your Portal</h2>
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
              Isolated Customer View
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Real-time status tracking, multi-agent evaluation feedback, and itemized diagnostics for your banking services.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          {onRefreshData && (
            <button 
              onClick={onRefreshData}
              className="p-2 border border-slate-200 rounded-full text-slate-500 hover:bg-slate-50 transition"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={onNavigateToApply}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center space-x-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Apply for New Service</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Applied Services</h4>
          <div className="text-3xl font-bold text-slate-900">{totalApplications}</div>
          <p className="text-xs text-slate-400 mt-2">Strictly isolated to your ID</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Approved &amp; Active</h4>
          <div className="text-3xl font-bold text-emerald-700">
            {applications.filter(a => a.status === 'APPROVED').length}
          </div>
          <p className="text-xs text-emerald-500 mt-2">Cleared for onboarding</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">Under Officer Review</h4>
          <div className="text-3xl font-bold text-amber-700">
            {applications.filter(a => ['IN_PROGRESS', 'REVIEW_REQUIRED'].includes(a.status)).length}
          </div>
          <p className="text-xs text-amber-500 mt-2">Verification in progress</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-2">Action Required / Flagged</h4>
          <div className="text-3xl font-bold text-rose-700">
            {applications.filter(a => a.status === 'REJECTED').length}
          </div>
          <p className="text-xs text-rose-500 mt-2">Mistake details available</p>
        </div>
      </div>

      {totalApplications === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 shadow-sm text-center border-dashed">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Service Applications Found</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
            You haven't submitted any banking services yet. Apply for a mortgage, personal credit line, checking account, or commercial facility with real-time AI underwriting.
          </p>
          <button 
            onClick={onNavigateToApply} 
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center space-x-2 mx-auto transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Your First Application</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Your Application History
            </h3>
            <span className="text-[11px] text-slate-500">
              Only displaying applications belonging to you.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Application ID</th>
                  <th className="py-2.5 px-3">Applicant Name</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Risk Scenario</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Workflow ID</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const isSelected = selectedApplicationId === app.id;
                  return (
                    <tr
                      key={app.id}
                      onClick={() => onSelectApplication(app.id)}
                      className={`cursor-pointer hover:bg-slate-50/80 transition ${
                        isSelected ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-medium text-indigo-600">
                        {app.id}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {app.customer_name}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {app.product_type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.scenario === 'LOW_RISK'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : app.scenario === 'DOCUMENT_MISMATCH' || app.scenario === 'MEDIUM_RISK'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {app.scenario}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
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
                          {app.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                        {app.workflow_id || 'Not Executed'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectApplication(app.id);
                            onLaunchWorkflow(app.id);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-medium transition inline-flex items-center space-x-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Run Agents</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
