import os
import django

# Set the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import authenticate

# Test with the user you created
user = authenticate(email='areen@gmail.com', password='Dazl@123')

if user:
    print(f"✅ Authentication successful!")
    print(f"User ID: {user.id}")
    print(f"Email: {user.email}")
    print(f"Is Active: {user.is_active}")
    print(f"Tenant ID: {user.tenant_id}")
else:
    print("❌ Authentication failed")
    
# Also check if user exists at all
from apps.accounts.models import User
try:
    user = User.objects.get(email='areen@gmail.com')
    print(f"\nUser exists in DB: {user.email}")
    print(f"Password hash: {user.password[:50]}...")
    print(f"Is active: {user.is_active}")
except User.DoesNotExist:
    print("User does not exist in database")