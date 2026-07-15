import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
sys.path.insert(0, os.getcwd())
django.setup()

from apps.accounts.models import User

try:
    user = User.objects.get(email='admin@falconigc.com')
    print(f"User email: {user.email}")
    print(f"Role: {user.role}")
    print(f"Is active: {user.is_active}")
    print(f"Tenant ID: {user.tenant_id}")
    print(f"Password change required: {user.password_change_required}")
    print(f"MFA enabled: {user.mfa_enabled}")
except Exception as e:
    print(f"Error finding user: {e}")
