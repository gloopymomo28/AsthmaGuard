import asyncio
import os
from dotenv import load_dotenv
import motor.motor_asyncio
import certifi

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "asthmaguard")

async def clear_db():
    print(f"Connecting to MongoDB...")
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL, tlsCAFile=certifi.where())
    db = client[DATABASE_NAME]
    
    print("Clearing patients collection...")
    await db["patients"].delete_many({})
    
    print("Clearing predictions collection...")
    await db["predictions"].delete_many({})
    
    print("Database cleared successfully!")
    client.close()

if __name__ == "__main__":
    asyncio.run(clear_db())
