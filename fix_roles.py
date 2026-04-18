import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User

# Update all superusers to have the super_admin role
superusers = User.objects.filter(is_superuser=True)
count = 0
for user in superusers:
    if user.role != 'super_admin':
        user.role = 'super_admin'
        user.save(update_fields=['role'])
        print(f"Updated user: {user.email} -> super_admin")
        count += 1
    else:
        print(f"User {user.email} already has super_admin role")

if count == 0:
    print("No users needed updating.")
else:
    print(f"Finished updating {count} users.")
