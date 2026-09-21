import React, { useState } from 'react';
import {
  Play,
  FileCheck2,
  AlertTriangle,
  ShieldAlert,
  ServerCrash,
  Plus,
  Search,
  Database,
  RefreshCw,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Code,
  Sparkles,
  Copy,
  Check,
  FileText,
  X,
  Info,
  Sliders,
  UserCheck,
} from 'lucide-react';
import { ApplicationRecord } from '../types/banking.js';
import { formatINR } from '../utils/currency.js';

interface ApplicationLauncherProps {
  applications: ApplicationRecord[];
  totalApplications: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onLaunchWorkflow: (applicationId: string) => void;
  onSelectApplication: (appId: string) => void;
  selectedApplicationId: string | null;
  onBulkSeed: (count: number) => void;
  onSimulateOutageToggle: (enableFailure: boolean) => void;
  isOutageActive: boolean;
  isLoading?: boolean;
}

export const ApplicationLauncher: React.FC<ApplicationLauncherProps> = ({
  applications,
  totalApplications,
  currentPage,
  onPageChange,
  onLaunchWorkflow,
  onSelectApplication,
  selectedApplicationId,
  onBulkSeed,
  onSimulateOutageToggle,
  isOutageActive,
  isLoading,
}) => {
  const [filterScenario, setFilterScenario] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'FORM' | 'JSON'>('FORM');

  // Rich Custom Applicant Form State
  const [formName, setFormName] = useState('Jane Doe');
  const [formEmail, setFormEmail] = useState('jane.doe@example.com');
  const [formPhone, setFormPhone] = useState('+1-555-0199');
  const [formDob, setFormDob] = useState('1992-07-15');
  const [formAddress, setFormAddress] = useState('452 Innovation Blvd, Chicago, IL 60601');
  const [formProduct, setFormProduct] = useState('PREMIUM_CHECKING');
  const [formIncome, setFormIncome] = useState(125000);
  const [formMonthlyExpenses, setFormMonthlyExpenses] = useState(3200);
  const [formCreditLimit, setFormCreditLimit] = useState(25000);
  const [formEmployment, setFormEmployment] = useState<'EMPLOYED' | 'SELF_EMPLOYED' | 'RETIRED' | 'STUDENT' | 'UNEMPLOYED'>('EMPLOYED');
  const [formEmployer, setFormEmployer] = useState('Enterprise Corp');
  const [formCreditScore, setFormCreditScore] = useState(760);
  const [formIdType, setFormIdType] = useState<'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'TAX_ID'>('PASSPORT');
  const [formIdNumber, setFormIdNumber] = useState('P-9847261');
  const [formScenario, setFormScenario] = useState('LOW_RISK');
  const [formDocMismatch, setFormDocMismatch] = useState(false);
  const [formTamperDetected, setFormTamperDetected] = useState(false);
  const [formPepStatus, setFormPepStatus] = useState(false);

  // Raw JSON state
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const applyPreset = (preset: 'PRIME' | 'REVIEW' | 'FRAUD' | 'BLANK') => {
    if (preset === 'PRIME') {
      setFormName('Elena Rostova');
      setFormEmail('elena.rostova@techcorp.synthetic');
      setFormPhone('+1-555-0142');
      setFormDob('1988-03-22');
      setFormAddress('450 Market Street, San Francisco, CA');
      setFormProduct('PREMIUM_CHECKING');
      setFormIncome(145000);
      setFormMonthlyExpenses(3100);
      setFormCreditLimit(30000);
      setFormEmployment('EMPLOYED');
      setFormEmployer('Apex Cloud Systems');
      setFormCreditScore(760);
      setFormIdType('PASSPORT');
      setFormIdNumber('P-7890123');
      setFormScenario('LOW_RISK');
      setFormDocMismatch(false);
      setFormTamperDetected(false);
      setFormPepStatus(false);
    } else if (preset === 'REVIEW') {
      setFormName('Marcus Vance');
      setFormEmail('marcus.vance@freelance.synthetic');
      setFormPhone('+1-555-0189');
      setFormDob('1991-09-14');
      setFormAddress('812 Elm Avenue, Austin, TX');
      setFormProduct('BUSINESS_ACCOUNT');
      setFormIncome(68000);
      setFormMonthlyExpenses(3400);
      setFormCreditLimit(15000);
      setFormEmployment('SELF_EMPLOYED');
      setFormEmployer('Vance Media LLC');
      setFormCreditScore(645);
      setFormIdType('DRIVING_LICENSE');
      setFormIdNumber('DL-TX-445109');
      setFormScenario('MEDIUM_RISK');
      setFormDocMismatch(true);
      setFormTamperDetected(false);
      setFormPepStatus(false);
    } else if (preset === 'FRAUD') {
      setFormName('Alex Chen');
      setFormEmail('alex.chen@temp-mail.synthetic');
      setFormPhone('+1-555-0199');
      setFormDob('1995-12-01');
      setFormAddress('99 Unknown Way, Miami, FL');
      setFormProduct('CREDIT_LINE');
      setFormIncome(92000);
      setFormMonthlyExpenses(4500);
      setFormCreditLimit(20000);
      setFormEmployment('EMPLOYED');
      setFormEmployer('Ghost Shell Holdings');
      setFormCreditScore(520);
      setFormIdType('PASSPORT');
      setFormIdNumber('P-99988X');
      setFormScenario('FRAUD_SUSPECT');
      setFormDocMismatch(false);
      setFormTamperDetected(true);
      setFormPepStatus(true);
    } else {
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormDob('1990-01-01');
      setFormAddress('');
      setFormProduct('PREMIUM_CHECKING');
      setFormIncome(75000);
      setFormMonthlyExpenses(2000);
      setFormCreditLimit(15000);
      setFormEmployment('EMPLOYED');
      setFormEmployer('');
      setFormCreditScore(720);
      setFormIdType('PASSPORT');
      setFormIdNumber(`ID-${Math.floor(100000 + Math.random() * 900000)}`);
      setFormScenario('LOW_RISK');
      setFormDocMismatch(false);
      setFormTamperDetected(false);
      setFormPepStatus(false);
    }
  };

  const sampleJsonTemplate = JSON.stringify(
    {
      customer_name: 'Sophia Williams',
      email: 'sophia.w@enterprise.com',
      phone: '+1-555-0177',
      dob: '1987-11-04',
      address: '220 Tech Parkway, Suite 400, Seattle, WA',
      product_type: 'PREMIUM_CHECKING',
      annual_income: 135000,
      monthly_expenses: 3200,
      credit_score: 775,
      payment_history_score: 98,
      open_tradelines: 7,
      requested_credit_limit: 25000,
      employment_status: 'EMPLOYED',
      employer_name: 'Cloudflare Operations',
      id_type: 'PASSPORT',
      id_number: 'P-5544321',
      scenario: 'LOW_RISK',
      has_document_mismatch: false,
      tamper_flags_detected: false,
      pep_status: false,
    },
    null,
    2
  );

  const filteredApps = applications.filter((app) => {
    if (filterScenario !== 'ALL' && app.scenario !== filterScenario) return false;
    if (searchTerm) {
      const match =
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.product_type.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let payload: any = {};

      if (modalMode === 'JSON') {
        try {
          payload = JSON.parse(jsonInput || sampleJsonTemplate);
          setJsonError(null);
        } catch (err: any) {
          setJsonError(`Invalid JSON format: ${err.message}`);
          return;
        }
      } else {
        payload = {
          customer_name: formName,
          email: formEmail,
          phone: formPhone,
          dob: formDob,
          address: formAddress,
          product_type: formProduct,
          annual_income: Number(formIncome),
          monthly_expenses: Number(formMonthlyExpenses),
          requested_credit_limit: Number(formCreditLimit),
          employment_status: formEmployment,
          employer_name: formEmployer,
          credit_score: Number(formCreditScore),
          id_type: formIdType,
          id_number: formIdNumber,
          scenario: formScenario,
          has_document_mismatch: formDocMismatch,
          tamper_flags_detected: formTamperDetected,
          pep_status: formPepStatus,
        };
      }

      const resp = await fetch('/api/v1/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        const created = await resp.json();
        setShowCreateModal(false);
        onSelectApplication(created.id);
        onLaunchWorkflow(created.id);
      } else {
        const errData = await resp.json();
        alert(`Error creating application: ${errData.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Failed to create application:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Demonstration Scenarios Quick-Launch Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Demonstration Scenarios (1-Click Multi-Agent Execution)
            </h3>
            <p className="text-xs text-slate-500">
              Select any pre-configured enterprise scenario to trigger the autonomous LangGraph workflow
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              id="bulk-seed-btn"
              onClick={() => onBulkSeed(1000)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Generate 1,000+ Records</span>
            </button>
            <button
              id="create-app-btn"
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom Applicant</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Scenario 1 */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  SCENARIO 1
                </span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Normal Low-Risk Approval</h4>
              <p className="text-xs text-slate-600 mb-3">
                Elena Rostova: ₹14,50,000 (14.5L) income, 760 credit score, verified passport. Standard automated fast-track approval.
              </p>
            </div>
            <button
              id="btn-scenario-1"
              onClick={() => {
                const target = applications.find((a) => a.scenario === 'LOW_RISK') || applications[0];
                if (target) {
                  onSelectApplication(target.id);
                  onLaunchWorkflow(target.id);
                }
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Scenario 1</span>
            </button>
          </div>

          {/* Scenario 2 */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  SCENARIO 2
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Document Discrepancy & Review</h4>
              <p className="text-xs text-slate-600 mb-3">
                Marcus Vance: Name OCR mismatch &amp; moderate debt ratio. Automatically routes to Human Review queue.
              </p>
            </div>
            <button
              id="btn-scenario-2"
              onClick={() => {
                const target = applications.find((a) => a.scenario === 'MEDIUM_RISK') || applications[1];
                if (target) {
                  onSelectApplication(target.id);
                  onLaunchWorkflow(target.id);
                }
              }}
              className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Scenario 2</span>
            </button>
          </div>

          {/* Scenario 3 */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  SCENARIO 3
                </span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Suspicious / Tampered Fraud</h4>
              <p className="text-xs text-slate-600 mb-3">
                Alex Chen: Tampered driver license, disposable email, sanctions match. Immediate security escalation.
              </p>
            </div>
            <button
              id="btn-scenario-3"
              onClick={() => {
                const target = applications.find((a) => a.scenario === 'FRAUD_SUSPECT') || applications[2];
                if (target) {
                  onSelectApplication(target.id);
                  onLaunchWorkflow(target.id);
                }
              }}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Scenario 3</span>
            </button>
          </div>

          {/* Scenario 4 */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between ${
              isOutageActive
                ? 'border-indigo-400 bg-indigo-50/70 ring-2 ring-indigo-500'
                : 'border-slate-200 bg-slate-50/70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                  SCENARIO 4
                </span>
                <ServerCrash className={`w-4 h-4 ${isOutageActive ? 'text-indigo-600' : 'text-slate-500'}`} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">API Outage & Fallback Recovery</h4>
              <p className="text-xs text-slate-600 mb-3">
                Tests circuit-breaker: live external market API timeout triggers fallback reserve cache automatically.
              </p>
            </div>
            <div className="space-y-1.5">
              <button
                id="btn-scenario-4-toggle"
                onClick={() => onSimulateOutageToggle(!isOutageActive)}
                className={`w-full py-1.5 text-xs font-semibold rounded-lg transition border ${
                  isOutageActive
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isOutageActive ? 'Simulated Outage: ACTIVE' : 'Toggle Live Outage'}
              </button>
              <button
                id="btn-scenario-4"
                onClick={() => {
                  const target = applications[0];
                  if (target) {
                    onSelectApplication(target.id);
                    onLaunchWorkflow(target.id);
                  }
                }}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1"
              >
                <Play className="w-3 h-3" />
                <span>Run with Outage Test</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Data Entry Explainer Callout */}
      <div className="bg-linear-to-r from-indigo-50/80 via-white to-slate-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Want to test your own custom customer data or edge cases?</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              You are not limited to pre-defined fixtures. Click <strong className="text-indigo-700">"+ Custom Applicant"</strong> to input your own custom names, credit scores, declared incomes, and verification documents, or paste raw JSON.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            id="btn-open-custom-studio"
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enter Your Data</span>
          </button>
        </div>
      </div>

      {/* Applications Directory & Management Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Synthetic Banking Applications Registry ({totalApplications.toLocaleString()})
            </h3>
            <span className="text-[11px] text-slate-500">
              Complies with strict regulatory data isolation policy (Synthetic test fixtures only)
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Filter */}
            <select
              id="filter-scenario"
              value={filterScenario}
              onChange={(e) => setFilterScenario(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="LOW_RISK">Low Risk</option>
              <option value="MEDIUM_RISK">Medium Risk</option>
              <option value="HIGH_RISK">High Risk</option>
              <option value="FRAUD_SUSPECT">Fraud Suspect</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                id="search-applications"
                type="text"
                placeholder="Search applicant or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Table */}
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
              {filteredApps.map((app) => {
                const isSelected = selectedApplicationId === app.id;
                return (
                  <tr
                    key={app.id}
                    id={`app-row-${app.id}`}
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
                            : app.scenario === 'MEDIUM_RISK'
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
                        id={`btn-run-${app.id}`}
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

        {/* Pagination Bar */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing page {currentPage} of {Math.max(1, Math.ceil(totalApplications / 20))}
          </span>
          <div className="flex items-center space-x-2">
            <button
              id="prev-page-btn"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              id="next-page-btn"
              disabled={currentPage >= Math.ceil(totalApplications / 20)}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-2.5 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Custom Applicant & Data Ingestion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Custom Applicant &amp; Data Ingestion Studio</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your own custom customer profile, financials, credit score, and verification documents to evaluate through the autonomous 8-agent decision engine.
                </p>
              </div>
              <button
                id="btn-close-modal"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher & Presets */}
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  id="tab-mode-form"
                  onClick={() => setModalMode('FORM')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition flex items-center space-x-1.5 ${
                    modalMode === 'FORM' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Interactive Form</span>
                </button>
                <button
                  type="button"
                  id="tab-mode-json"
                  onClick={() => {
                    setModalMode('JSON');
                    if (!jsonInput) setJsonInput(sampleJsonTemplate);
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition flex items-center space-x-1.5 ${
                    modalMode === 'JSON' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Raw JSON / REST Ingest</span>
                </button>
              </div>

              {/* Quick Presets */}
              {modalMode === 'FORM' && (
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <span className="text-slate-400 font-medium">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset('PRIME')}
                    className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded border border-emerald-200 font-medium transition"
                  >
                    Prime (Elena)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('REVIEW')}
                    className="px-2 py-0.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded border border-amber-200 font-medium transition"
                  >
                    Review (Marcus)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('FRAUD')}
                    className="px-2 py-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded border border-rose-200 font-medium transition"
                  >
                    Fraud (Alex)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('BLANK')}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded font-medium transition"
                  >
                    Blank Form
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto py-4 pr-1">
              {modalMode === 'FORM' ? (
                <form id="custom-applicant-form" onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                  {/* Section 1: Customer Demographic & Contact */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs uppercase tracking-wide">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>1. Customer Identity &amp; Contact</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                        <input
                          id="input-applicant-name"
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                        <input
                          id="input-applicant-email"
                          type="email"
                          required
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="e.g. jane.doe@example.com"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                        <input
                          id="input-applicant-phone"
                          type="text"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="e.g. +1-555-0199"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                        <input
                          id="input-applicant-dob"
                          type="date"
                          value={formDob}
                          onChange={(e) => setFormDob(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                        <input
                          id="input-applicant-address"
                          type="text"
                          value={formAddress}
                          onChange={(e) => setFormAddress(e.target.value)}
                          placeholder="e.g. 742 Evergreen Terrace, Springfield, OR"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Product & Financial Profile */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                    <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs uppercase tracking-wide">
                      <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                      <span>2. Product &amp; Financial Profile</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Requested Product</label>
                        <select
                          id="input-applicant-product"
                          value={formProduct}
                          onChange={(e) => setFormProduct(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="PREMIUM_CHECKING">Premium Checking</option>
                          <option value="BUSINESS_ACCOUNT">Business Account</option>
                          <option value="SAVINGS_ACCOUNT">High-Yield Savings</option>
                          <option value="CREDIT_LINE">Revolving Credit Line</option>
                          <option value="COMMERCIAL_LOAN">Commercial Loan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Annual Declared Income (₹) *</label>
                        <input
                          id="input-applicant-income"
                          type="number"
                          required
                          min="0"
                          value={formIncome}
                          onChange={(e) => setFormIncome(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Monthly Expenses / Debt (₹)</label>
                        <input
                          id="input-applicant-expenses"
                          type="number"
                          min="0"
                          value={formMonthlyExpenses}
                          onChange={(e) => setFormMonthlyExpenses(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Requested Credit Limit (₹)</label>
                        <input
                          id="input-applicant-limit"
                          type="number"
                          min="0"
                          value={formCreditLimit}
                          onChange={(e) => setFormCreditLimit(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Employment Status</label>
                        <select
                          id="input-applicant-employment"
                          value={formEmployment}
                          onChange={(e: any) => setFormEmployment(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="EMPLOYED">Employed</option>
                          <option value="SELF_EMPLOYED">Self-Employed</option>
                          <option value="RETIRED">Retired</option>
                          <option value="STUDENT">Student</option>
                          <option value="UNEMPLOYED">Unemployed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Employer / Business Name</label>
                        <input
                          id="input-applicant-employer"
                          type="text"
                          value={formEmployer}
                          onChange={(e) => setFormEmployer(e.target.value)}
                          placeholder="e.g. Apex Technologies"
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Credit Score & Sandbox Test Controls */}
                  <div className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs uppercase tracking-wide">
                        <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>3. Credit Bureau &amp; Document Sandbox Controls</span>
                      </h4>
                      <span className="text-[11px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                        Credit Score: {formCreditScore} (
                        {formCreditScore >= 740 ? 'Excellent' : formCreditScore >= 670 ? 'Good' : formCreditScore >= 580 ? 'Fair' : 'Poor'})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Credit Score (300 - 850)</label>
                        <div className="flex items-center space-x-2">
                          <input
                            id="input-applicant-credit-range"
                            type="range"
                            min="300"
                            max="850"
                            value={formCreditScore}
                            onChange={(e) => setFormCreditScore(Number(e.target.value))}
                            className="w-full accent-indigo-600"
                          />
                          <input
                            id="input-applicant-credit-score"
                            type="number"
                            min="300"
                            max="850"
                            value={formCreditScore}
                            onChange={(e) => setFormCreditScore(Number(e.target.value))}
                            className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-mono font-bold bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Declared ID Type</label>
                        <select
                          id="input-applicant-id-type"
                          value={formIdType}
                          onChange={(e: any) => setFormIdType(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="PASSPORT">Passport</option>
                          <option value="DRIVING_LICENSE">Driving License</option>
                          <option value="NATIONAL_ID">National ID Card</option>
                          <option value="TAX_ID">Tax ID / SSN</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Declared ID Number</label>
                        <input
                          id="input-applicant-id-number"
                          type="text"
                          value={formIdNumber}
                          onChange={(e) => setFormIdNumber(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Checkbox triggers for edge-case simulation */}
                    <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                      <label className="flex items-start space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input
                          id="chk-doc-mismatch"
                          type="checkbox"
                          checked={formDocMismatch}
                          onChange={(e) => setFormDocMismatch(e.target.checked)}
                          className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block">OCR Discrepancy</span>
                          <span className="text-slate-500 text-[10px]">Simulate name/DOB mismatch to trigger Human Review</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input
                          id="chk-tamper-flag"
                          type="checkbox"
                          checked={formTamperDetected}
                          onChange={(e) => setFormTamperDetected(e.target.checked)}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block">Tampered Document</span>
                          <span className="text-slate-500 text-[10px]">Simulate pixel anomalies to trigger Fraud escalation</span>
                        </div>
                      </label>

                      <label className="flex items-start space-x-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
                        <input
                          id="chk-pep-status"
                          type="checkbox"
                          checked={formPepStatus}
                          onChange={(e) => setFormPepStatus(e.target.checked)}
                          className="mt-0.5 rounded text-rose-600 focus:ring-rose-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-800 block">PEP / Sanctions Hit</span>
                          <span className="text-slate-500 text-[10px]">Simulate high-risk compliance sanctions flag</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">
                      Paste a raw JSON payload conforming to the banking application ingestion API:
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        id="btn-load-template"
                        onClick={() => {
                          setJsonInput(sampleJsonTemplate);
                          setJsonError(null);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition"
                      >
                        Reset to Template
                      </button>
                      <button
                        type="button"
                        id="btn-copy-json"
                        onClick={() => {
                          navigator.clipboard.writeText(jsonInput || sampleJsonTemplate);
                          setCopiedTemplate(true);
                          setTimeout(() => setCopiedTemplate(false), 2000);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium transition flex items-center space-x-1"
                      >
                        {copiedTemplate ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTemplate ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    id="textarea-json-input"
                    rows={15}
                    value={jsonInput || sampleJsonTemplate}
                    onChange={(e) => {
                      setJsonInput(e.target.value);
                      setJsonError(null);
                    }}
                    className="w-full p-3 font-mono text-xs bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />

                  {jsonError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{jsonError}</span>
                    </div>
                  )}

                  <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 space-y-1">
                    <span className="font-bold block">REST Endpoint Equivalent:</span>
                    <code className="font-mono bg-white px-2 py-0.5 rounded border border-indigo-200 block text-[11px]">
                      curl -X POST http://localhost:3000/api/v1/applications -H "Content-Type: application/json" -d '{`{...}`}'
                    </code>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Saves record to registry and immediately triggers 8-agent LangGraph execution.
              </span>
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  id="btn-cancel-create"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-submit-create"
                  onClick={(e) => handleCreateSubmit(e)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-xs transition flex items-center space-x-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Save &amp; Run 8-Agent Workflow</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
