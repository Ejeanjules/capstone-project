import socket
import sys

print("\n" + "="*70)
print("🔍 SUPABASE CONNECTION DIAGNOSTICS")
print("="*70 + "\n")

# Test DNS resolution
hostname = "db.lzcklchxapnncaekahdh.supabase.co"
port = 5432

print(f"Testing connection to: {hostname}:{port}\n")

# Test 1: DNS Resolution
print("Test 1: DNS Resolution")
print("-" * 40)
try:
    ip_address = socket.gethostbyname(hostname)
    print(f"✅ DNS Resolved: {hostname} → {ip_address}")
except socket.gaierror as e:
    print(f"❌ DNS Resolution Failed: {e}")
    print("   This means:")
    print("   • Your Supabase project might be paused")
    print("   • Internet connection issue")
    print("   • Hostname is incorrect")
    sys.exit(1)

# Test 2: Port connectivity
print("\nTest 2: Port Connectivity")
print("-" * 40)
try:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(5)
    result = sock.connect_ex((hostname, port))
    sock.close()
    
    if result == 0:
        print(f"✅ Port {port} is open and accepting connections")
    else:
        print(f"❌ Port {port} is closed or unreachable")
        print("   This might mean:")
        print("   • Firewall blocking connection")
        print("   • Supabase project not fully active")
except Exception as e:
    print(f"❌ Connection test failed: {e}")

print("\n" + "="*70)
print("💡 RECOMMENDATIONS:")
print("="*70)
print("1. Go to: https://supabase.com/dashboard/projects")
print("2. Check if your project status is 'Active'")
print("3. If 'Paused', click 'Resume' and wait 2-3 minutes")
print("4. Try the 'Transaction mode' connection string (uses pooler)")
print("="*70 + "\n")
