#!/usr/bin/env python
"""
Script to verify and fix admin user roles.
Run with: python manage.py shell < fix_admin_user_role.py
Or directly: python fix_admin_user_role.py
"""

from django.contrib.auth.models import User as DjangoUser
from apps.accounts.models import User
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()


print("=" * 70)
print("ADMIN USER ROLE VERIFICATION & FIX SCRIPT")
print("=" * 70)

# Get all admin users (super_admin or client_admin or is_superuser=True)
admin_users = User.objects.filter(
    role__in=['super_admin', 'client_admin']
) | User.objects.filter(is_superuser=True)

print(f"\nFound {admin_users.count()} admin users:\n")

for user in admin_users:
    print(f"User: {user.email}")
    print(f"  - Username: {user.username}")
    print(f"  - Role: {user.role}")
    print(f"  - is_superuser: {user.is_superuser}")
    print(f"  - is_staff: {user.is_staff}")
    print(f"  - Tenant ID: {user.tenant_id}")
    print()

# Check for misaligned users (have is_superuser=True but not super_admin role)
print("\n" + "=" * 70)
print("CHECKING FOR MISALIGNED PERMISSIONS...")
print("=" * 70)

misaligned = User.objects.filter(is_superuser=True).exclude(role='super_admin')
if misaligned.exists():
    print(
        f"\n⚠️  Found {misaligned.count()} users with is_superuser=True but role != 'super_admin':\n")
    for user in misaligned:
        print(f"  - {user.email}: role='{user.role}'")

    # Ask user if they want to fix it
    print("\n" + "-" * 70)
    print("WOULD YOU LIKE TO FIX THESE? (They need role='super_admin')")
    print("-" * 70)
    response = input(
        "\nUpdate these users to role='super_admin'? (yes/no): ").strip().lower()

    if response == 'yes':
        updated_count = misaligned.update(role='super_admin')
        print(f"✓ Updated {updated_count} users to role='super_admin'")
    else:
        print("✗ No changes made")

# Check for users with role=super_admin but is_superuser=False
print("\n" + "=" * 70)
print("CHECKING FOR USERS WITH SUPER_ADMIN ROLE...")
print("=" * 70)

super_admins = User.objects.filter(role='super_admin')
if super_admins.exists():
    print(f"\n✓ Found {super_admins.count()} super_admin users:\n")
    for user in super_admins:
        print(f"  - {user.email}")
        if not user.is_superuser:
            print(
                f"    ⚠️  Note: is_superuser=False (consider setting to True for consistency)")
else:
    print("\n⚠️  NO SUPER_ADMIN USERS FOUND!")
    print("This might be the issue. Create one with:")
    print("\nUser.objects.create_user(")
    print("    email='admin@example.com',")
    print("    username='admin',")
    print("    password='your_password',")
    print("    role='super_admin',")
    print("    is_superuser=True,")
    print("    is_staff=True,")
    print("    is_verified=True,")
    print("    is_onboarded=True")
    print(")")

# Check for client_admin users
print("\n" + "=" * 70)
print("CHECKING FOR USERS WITH CLIENT_ADMIN ROLE...")
print("=" * 70)

client_admins = User.objects.filter(role='client_admin')
if client_admins.exists():
    print(f"\n✓ Found {client_admins.count()} client_admin users:\n")
    for user in client_admins:
        status = "✓" if user.is_staff else "⚠️"
        print(f"  {status} {user.email} (is_staff={user.is_staff})")
else:
    print("\n✗ NO CLIENT_ADMIN USERS FOUND")

print("\n" + "=" * 70)
print("VERIFICATION COMPLETE")
print("=" * 70)

# Print helpful information
print("""
UNDERSTANDING THE PERMISSION SYSTEM:

1. IsSuperAdmin permission checks: user.role == 'super_admin'
2. IsClientAdmin permission checks: user.role == 'client_admin'
3. HasAnyRole permission checks: user.role in [list of roles]

YOUR ISSUE WAS:
- User created with role='client_admin' (default for tenant registration)
- But admin endpoints required role='super_admin'
- FIXED: Admin endpoints now accept both 'super_admin' and 'client_admin'

TO TEST IF IT'S WORKING:
1. Run: python manage.py runserver
2. Login with your admin user
3. Try to access admin endpoints like:
   - GET /api/v1/admin/users/
   - GET /api/v1/admin/roles/
   - GET /api/v1/admin/permissions/
4. They should now return 200 OK instead of 403 FORBIDDEN
""")
