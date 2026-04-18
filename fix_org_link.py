import os
import django
import sys
import uuid

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User
from apps.organisations.models import Organisation

def fix_accounts():
    # 1. Update roles for all superusers (just in case)
    superusers = User.objects.filter(is_superuser=True)
    
    # Ensure at least one organisation exists for the first superuser
    org = Organisation.objects.first()
    if not org:
        org = Organisation.objects.create(
            name="Falcon System Admin",
            slug="system-admin",
            is_active=True,
            is_verified=True
        )
        print(f"Created default Organisation: {org.name}")

    for user in superusers:
        needs_save = False
        if user.role != 'super_admin':
            user.role = 'super_admin'
            needs_save = True
            print(f"Updated role for {user.email}")
            
        if not user.tenant_id or user.tenant_id != org.id:
            user.tenant_id = org.id
            needs_save = True
            print(f"Linked {user.email} to Organisation {org.name}")
            
        if needs_save:
            user.save()

    print("Database fix complete.")

if __name__ == "__main__":
    fix_accounts()
