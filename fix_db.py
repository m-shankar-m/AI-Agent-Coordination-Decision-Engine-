import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def fix():
    client = AsyncIOMotorClient('mongodb://localhost:27017')
    db = client['aegis_banking_engine']
    await db.reviews.update_many(
        {"risk_level": {"$exists": False}}, 
        {"$set": {"risk_level": "MEDIUM", "previous_ai_recommendation": "REVIEW_REQUIRED", "priority": "URGENT"}}
    )
    print("DB patched!")

asyncio.run(fix())
