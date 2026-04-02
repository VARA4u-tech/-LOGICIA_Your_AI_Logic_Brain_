from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging

# Create global motor client
client: AsyncIOMotorClient = None
db = None

def get_mongodb_client():
    global client, db
    if client is None:
        try:
            # Use proper TLS settings for MongoDB Atlas
            # Added tlsAllowInvalidCertificates=True to bypass common SSL handshake errors
            client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                tls=True,
                tlsAllowInvalidCertificates=True, 
                serverSelectionTimeoutMS=10000,
                connectTimeoutMS=10000,
                socketTimeoutMS=20000,
                retryWrites=True,
                w="majority"
            )
            db = client[settings.MONGODB_DB]
            logging.info(f"Connected to MongoDB: {settings.MONGODB_DB}")
        except Exception as e:
            logging.error(f"Failed to connect to MongoDB: {e}")
            
    return db

# Dependency Injector for FastAPI
async def get_db():
    return get_mongodb_client()
