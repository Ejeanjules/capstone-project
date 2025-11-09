import os
import sys
import django
from django.core.management import call_command

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

print("📦 Exporting data from SQLite...")
print("=" * 50)

# Export data with UTF-8 encoding
with open('data_backup.json', 'w', encoding='utf-8') as f:
    call_command(
        'dumpdata',
        '--natural-foreign',
        '--natural-primary',
        '--exclude=contenttypes',
        '--exclude=auth.Permission',
        stdout=f
    )

print("✅ Data exported successfully to data_backup.json")
print("=" * 50)
