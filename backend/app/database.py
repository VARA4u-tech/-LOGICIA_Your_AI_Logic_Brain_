from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Create global motor client
client: AsyncIOMotorClient = None
db = None

def get_mongodb_client():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(settings.MONGODB_URI)
        db = client[settings.MONGODB_DB]
    return db

# Dependency Injector for FastAPI
async def get_db():
    return get_mongodb_client()
