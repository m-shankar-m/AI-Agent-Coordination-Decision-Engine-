"""
Aegis Banking Currency & Financial Utilities (Python Implementation)
Converted from src/utils/currency.ts
"""
from typing import Dict, Any

def format_currency(amount: float, currency: str = "USD") -> str:
    symbols = {
        "USD": "$",
        "INR": "₹",
        "EUR": "€",
        "GBP": "£",
        "JPY": "¥",
    }
    symbol = symbols.get(currency, "$")
    return f"{symbol}{amount:,.2f}"

def format_percent(val: float) -> str:
    return f"{val:.2f}%"

def convert_currency(amount: float, from_curr: str, to_curr: str, rates: Dict[str, float] = None) -> float:
    if from_curr == to_curr:
        return amount
    default_rates = {
        "USD_INR": 86.42,
        "EUR_INR": 93.18,
        "GBP_INR": 109.65,
        "USD_EUR": 0.927,
    }
    current_rates = rates or default_rates
    pair = f"{from_curr}_{to_curr}"
    if pair in current_rates:
        return amount * current_rates[pair]
    
    # Check inverse
    inv_pair = f"{to_curr}_{from_curr}"
    if inv_pair in current_rates:
        return amount / current_rates[inv_pair]
        
    return amount
