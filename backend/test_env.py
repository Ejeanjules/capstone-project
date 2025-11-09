import os
from decouple import config

# Test if .env is being loaded
print("Testing .env file loading...")
print("=" * 50)

DATABASE_URL = config('DATABASE_URL', default='NOT_FOUND')
DEBUG = config('DEBUG', default='NOT_FOUND')
SECRET_KEY = config('SECRET_KEY', default='NOT_FOUND')

print(f"DATABASE_URL found: {'Yes' if DATABASE_URL != 'NOT_FOUND' else 'No'}")
if DATABASE_URL != 'NOT_FOUND':
    # Hide password for security
    import re
    safe_url = re.sub(r':([^@]+)@', ':****@', DATABASE_URL)
    print(f"Database: {safe_url}")

print(f"DEBUG: {DEBUG}")
print(f"SECRET_KEY found: {'Yes' if SECRET_KEY != 'NOT_FOUND' else 'No'}")
print("=" * 50)
