from .base import *
import os

DEBUG = False

# In production, SECRET_KEY must come from an environment variable
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    raise Exception("DJANGO_SECRET_KEY is required in production")

# Your actual domain names
ALLOWED_HOSTS = [
    "amkatech.co.tz",
    "www.amkatech.co.tz",
    "api.amkatech.co.tz",
    "cargopro.amkatech.co.tz",
]

# These must include full https:// URLs
CSRF_TRUSTED_ORIGINS = [
    "https://amkatech.co.tz",
    "https://www.amkatech.co.tz",
    "https://api.amkatech.co.tz",
    "https://cargopro.amkatech.co.tz",
]

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://amkatech.co.tz",
    "https://www.amkatech.co.tz",
    "https://cargopro.amkatech.co.tz",
]

# Security Settings
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

TEMPLATES[0]['DIRS'] = [ str(BASE_DIR / 'dist') ]

# Include 'dist' so that files like vite.svg in the root of dist are found
STATICFILES_DIRS = [ 
    BASE_DIR / 'dist',
    BASE_DIR / 'dist/assets' 
]
