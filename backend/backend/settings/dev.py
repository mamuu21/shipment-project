from .base import *
import os

# (Optional but convenient) load a .env file in development only
try:
    from dotenv import load_dotenv  # pip install python-dotenv
    load_dotenv(os.path.join(BASE_DIR, ".env"))
except Exception:
    pass

DEBUG = True

# Fallback dev key if env var is missing (OK for local dev only)
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-unsafe-secret-key-change-me")

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

TEMPLATES[0]['DIRS'] = [ str(BASE_DIR / 'frontend_build') ]
STATICFILES_DIRS = [ BASE_DIR / 'frontend_build' / 'static' ]

