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
    "api.amkatech.co.tz",  # if you create a subdomain for the backend
]

# These must include full https:// URLs
CSRF_TRUSTED_ORIGINS = [
    "https://amkatech.co.tz",
    "https://www.amkatech.co.tz",
    "https://api.amkatech.co.tz",
]

# CORS settings if React frontend and Django backend are on separate domains
CORS_ALLOWED_ORIGINS = [
    "https://amkatech.co.tz",
    "https://www.amkatech.co.tz",
]

CORS_ALLOW_HEADERS = list(default_headers) + ["authorization"]
CORS_ALLOW_CREDENTIALS = True 

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

TEMPLATES[0]['DIRS'] = [ str(BASE_DIR / 'frontend_build') ]
STATICFILES_DIRS = [ BASE_DIR / 'frontend_build/static' ]
