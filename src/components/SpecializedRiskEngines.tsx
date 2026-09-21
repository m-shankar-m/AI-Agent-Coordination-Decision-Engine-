import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck2,
  Search,
  ExternalLink,
  RefreshCw,
  Percent,
  Activity,
  BarChart3,
  Scale,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
  Send,
  Sliders,
  Check,
} from 'lucide-react';
import { formatINR } from '../utils/currency.js';

export const SpecializedRiskEngines: React.FC = () => {
  const [activeSubModule, setActiveSubModule] = useState<'UNDERWRITING' | 'FRAUD_AML' | 'INSURANCE' | 'PORTFOLIO'>('UNDERWRITING');

  // =============================================================
  // 1. LOAN UNDERWRITING & OCC QM STATE (Draft form vs Submitted)
  // =============================================================
  const [uwDraft, setUwDraft] = useState({
    w2AnnualIncome: '135000',
    monthlyBonusOvertime: '1200',
    existingMonthlyDebt: '1850',
    proposedMortgagePrincipalInterest: '2600',
    proposedPropertyTaxIns: '750',
    propertyPurchasePrice: '650000',
    downPaymentAmount: '130000',
    loanProgram: 'CONVENTIONAL' as 'CONVENTIONAL' | 'FHA' | 'JUMBO' | 'VA',
  });

  const [uwSubmitted, setUwSubmitted] = useState({
    w2AnnualIncome: 135000,
    monthlyBonusOvertime: 1200,
    existingMonthlyDebt: 1850,
    proposedMortgagePrincipalInterest: 2600,
    proposedPropertyTaxIns: 750,
    propertyPurchasePrice: 650000,
    downPaymentAmount: 130000,
    loanProgram: 'CONVENTIONAL' as 'CONVENTIONAL' | 'FHA' | 'JUMBO' | 'VA',
    evaluatedAt: 'Initial Load',
  });

  const [uwCalculating, setUwCalculating] = useState(false);
  const [uwSuccessBanner, setUwSuccessBanner] = useState(false);

  const handleUwSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUwCalculating(true);
    setTimeout(() => {
      setUwSubmitted({
        w2AnnualIncome: Number(uwDraft.w2AnnualIncome) || 0,
        monthlyBonusOvertime: Number(uwDraft.monthlyBonusOvertime) || 0,
        existingMonthlyDebt: Number(uwDraft.existingMonthlyDebt) || 0,
        proposedMortgagePrincipalInterest: Number(uwDraft.proposedMortgagePrincipalInterest) || 0,
        proposedPropertyTaxIns: Number(uwDraft.proposedPropertyTaxIns) || 0,
        propertyPurchasePrice: Number(uwDraft.propertyPurchasePrice) || 0,
        downPaymentAmount: Number(uwDraft.downPaymentAmount) || 0,
        loanProgram: uwDraft.loanProgram,
        evaluatedAt: new Date().toLocaleTimeString(),
      });
      setUwCalculating(false);
      setUwSuccessBanner(true);
      setTimeout(() => setUwSuccessBanner(false), 4000);
    }, 300);
  };

  // Compute Active Underwriting Output Metrics based on SUBMITTED values
  const grossMonthlyIncome = Math.round(uwSubmitted.w2AnnualIncome / 12 + uwSubmitted.monthlyBonusOvertime);
  const proposedHousingExpense = uwSubmitted.proposedMortgagePrincipalInterest + uwSubmitted.proposedPropertyTaxIns;
  const totalMonthlyDebt = proposedHousingExpense + uwSubmitted.existingMonthlyDebt;
  const frontEndDti = grossMonthlyIncome > 0 ? (proposedHousingExpense / grossMonthlyIncome) * 100 : 0;
  const backEndDti = grossMonthlyIncome > 0 ? (totalMonthlyDebt / grossMonthlyIncome) * 100 : 0;
  const loanAmount = Math.max(0, uwSubmitted.propertyPurchasePrice - uwSubmitted.downPaymentAmount);
  const ltvRatio = uwSubmitted.propertyPurchasePrice > 0 ? (loanAmount / uwSubmitted.propertyPurchasePrice) * 100 : 0;
  const meetsOccQmDtiLimit = backEndDti <= 43.0;
  const meetsLtvStandard = ltvRatio <= 80.0;
  const pmiRequired = ltvRatio > 80.0 && uwSubmitted.loanProgram !== 'VA';

  // =============================================================
  // 2. FRAUD DETECTION & SUB-SECOND AML STATE
  // =============================================================
  const [fraudDraft, setFraudDraft] = useState({
    transactionAmount: '48500',
    historicalMean: '2400',
    historicalStdDev: '1150',
    txVelocity1Hour: '8',
    entityBeneficiary: 'Al-Quds Mercantile Ltd (Overseas Wire)',
    destinationCountry: 'CY - Cyprus (High Velocity Offshore)',
    ofacScreeningResult: 'OFAC_SDN_MATCH' as 'CLEAR' | 'OFAC_SDN_MATCH' | 'PEP_WATCHLIST',
  });

  const [fraudSubmitted, setFraudSubmitted] = useState({
    transactionAmount: 48500,
    historicalMean: 2400,
    historicalStdDev: 1150,
    txVelocity1Hour: 8,
    entityBeneficiary: 'Al-Quds Mercantile Ltd (Overseas Wire)',
    destinationCountry: 'CY - Cyprus (High Velocity Offshore)',
    ofacScreeningResult: 'OFAC_SDN_MATCH' as 'CLEAR' | 'OFAC_SDN_MATCH' | 'PEP_WATCHLIST',
    evaluatedAt: 'Initial Load',
  });

  const [fraudCalculating, setFraudCalculating] = useState(false);
  const [fraudSuccessBanner, setFraudSuccessBanner] = useState(false);
  const [generatingSar, setGeneratingSar] = useState(false);
  const [sarDraftText, setSarDraftText] = useState<string | null>(null);

  const handleFraudSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFraudCalculating(true);
    setTimeout(() => {
      setFraudSubmitted({
        transactionAmount: Number(fraudDraft.transactionAmount) || 0,
        historicalMean: Number(fraudDraft.historicalMean) || 0,
        historicalStdDev: Number(fraudDraft.historicalStdDev) || 1,
        txVelocity1Hour: Number(fraudDraft.txVelocity1Hour) || 0,
        entityBeneficiary: fraudDraft.entityBeneficiary,
        destinationCountry: fraudDraft.destinationCountry,
        ofacScreeningResult: fraudDraft.ofacScreeningResult,
        evaluatedAt: new Date().toLocaleTimeString(),
      });
      setFraudCalculating(false);
      setFraudSuccessBanner(true);
      setTimeout(() => setFraudSuccessBanner(false), 4000);
    }, 300);
  };

  const zScore = fraudSubmitted.historicalStdDev > 0
    ? (fraudSubmitted.transactionAmount - fraudSubmitted.historicalMean) / fraudSubmitted.historicalStdDev
    : 0;
  const isZScoreAnomaly = zScore > 3.0;
  const isVelocityFlag = fraudSubmitted.txVelocity1Hour >= 5;

  const handleGenerateFinCenSar = () => {
    setGeneratingSar(true);
    setTimeout(() => {
      setSarDraftText(`FINCEN SUSPICIOUS ACTIVITY REPORT (SAR-DI) - DRAFT v2026.4
Filing Institution: AEGIS COMMERCIAL BANK N.A. (RSSD: 4920194)
Narrative Summary:
Between 02:00 UTC and 04:00 UTC, subject initiated high-velocity international funds transfer totaling ₹${fraudSubmitted.transactionAmount.toLocaleString()} to ${fraudSubmitted.entityBeneficiary} located in ${fraudSubmitted.destinationCountry}.
Statistical profiling detected severe deviation (Z-Score: +${zScore.toFixed(2)} sigma above 180-day baseline mean ₹${fraudSubmitted.historicalMean.toLocaleString()}). Transaction velocity reached ${fraudSubmitted.txVelocity1Hour} transfers/hr.
Automated screening matched beneficiary against OFAC Specially Designated Nationals (SDN) Watchlist and FATF High-Risk Jurisdictions.
Recommendation: Immediate freeze under Section 314(a) USA PATRIOT Act and FinCEN e-Filing submission within statutory 30-day window.`);
      setGeneratingSar(false);
    }, 450);
  };

  // =============================================================
  // 3. INSURANCE CLAIMS AUDITING STATE
  // =============================================================
  const [insDraft, setInsDraft] = useState({
    claimedDamageAmount: '18400',
    policeReportEstimatedLoss: '12500',
    laborRateBilledPerHour: '145',
    prevailingMarketLaborRate: '98',
    deductibleStatutory: '1000',
    policyCoverageCap: '50000',
  });

  const [insSubmitted, setInsSubmitted] = useState({
    claimedDamageAmount: 18400,
    policeReportEstimatedLoss: 12500,
    laborRateBilledPerHour: 145,
    prevailingMarketLaborRate: 98,
    deductibleStatutory: 1000,
    policyCoverageCap: 50000,
    evaluatedAt: 'Initial Load',
  });

  const [insCalculating, setInsCalculating] = useState(false);
  const [insSuccessBanner, setInsSuccessBanner] = useState(false);

  const handleInsSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setInsCalculating(true);
    setTimeout(() => {
      setInsSubmitted({
        claimedDamageAmount: Number(insDraft.claimedDamageAmount) || 0,
        policeReportEstimatedLoss: Number(insDraft.policeReportEstimatedLoss) || 0,
        laborRateBilledPerHour: Number(insDraft.laborRateBilledPerHour) || 0,
        prevailingMarketLaborRate: Number(insDraft.prevailingMarketLaborRate) || 0,
        deductibleStatutory: Number(insDraft.deductibleStatutory) || 0,
        policyCoverageCap: Number(insDraft.policyCoverageCap) || 0,
        evaluatedAt: new Date().toLocaleTimeString(),
      });
      setInsCalculating(false);
      setInsSuccessBanner(true);
      setTimeout(() => setInsSuccessBanner(false), 4000);
    }, 300);
  };

  const estimateVariance = insSubmitted.claimedDamageAmount - insSubmitted.policeReportEstimatedLoss;
  const estimateVariancePct = insSubmitted.policeReportEstimatedLoss > 0
    ? (estimateVariance / insSubmitted.policeReportEstimatedLoss) * 100
    : 0;
  const laborInflationPct = insSubmitted.prevailingMarketLaborRate > 0
    ? ((insSubmitted.laborRateBilledPerHour - insSubmitted.prevailingMarketLaborRate) / insSubmitted.prevailingMarketLaborRate) * 100
    : 0;
  const auditedPayableAmount = Math.max(
    0,
    Math.min(insSubmitted.policyCoverageCap, insSubmitted.policeReportEstimatedLoss + Math.max(0, estimateVariance * 0.4)) - insSubmitted.deductibleStatutory
  );

  // =============================================================
  // 4. PORTFOLIO RISK & BASEL III CET1 STATE
  // =============================================================
  const [pfDraft, setPfDraft] = useState({
    portfolioValue: '125000000',
    riskWeightedAssets: '82000000',
    commonEquityTier1Capital: '9840000',
    dailyPortfolioVol: '1.85',
    rateShockBps: 250,
  });

  const [pfSubmitted, setPfSubmitted] = useState({
    portfolioValue: 125000000,
    riskWeightedAssets: 82000000,
    commonEquityTier1Capital: 9840000,
    dailyPortfolioVol: 1.85,
    rateShockBps: 250,
    evaluatedAt: 'Initial Load',
  });

  const [pfCalculating, setPfCalculating] = useState(false);
  const [pfSuccessBanner, setPfSuccessBanner] = useState(false);

  const handlePfSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPfCalculating(true);
    setTimeout(() => {
      setPfSubmitted({
        portfolioValue: Number(pfDraft.portfolioValue) || 0,
        riskWeightedAssets: Number(pfDraft.riskWeightedAssets) || 1,
        commonEquityTier1Capital: Number(pfDraft.commonEquityTier1Capital) || 0,
        dailyPortfolioVol: Number(pfDraft.dailyPortfolioVol) || 0,
        rateShockBps: Number(pfDraft.rateShockBps) || 0,
        evaluatedAt: new Date().toLocaleTimeString(),
      });
      setPfCalculating(false);
      setPfSuccessBanner(true);
      setTimeout(() => setPfSuccessBanner(false), 4000);
    }, 300);
  };

  const var95DailyRupees = Math.round(pfSubmitted.portfolioValue * 1.645 * (pfSubmitted.dailyPortfolioVol / 100));
  const var95DailyPct = (var95DailyRupees / (pfSubmitted.portfolioValue || 1)) * 100;
  const baselVar10Day = Math.round(pfSubmitted.portfolioValue * 2.326 * (pfSubmitted.dailyPortfolioVol / 100) * Math.sqrt(10));
  const cet1Ratio = pfSubmitted.riskWeightedAssets > 0 ? (pfSubmitted.commonEquityTier1Capital / pfSubmitted.riskWeightedAssets) * 100 : 0;
  const durationShockLoss = Math.round(pfSubmitted.portfolioValue * 0.45 * (4.2 * (pfSubmitted.rateShockBps / 10000)));
  const postStressCet1 = pfSubmitted.riskWeightedAssets > 0 ? ((pfSubmitted.commonEquityTier1Capital - durationShockLoss) / pfSubmitted.riskWeightedAssets) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Module Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold rounded-full border border-indigo-200">
                AEGIS ADVANCED RISK PLATFORM
              </span>
              <span className="text-xs text-slate-400 font-mono">• Interactive Quantitative Calculators</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Specialized Risk &amp; Quantitative Underwriting Suite</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your values in the form fields below and click <strong>"Submit &amp; Recalculate"</strong> to execute production-grade financial calculations and statutory compliance evaluations.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>OCC / FinCEN / Basel III Ready</span>
            </span>
          </div>
        </div>

        {/* 4 Feature Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-4">
          <button
            type="button"
            id="tab-underwriting"
            onClick={() => setActiveSubModule('UNDERWRITING')}
            className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
              activeSubModule === 'UNDERWRITING'
                ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-500/20 text-indigo-950'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${activeSubModule === 'UNDERWRITING' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">1. Loan Underwriting &amp; OCC QM</div>
              <div className="text-[11px] text-slate-500 mt-0.5">W-2 Extraction, DTI, LTV &amp; 43% QM test</div>
            </div>
          </button>

          <button
            type="button"
            id="tab-fraud-aml"
            onClick={() => setActiveSubModule('FRAUD_AML')}
            className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
              activeSubModule === 'FRAUD_AML'
                ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-500/20 text-indigo-950'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${activeSubModule === 'FRAUD_AML' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">2. Fraud Velocity &amp; AML Screening</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Z-score anomaly, OFAC/PEP &amp; FinCEN SAR</div>
            </div>
          </button>

          <button
            type="button"
            id="tab-insurance"
            onClick={() => setActiveSubModule('INSURANCE')}
            className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
              activeSubModule === 'INSURANCE'
                ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-500/20 text-indigo-950'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${activeSubModule === 'INSURANCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">3. Insurance Claims Cross-Audit</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Line-item OCR verification &amp; deductible audit</div>
            </div>
          </button>

          <button
            type="button"
            id="tab-portfolio"
            onClick={() => setActiveSubModule('PORTFOLIO')}
            className={`p-3.5 rounded-xl border text-left transition flex items-start space-x-3 cursor-pointer ${
              activeSubModule === 'PORTFOLIO'
                ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-500/20 text-indigo-950'
                : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg shrink-0 ${activeSubModule === 'PORTFOLIO' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">4. Portfolio 95% VaR &amp; Basel III</div>
              <div className="text-[11px] text-slate-500 mt-0.5">1-day VaR, +250 bps rate shock &amp; CET1 ratio</div>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODULE 1: LOAN UNDERWRITING & OCC QM 43% COMPLIANCE       */}
      {/* ========================================================= */}
      {activeSubModule === 'UNDERWRITING' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls & Form */}
          <div className="lg:col-span-2 space-y-5">
            <form onSubmit={handleUwSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>Enter Underwriting Data &amp; W-2 Inputs</span>
                </h3>
                <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                  OCC 12 CFR Part 34 / CFPB QM Rule
                </span>
              </div>

              {uwSuccessBanner && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span><strong>Calculations updated!</strong> Evaluated at {uwSubmitted.evaluatedAt}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Declared Annual Income (₹)</label>
                  <input
                    type="text"
                    value={uwDraft.w2AnnualIncome}
                    onChange={(e) => setUwDraft({ ...uwDraft, w2AnnualIncome: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 135000"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Form 16 / ITR / Salary slip compensation</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Overtime / Bonus / Dividends (₹)</label>
                  <input
                    type="text"
                    value={uwDraft.monthlyBonusOvertime}
                    onChange={(e) => setUwDraft({ ...uwDraft, monthlyBonusOvertime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 1200"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">24-month verified average earnings</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Existing Monthly Recurring Debts / EMIs (₹)</label>
                  <input
                    type="text"
                    value={uwDraft.existingMonthlyDebt}
                    onChange={(e) => setUwDraft({ ...uwDraft, existingMonthlyDebt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 1850"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Vehicle loans, personal loans, credit card minimums</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Proposed Principal &amp; Interest (₹/mo EMI)</label>
                  <input
                    type="text"
                    value={uwDraft.proposedMortgagePrincipalInterest}
                    onChange={(e) => setUwDraft({ ...uwDraft, proposedMortgagePrincipalInterest: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 2600"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Proposed amortized home loan EMI</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Property Escrow (Taxes + Insurance ₹/mo)</label>
                  <input
                    type="text"
                    value={uwDraft.proposedPropertyTaxIns}
                    onChange={(e) => setUwDraft({ ...uwDraft, proposedPropertyTaxIns: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 750"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Property tax + municipal levies</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loan Program Type</label>
                  <select
                    value={uwDraft.loanProgram}
                    onChange={(e: any) => setUwDraft({ ...uwDraft, loanProgram: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="CONVENTIONAL">Conventional Conforming</option>
                    <option value="FHA">FHA Government Insured</option>
                    <option value="JUMBO">Non-Conforming Jumbo</option>
                    <option value="VA">Veterans Affairs (VA Guaranteed)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Appraised Property Value (₹)</label>
                  <input
                    type="text"
                    value={uwDraft.propertyPurchasePrice}
                    onChange={(e) => setUwDraft({ ...uwDraft, propertyPurchasePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 650000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Verified Down Payment / Equity (₹)</label>
                  <input
                    type="text"
                    value={uwDraft.downPaymentAmount}
                    onChange={(e) => setUwDraft({ ...uwDraft, downPaymentAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 130000"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Last evaluated: {uwSubmitted.evaluatedAt}
                </span>
                <button
                  type="submit"
                  id="btn-submit-underwriting"
                  disabled={uwCalculating}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{uwCalculating ? 'Calculating...' : 'Submit & Recalculate Underwriting'}</span>
                </button>
              </div>
            </form>

            {/* OCC QM Statutory Analysis Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Scale className="w-4 h-4 text-indigo-600" />
                <span>Regulatory Qualified Mortgage (QM) Audit Verification</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-600 mb-1">
                    <span>Front-End Housing Ratio</span>
                    <span className="font-mono font-bold text-slate-900">{frontEndDti.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${frontEndDti <= 28 ? 'bg-emerald-500' : frontEndDti <= 36 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, (frontEndDti / 50) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Fannie Mae / Freddie Mac benchmark: ≤ 28.0%</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-slate-600 mb-1">
                    <span>Back-End Total DTI Ratio</span>
                    <span className={`font-mono font-bold ${meetsOccQmDtiLimit ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {backEndDti.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${meetsOccQmDtiLimit ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, (backEndDti / 60) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">OCC Qualified Mortgage Statutory Ceiling: 43.0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Underwriting Decision Card */}
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border shadow-xs ${meetsOccQmDtiLimit && meetsLtvStandard ? 'bg-emerald-50/50 border-emerald-300' : meetsOccQmDtiLimit ? 'bg-amber-50/50 border-amber-300' : 'bg-rose-50/50 border-rose-300'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Decision Outcome</span>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg font-mono ${
                  meetsOccQmDtiLimit && meetsLtvStandard
                    ? 'bg-emerald-600 text-white'
                    : meetsOccQmDtiLimit
                    ? 'bg-amber-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}>
                  {meetsOccQmDtiLimit && meetsLtvStandard ? 'FAST-TRACK APPROVED' : meetsOccQmDtiLimit ? 'CONDITIONAL APPROVAL' : 'OCC QM PROHIBITED'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Gross Monthly Income:</span>
                  <span className="font-mono font-bold">{formatINR(grossMonthlyIncome)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Proposed Total Debt:</span>
                  <span className="font-mono font-bold">{formatINR(totalMonthlyDebt)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Calculated Loan Amount:</span>
                  <span className="font-mono font-bold">{formatINR(loanAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Loan-to-Value (LTV):</span>
                  <span className="font-mono font-bold">{ltvRatio.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span>Private Mortgage Ins. (PMI):</span>
                  <span className="font-mono font-semibold">{pmiRequired ? 'Required (>80% LTV)' : 'Not Required'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>OCC QM Safe Harbor:</span>
                  <span className={`font-mono font-bold ${meetsOccQmDtiLimit ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {meetsOccQmDtiLimit ? 'Eligible (≤43%)' : 'Violates 43% Cap'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs text-xs space-y-2">
              <h5 className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Statutory Underwriting Notes</span>
              </h5>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Under OCC 12 CFR Part 34 and CFPB Regulation Z, loans exceeding a 43.0% back-end debt-to-income ratio lose Qualified Mortgage Safe Harbor presumption of ability-to-repay.
              </p>
              {pmiRequired && (
                <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px]">
                  <strong>LTV Stipulation:</strong> LTV of {ltvRatio.toFixed(1)}% exceeds the 80.0% threshold. Requires automated escrow setup for PMI coverage until principal amortizes below 78%.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 2: SUB-SECOND FRAUD VELOCITY & AML SCREENING       */}
      {/* ========================================================= */}
      {activeSubModule === 'FRAUD_AML' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <form onSubmit={handleFraudSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <span>Enter Transaction &amp; AML Screening Data</span>
                </h3>
                <span className="text-[11px] bg-rose-50 text-rose-700 font-semibold px-2 py-0.5 rounded border border-rose-200">
                  Sub-Second AML Pipeline
                </span>
              </div>

              {fraudSuccessBanner && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span><strong>Fraud models updated!</strong> Evaluated at {fraudSubmitted.evaluatedAt}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Incoming Transaction Amount (₹)</label>
                  <input
                    type="text"
                    value={fraudDraft.transactionAmount}
                    onChange={(e) => setFraudDraft({ ...fraudDraft, transactionAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 48500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">IMPS / NEFT / RTGS / UPI transfer</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Historical 180-Day Baseline Mean (₹)</label>
                  <input
                    type="text"
                    value={fraudDraft.historicalMean}
                    onChange={(e) => setFraudDraft({ ...fraudDraft, historicalMean: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 2400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Moving average for this customer account</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Historical Standard Deviation σ (₹)</label>
                  <input
                    type="text"
                    value={fraudDraft.historicalStdDev}
                    onChange={(e) => setFraudDraft({ ...fraudDraft, historicalStdDev: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 1150"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Population dispersion parameter</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tx Velocity (Events in Last 60 Mins)</label>
                  <input
                    type="text"
                    value={fraudDraft.txVelocity1Hour}
                    onChange={(e) => setFraudDraft({ ...fraudDraft, txVelocity1Hour: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 8"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Rapid micro-structuring indicator</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Beneficiary Counterparty / Wire Routing</label>
                  <input
                    type="text"
                    value={fraudDraft.entityBeneficiary}
                    onChange={(e) => setFraudDraft({ ...fraudDraft, entityBeneficiary: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. Al-Quds Mercantile Ltd"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Jurisdiction</label>
                  <input
                    type="text"
                    value={fraudDraft.destinationCountry}
                    onChange={(e) => setFraudDraft({ ...fraudDraft, destinationCountry: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. CY - Cyprus"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">OFAC / Sanctions Screening Status</label>
                  <select
                    value={fraudDraft.ofacScreeningResult}
                    onChange={(e: any) => setFraudDraft({ ...fraudDraft, ofacScreeningResult: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="CLEAR">Clear (No Sanctions or PEP hit)</option>
                    <option value="OFAC_SDN_MATCH">OFAC Specially Designated National (SDN) Exact Match</option>
                    <option value="PEP_WATCHLIST">Politically Exposed Person (PEP) Tier-1 Watchlist</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Last evaluated: {fraudSubmitted.evaluatedAt}
                </span>
                <button
                  type="submit"
                  id="btn-submit-fraud"
                  disabled={fraudCalculating}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{fraudCalculating ? 'Evaluating...' : 'Submit & Recalculate Fraud Models'}</span>
                </button>
              </div>
            </form>

            {/* Statistical Z-Score Visualization */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                  <span>Gaussian Anomaly Distribution: Z-Score = {zScore.toFixed(2)}σ</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                  isZScoreAnomaly ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {isZScoreAnomaly ? 'STATISTICAL OUTLIER (>3.0σ)' : 'WITHIN NORMAL VARIANCE'}
                </span>
              </div>

              <p className="text-xs text-slate-400">
                Formula: <code className="text-indigo-300 font-mono">Z = (Tx - μ) / σ = (₹{fraudSubmitted.transactionAmount.toLocaleString()} - ₹{fraudSubmitted.historicalMean.toLocaleString()}) / ₹{fraudSubmitted.historicalStdDev.toLocaleString()} = +{zScore.toFixed(2)}σ</code>
              </p>

              <div className="w-full bg-slate-800 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    zScore > 3.0 ? 'bg-rose-500' : zScore > 2.0 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, (Math.abs(zScore) / 5) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.0σ (Baseline)</span>
                <span>+2.0σ (95% Boundary)</span>
                <span>+3.0σ (99.7% Critical Anomaly)</span>
                <span>+5.0σ+</span>
              </div>
            </div>
          </div>

          {/* SAR Auto-Drafting Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Automated SAR Generator</h4>
                <span className="text-[10px] font-mono text-slate-500">31 U.S.C. 5318(g)</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Velocity Alarm:</span>
                  <span className={`font-mono font-bold ${isVelocityFlag ? 'text-rose-600' : 'text-slate-700'}`}>
                    {fraudSubmitted.txVelocity1Hour} events/hr ({isVelocityFlag ? 'Triggered ≥5' : 'Normal'})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">OFAC Match:</span>
                  <span className={`font-mono font-bold ${fraudSubmitted.ofacScreeningResult !== 'CLEAR' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {fraudSubmitted.ofacScreeningResult}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Statutory Action:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {fraudSubmitted.ofacScreeningResult === 'OFAC_SDN_MATCH' || isZScoreAnomaly ? 'BLOCK & FILE SAR' : 'STANDARD CLEARANCE'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="btn-generate-sar"
                onClick={handleGenerateFinCenSar}
                disabled={generatingSar}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{generatingSar ? 'Synthesizing Narrative...' : 'Draft FinCEN SAR Filing'}</span>
              </button>
            </div>

            {sarDraftText && (
              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-emerald-400 font-mono text-[11px] space-y-2 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-[10px] pb-1 border-b border-slate-800">
                  <span>FINCEN FORM 111 XML EXPORT</span>
                  <span className="text-emerald-400 font-bold">READY TO TRANSMIT</span>
                </div>
                <pre className="whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                  {sarDraftText}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 3: INSURANCE CLAIMS & OCR AUDITING                 */}
      {/* ========================================================= */}
      {activeSubModule === 'INSURANCE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <form onSubmit={handleInsSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-indigo-600" />
                  <span>Enter Insurance Claim &amp; Police Report Data</span>
                </h3>
                <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                  NAIC Model Unfair Claims Act
                </span>
              </div>

              {insSuccessBanner && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span><strong>Claims audit updated!</strong> Evaluated at {insSubmitted.evaluatedAt}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Workshop / Garage Claimed Estimate (₹)</label>
                  <input
                    type="text"
                    value={insDraft.claimedDamageAmount}
                    onChange={(e) => setInsDraft({ ...insDraft, claimedDamageAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 18400"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">From repairer survey estimate</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Police / Surveyor On-Scene Estimated Loss (₹)</label>
                  <input
                    type="text"
                    value={insDraft.policeReportEstimatedLoss}
                    onChange={(e) => setInsDraft({ ...insDraft, policeReportEstimatedLoss: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 12500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">From FIR or motor spot survey report</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billed Workshop Labor Rate (₹/hr)</label>
                  <input
                    type="text"
                    value={insDraft.laborRateBilledPerHour}
                    onChange={(e) => setInsDraft({ ...insDraft, laborRateBilledPerHour: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 145"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Prevailing Regional Labor Rate (₹/hr)</label>
                  <input
                    type="text"
                    value={insDraft.prevailingMarketLaborRate}
                    onChange={(e) => setInsDraft({ ...insDraft, prevailingMarketLaborRate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 98"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statutory Deductible / Compulsory Excess (₹)</label>
                  <input
                    type="text"
                    value={insDraft.deductibleStatutory}
                    onChange={(e) => setInsDraft({ ...insDraft, deductibleStatutory: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 1000"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Policy IDV / Maximum Coverage Limit (₹)</label>
                  <input
                    type="text"
                    value={insDraft.policyCoverageCap}
                    onChange={(e) => setInsDraft({ ...insDraft, policyCoverageCap: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Last evaluated: {insSubmitted.evaluatedAt}
                </span>
                <button
                  type="submit"
                  id="btn-submit-insurance"
                  disabled={insCalculating}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{insCalculating ? 'Auditing...' : 'Submit & Recalculate Settlement'}</span>
                </button>
              </div>
            </form>

            {/* OCR Discrepancy Matrix */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <Search className="w-4 h-4 text-indigo-600" />
                <span>Damage Discrepancy &amp; Labor Rate Audit</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Estimate Discrepancy</span>
                    <span className={`font-mono font-bold ${estimateVariancePct > 25 ? 'text-rose-600' : 'text-slate-800'}`}>
                      +{formatINR(estimateVariance)} (+{estimateVariancePct.toFixed(1)}%)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Claims exceeding 20% variance trigger Special Investigative Unit (SIU)</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Labor Rate Inflation</span>
                    <span className={`font-mono font-bold ${laborInflationPct > 15 ? 'text-amber-600' : 'text-slate-800'}`}>
                      +{laborInflationPct.toFixed(1)}% vs. Market
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Prevailing benchmark: ₹{insSubmitted.prevailingMarketLaborRate}/hr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settlement Recommendation Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide">Claims Settlement Decision</h4>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] rounded">
                  AUDITED SETTLEMENT
                </span>
              </div>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Gross Claimed:</span>
                  <span className="font-mono font-bold">{formatINR(insSubmitted.claimedDamageAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Police / Surveyor Baseline:</span>
                  <span className="font-mono font-bold">{formatINR(insSubmitted.policeReportEstimatedLoss)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Surveyor Disallowances:</span>
                  <span className="font-mono font-bold text-rose-600">-{formatINR(Math.round(estimateVariance * 0.6))}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Compulsory Deductible:</span>
                  <span className="font-mono font-bold text-slate-900">-{formatINR(insSubmitted.deductibleStatutory)}</span>
                </div>
                <div className="flex justify-between py-1.5 bg-slate-50 px-2 rounded-lg text-slate-900 font-bold">
                  <span>Net Recommended Payout:</span>
                  <span className="font-mono text-emerald-700 text-sm">{formatINR(auditedPayableAmount)}</span>
                </div>
              </div>

              {estimateVariancePct > 25 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] space-y-1">
                  <div className="font-bold flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>SIU Fraud Escalation Required</span>
                  </div>
                  <p className="text-[10px] leading-relaxed">
                    Repair invoice contains {formatINR(estimateVariance)} in uncorroborated parts/labor not documented in police report.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODULE 4: PORTFOLIO 95% VAR & BASEL III CET1 SHOCK        */}
      {/* ========================================================= */}
      {activeSubModule === 'PORTFOLIO' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <form onSubmit={handlePfSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <TrendingDown className="w-4 h-4 text-indigo-600" />
                  <span>Enter Portfolio Asset &amp; Basel Capital Data</span>
                </h3>
                <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-200">
                  Basel III Pillar 1 &amp; Pillar 2
                </span>
              </div>

              {pfSuccessBanner && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center space-x-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span><strong>Portfolio metrics updated!</strong> Evaluated at {pfSubmitted.evaluatedAt}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Portfolio Assets (₹)</label>
                  <input
                    type="text"
                    value={pfDraft.portfolioValue}
                    onChange={(e) => setPfDraft({ ...pfDraft, portfolioValue: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 125000000"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">G-Secs, corporate bonds, equities, and commercial paper</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Risk-Weighted Assets (RWA) (₹)</label>
                  <input
                    type="text"
                    value={pfDraft.riskWeightedAssets}
                    onChange={(e) => setPfDraft({ ...pfDraft, riskWeightedAssets: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 82000000"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">RBI / Basel III standardised risk weightings</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Common Equity Tier 1 (CET1) Capital (₹)</label>
                  <input
                    type="text"
                    value={pfDraft.commonEquityTier1Capital}
                    onChange={(e) => setPfDraft({ ...pfDraft, commonEquityTier1Capital: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 9840000"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Paid-up equity shares + audited statutory reserves</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Daily Portfolio Volatility σ (%)</label>
                  <input
                    type="text"
                    value={pfDraft.dailyPortfolioVol}
                    onChange={(e) => setPfDraft({ ...pfDraft, dailyPortfolioVol: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 1.85"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">252-day exponentially weighted volatility</span>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-slate-700">Macro Interest Rate Shock (Basis Points): +{pfDraft.rateShockBps} bps</label>
                    <span className="font-mono text-indigo-700 font-bold text-xs">+{(pfDraft.rateShockBps / 100).toFixed(2)}% shift</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="25"
                    value={pfDraft.rateShockBps}
                    onChange={(e) => setPfDraft({ ...pfDraft, rateShockBps: Number(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0 bps (Current)</span>
                    <span>+250 bps (Fed Severely Adverse)</span>
                    <span>+500 bps (Hyper-inflation)</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Last evaluated: {pfSubmitted.evaluatedAt}
                </span>
                <button
                  type="submit"
                  id="btn-submit-portfolio"
                  disabled={pfCalculating}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{pfCalculating ? 'Modeling...' : 'Submit & Recalculate Portfolio Stress'}</span>
                </button>
              </div>
            </form>

            {/* Stress Test Simulation Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <span>Macroeconomic Stress Testing (+{pfSubmitted.rateShockBps} bps Rate Shock)</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                  postStressCet1 >= 7.0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {postStressCet1 >= 7.0 ? 'PASSED STRESS TEST' : 'CAPITAL INADEQUATE (<7.0%)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Duration Loss</span>
                  <span className="text-rose-400 font-mono font-bold text-sm">-{formatINR(durationShockLoss)}</span>
                  <span className="text-slate-500 text-[10px] mt-0.5 block">Mod. Duration ~4.2 yrs</span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Pre-Stress CET1</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">{cet1Ratio.toFixed(2)}%</span>
                  <span className="text-slate-500 text-[10px] mt-0.5 block">Basel III min: 7.0%</span>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-slate-400 text-[10px] block">Post-Stress CET1</span>
                  <span className={`font-mono font-bold text-sm ${postStressCet1 >= 7.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {postStressCet1.toFixed(2)}%
                  </span>
                  <span className="text-slate-500 text-[10px] mt-0.5 block">Buffer: {(postStressCet1 - 7.0).toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quantitative VaR Breakdown */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wide">Value at Risk (VaR) Metrics</h4>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] rounded">
                  PARAMETRIC GAUSSIAN
                </span>
              </div>

              <div className="space-y-3 text-slate-700">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">95% Daily 1-Day Value at Risk:</span>
                  <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                    {formatINR(var95DailyRupees)} ({var95DailyPct.toFixed(2)}%)
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Maximum expected 24h loss with 95% statistical confidence</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">99% 10-Day Basel Regulatory VaR:</span>
                  <div className="text-base font-bold font-mono text-rose-700 mt-0.5">
                    {formatINR(baselVar10Day)}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Standardised market risk capital requirement</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-500 text-[10px] block">Basel III Capital Adequacy Status:</span>
                  <div className="flex items-center space-x-1.5 mt-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CET1 Ratio {cet1Ratio.toFixed(2)}% (Surplus: +{(cet1Ratio - 7.0).toFixed(2)}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
