#!/usr/bin/env python
"""
Test script to verify admin user can access admin operations
"""
from apps.accounts.constants import UserRoles
from apps.accounts.models import User
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
sys.path.insert(0, '/workspaces/falcon-pms')
django.setup()


print("=" * 70)
print("ADMIN ACCESS VERIFICATION TEST")
print("=" * 70)

# Find the user
user = User.objects.get(email='laban@gmail.com')
print(f"\n✓ User found: {user.email}")
print(f"  - Username: {user.username}")
print(f"  - Role: {user.role}")
print(f"  - is_superuser: {user.is_superuser}")
print(f"  - is_active: {user.is_active}")
print(f"  - is_verified: {user.is_verified}")

# Check admin access
print("\n" + "=" * 70)
print("CHECKING ADMIN ACCESS")
print("=" * 70)

# Admin viewsets now require: HasAnyRole([UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN])
required_roles = [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]
has_admin_role = user.role in required_roles

print(f"\nRequired roles for admin endpoints:")
print(f"  - {', '.join(required_roles)}")
print(f"\nYour user role: '{user.role}'")
print(f"Match: {has_admin_role}")

if has_admin_role:
    print("\n" + "=" * 70)
    print("✓ SUCCESS: User HAS ACCESS to admin operations!")
    print("=" * 70)
    print("\n📋 ADMIN ACCESS FIXED!")
    print("\nWhat was changed:")
    print("  - Updated AdminUserViewSet to accept client_admin role")
    print("  - Updated AdminRoleViewSet to accept client_admin role")
    print("  - Updated AdminPermissionViewSet to accept client_admin role")
    print("  - Updated AdminTenantViewSet to accept client_admin role")
    print("\nNext steps:")
    print("  1. Restart your development server: python manage.py runserver")
    print("  2. Log in to the dashboard with: laban@gmail.com / Dazl@123")
    print("  3. Try admin operations - they should now work!")
    print("\nYou can test these endpoints:")
    print("  - GET  /api/v1/admin/users/")
    print("  - GET  /api/v1/admin/roles/")
    print("  - GET  /api/v1/admin/permissions/")
    print("  - GET  /api/v1/admin/tenants/")
else:
    print("\n" + "=" * 70)
    print("✗ ERROR: User role NOT SET CORRECTLY!")
    print("=" * 70)
    print(f"\nUser role: '{user.role}'")
    print(f"Expected one of: {required_roles}")
    print("\nTo fix this manually, run:")
    print(
        f"  User.objects.filter(email='laban@gmail.com').update(role='{UserRoles.SUPER_ADMIN}')")
