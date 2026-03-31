from apps.organisations.models import Organisation
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

# 1. Create a Test Organisation
org, created = Organisation.objects.get_or_create(
    slug='falcon-test',
    defaults={
        'name': 'Falcon Test Org',
        'industry': 'TECH',
        'sector': 'COMMERCIAL',
        'is_active': True,
        'is_verified': True
    }
)

if created:
    print(f"Created Organisation: {org.name} (ID: {org.id})")
else:
    print(f"Organisation {org.name} already exists (ID: {org.id})")

# 2. Link existing users to this organisation
users = User.objects.all()
for user in users:
    user.tenant_id = org.id
    user.save()
    print(f"Linked User {user.email} to {org.name}")

print("Setup complete!")
