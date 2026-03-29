import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'app')) # Mock for local run
from app.config import settings
print(f"FRONTEND_ORIGINS: {settings.FRONTEND_ORIGINS}")
