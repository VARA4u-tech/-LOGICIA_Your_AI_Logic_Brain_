from slowapi import Limiter
from slowapi.util import get_remote_address

# Separate file to avoid circular imports between main and routers
limiter = Limiter(key_func=get_remote_address)
