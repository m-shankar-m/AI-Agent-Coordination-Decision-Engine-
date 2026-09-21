"""
Aegis Banking Pure Python Server
Runs natively on Python 3 standard library (http.server) with zero external dependency requirements.
Provides complete REST API endpoints for applications, metrics, agents, tools, reviews, and dynamic UI rendering.
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
import time
import os
import sys
from datetime import datetime

# Ensure backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from data.synthetic_data import synthetic_data_service
from api.audit_service import audit_service
from api.review_service import review_service
from api.realtime_service import realtime_data_service
from memory.vector_store import vector_store
from utils.currency import format_currency
from ui.dashboard import render_dashboard_html
from tools.tool_registry import banking_tools
from agents import agent_fleet
from workflows.risk_engines import calculate_loan_underwriting, calculate_basel_iii_capital

server_start_time = time.time()

class BankingRequestHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()
        self.wfile.write(body)

    def _send_html(self, html_str, status=200):
        body = html_str.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path in ["/", "/index.html"]:
            html = render_dashboard_html({
                "metrics": {
                    "total_applications": len(synthetic_data_service.get_all_scenarios()),
                    "review_required": len(review_service.get_pending()),
                    "average_processing_time_ms": 1420,
                },
                "applications": [s["application"] for s in synthetic_data_service.get_all_scenarios()],
                "agents": [a.to_metadata() for a in agent_fleet.values()],
                "tools": [
                    {"name": k, "category": "CORE", "description": f"Banking tool {k}"}
                    for k in banking_tools.tool_stats.keys()
                ]
            })
            self._send_html(html)
            return

        if path == "/api/v1/health":
            self._send_json({
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "service": "banking-ai-decision-engine-python-native",
                "version": "1.0.0-enterprise",
                "uptime_seconds": int(time.time() - server_start_time),
            })
            return

        if path == "/api/v1/metrics":
            self._send_json({
                "total_applications": len(synthetic_data_service.get_all_scenarios()),
                "in_progress": 0,
                "completed": 2,
                "review_required": len(review_service.get_pending()),
                "approval_recommendations": 1,
                "rejection_recommendations": 1,
                "average_processing_time_ms": 1420,
                "agent_errors": 0,
                "tool_failures": 0,
                "human_review_rate": 0.5,
                "uptime_seconds": int(time.time() - server_start_time),
            })
            return

        if path == "/api/v1/applications":
            apps = [s["application"] for s in synthetic_data_service.get_all_scenarios()]
            self._send_json({"items": apps, "total": len(apps)})
            return

        if path == "/api/v1/reviews":
            self._send_json({
                "pending": review_service.get_pending(),
                "history": review_service.get_history()
            })
            return

        if path == "/api/v1/agents":
            self._send_json([a.to_metadata() for a in agent_fleet.values()])
            return

        if path == "/api/v1/tools":
            tools = [
                {"name": k, "stats": v, "category": "BANKING"}
                for k, v in banking_tools.tool_stats.items()
            ]
            self._send_json(tools)
            return

        if path == "/api/v1/realtime-data":
            self._send_json(realtime_data_service.get_financial_benchmarks())
            return

        if path == "/api/v1/audits":
            self._send_json(audit_service.get_logs())
            return

        self._send_json({"error": "Not Found", "path": path}, status=404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(post_data.decode("utf-8"))
        except Exception:
            payload = {}

        if path == "/api/v1/reviews/submit":
            app_id = payload.get("application_id")
            decision = payload.get("decision", "APPROVED")
            notes = payload.get("notes", "Supervisory override")
            res = review_service.submit_decision(app_id, decision, notes)
            self._send_json(res)
            return

        if path == "/api/v1/risk/underwrite":
            res = calculate_loan_underwriting(
                base_salary=float(payload.get("base_salary", 100000)),
                monthly_bonus=float(payload.get("monthly_bonus", 0)),
                existing_emi=float(payload.get("existing_emi", 1500)),
                new_loan_emi=float(payload.get("new_loan_emi", 2500)),
                prop_tax_ins=float(payload.get("prop_tax_ins", 500)),
                purchase_price=float(payload.get("purchase_price", 500000)),
                down_payment=float(payload.get("down_payment", 100000)),
            )
            self._send_json(res)
            return

        self._send_json({"error": "Not Found", "path": path}, status=404)

def run_server(port=8000):
    server = HTTPServer(("0.0.0.0", port), BankingRequestHandler)
    print(f"Pure Python Banking Server running on port {port}")
    server.serve_forever()

if __name__ == "__main__":
    run_server(8000)
