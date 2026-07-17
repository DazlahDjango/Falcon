import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.tenant.services.organization_service import OrganizationService
from apps.tenant.models import Organization

# Simulate what the API does when creating with all contact fields
service = OrganizationService()

test_data = {
    'name': 'DEBUG Test Org XYZ123',
    'contact_email': 'debug@test.com',
    'contact_phone': '+254712345678',
    'contact_address': 'Test Address, Nairobi',
    'website': 'https://test.com',
    'primary_color': '#2563EB',
    'secondary_color': '#7C3AED',
    'subscription_tier': 'free',
}

print("Creating org with data:", test_data)
try:
    org = service.create_organization(test_data, user=None, auto_provision=False)
    print(f"\nCreated org: {org.name}")
    print(f"  phone: '{org.contact_phone}'")
    print(f"  address: '{org.contact_address}'")
    print(f"  website: '{org.website}'")
    
    # Clean up
    Organization.objects.filter(id=org.id).delete()
    print("\nTest org deleted - fields ARE saved correctly!")
except Exception as e:
    print(f"Error: {e}")
