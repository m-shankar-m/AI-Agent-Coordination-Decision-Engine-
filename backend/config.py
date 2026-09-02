import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=True)

class Config:
    # Keys
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    GEMINI_API_KEY_BACKUP = os.getenv("GEMINI_API_KEY_BACKUP", "")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

    # Providers & Models
    PRIMARY_LLM_PROVIDER = os.getenv("PRIMARY_LLM_PROVIDER", "gemini").lower()
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Thresholds
    LOAN_DTI_MAX_THRESHOLD = float(os.getenv("LOAN_DTI_MAX_THRESHOLD", "45.0"))
    LOAN_MIN_CREDIT_SCORE = int(os.getenv("LOAN_MIN_CREDIT_SCORE", "650"))
    FRAUD_RISK_ALERT_THRESHOLD = float(os.getenv("FRAUD_RISK_ALERT_THRESHOLD", "70.0"))
    HITL_CONFIDENCE_THRESHOLD = float(os.getenv("HITL_CONFIDENCE_THRESHOLD", "0.82"))

    # Server
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1")
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

    # Storage paths
    DATA_DIR = BASE_DIR / "data"
    POLICIES_DIR = DATA_DIR / "policies"
    AUDIT_DB_PATH = DATA_DIR / "audit_store.json"
    UPLOADS_DIR = DATA_DIR / "uploads"

# Ensure data directories exist
Config.DATA_DIR.mkdir(parents=True, exist_ok=True)
Config.POLICIES_DIR.mkdir(parents=True, exist_ok=True)
Config.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
