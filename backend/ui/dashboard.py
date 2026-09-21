"""
Aegis Banking Web UI Template Generator in Python
Converted from src/App.tsx, Header.tsx, ApplicationLauncher.tsx, WorkflowVisualizer.tsx,
ReviewPortal.tsx, AgentObservability.tsx, AuditLogExplorer.tsx, SpecializedRiskEngines.tsx,
PolicyAndMarketHub.tsx, and ApiDocumentation.tsx.
Serves pure HTML/Tailwind styling dynamically rendered from Python.
"""
from typing import Dict, Any, List
import json

def render_dashboard_html(data: Dict[str, Any]) -> str:
    metrics = data.get("metrics", {})
    applications = data.get("applications", [])
    agents = data.get("agents", [])
    tools = data.get("tools", [])
    
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aegis Banking Multi-Agent AI Decision Engine</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen">
    <!-- Header Component (Python rendered) -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-xl">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                    <div class="flex items-center space-x-2">
                        <h1 class="text-base font-bold text-slate-900 tracking-tight">AEGIS BANKING</h1>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Python 3.10 Engine
                        </span>
                    </div>
                    <p class="text-xs text-slate-500">Autonomous Multi-Agent Underwriting &amp; Decision Platform</p>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="font-medium">System Health: Normal</span>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <!-- Key Metrics Cards (from Python metrics) -->
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-xs font-semibold uppercase text-slate-500">Total Applications</div>
                <div class="text-2xl font-bold text-slate-900 mt-1">{metrics.get('total_applications', 4)}</div>
                <div class="text-xs text-emerald-600 mt-1"><i class="fa-solid fa-arrow-up"></i> Live pipeline active</div>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-xs font-semibold uppercase text-slate-500">Pending Human Review</div>
                <div class="text-2xl font-bold text-amber-600 mt-1">{metrics.get('review_required', 2)}</div>
                <div class="text-xs text-slate-500 mt-1">Supervisory oversight active</div>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-xs font-semibold uppercase text-slate-500">Active Python Agents</div>
                <div class="text-2xl font-bold text-indigo-600 mt-1">{len(agents) if agents else 8}</div>
                <div class="text-xs text-indigo-600 mt-1">LangGraph autonomous fleet</div>
            </div>
            <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div class="text-xs font-semibold uppercase text-slate-500">Avg Decision Latency</div>
                <div class="text-2xl font-bold text-slate-900 mt-1">{metrics.get('average_processing_time_ms', 1420)}ms</div>
                <div class="text-xs text-emerald-600 mt-1">High-throughput execution</div>
            </div>
        </section>

        <!-- Multi-Agent Fleet Status Grid -->
        <section class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center">
                <i class="fa-solid fa-network-wired mr-2 text-indigo-600"></i> Python Autonomous Agents Fleet
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {''.join([f'''
                <div class="p-4 rounded-lg border border-slate-100 bg-slate-50">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-slate-900 text-sm">{a.get("name")}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">ACTIVE</span>
                    </div>
                    <p class="text-xs text-slate-500 mb-3">{a.get("role")}</p>
                    <div class="text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-200">
                        Tools: {", ".join(a.get("allowed_tools", []))}
                    </div>
                </div>
                ''' for a in agents])}
            </div>
        </section>

        <!-- Tools Registry & Quantitative Risk -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center">
                    <i class="fa-solid fa-screwdriver-wrench mr-2 text-indigo-600"></i> Python Banking Tools ({len(tools)})
                </h2>
                <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {''.join([f'''
                    <div class="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div>
                            <div class="text-xs font-mono font-bold text-indigo-700">{t.get("name")}</div>
                            <div class="text-[11px] text-slate-500">{t.get("description")}</div>
                        </div>
                        <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">{t.get("category")}</span>
                    </div>
                    ''' for t in tools])}
                </div>
            </div>

            <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 class="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center">
                    <i class="fa-solid fa-calculator mr-2 text-indigo-600"></i> Quantitative Risk &amp; Basel III Engine
                </h2>
                <div class="space-y-4">
                    <div class="p-4 rounded-lg bg-indigo-50 border border-indigo-100">
                        <div class="text-xs font-bold text-indigo-900 uppercase">Dodd-Frank Ability-to-Repay &amp; QM</div>
                        <div class="text-xs text-indigo-700 mt-1">Automated DTI ratio calculation and LTV threshold evaluation in pure Python.</div>
                    </div>
                    <div class="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                        <div class="text-xs font-bold text-emerald-900 uppercase">Basel III Capital Adequacy</div>
                        <div class="text-xs text-emerald-700 mt-1">Tier-1 CET1 ratio tests, 200 bps duration shock scenarios, and 99% Value-at-Risk modeling.</div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <footer class="bg-white border-t border-slate-200 py-6 mt-12">
        <div class="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
            Aegis Multi-Agent Banking Decision Engine &bull; Enterprise Risk &amp; Underwriting Platform &bull; Python FastAPI Backend
        </div>
    </footer>
</body>
</html>"""
