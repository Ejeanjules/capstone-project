import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# Get all tables in the database
with connection.cursor() as cursor:
    cursor.execute("""
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename;
    """)
    tables = cursor.fetchall()
    
    print("\n✅ Connected to Supabase PostgreSQL Database!")
    print(f"\n📊 Total tables found: {len(tables)}\n")
    print("=" * 50)
    
    for table in tables:
        print(f"  • {table[0]}")
    
    print("=" * 50)
    
    # Check for specific Django models
    django_apps = [
        'auth_user',
        'jobs_job',
        'jobs_jobapplication',
        'accounts_profile',
    ]
    
    table_names = [t[0] for t in tables]
    print("\n🔍 Checking for your app tables:")
    for app_table in django_apps:
        if app_table in table_names:
            print(f"  ✅ {app_table} - EXISTS")
        else:
            print(f"  ❌ {app_table} - NOT FOUND")
    
    print("\n")
