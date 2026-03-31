import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
# Override DB_HOST and REDIS_URL for local/internal container run
# In container, DB_HOST should be 'db', but if they run it where 'localhost' works, we should be flexible.
# Since the server is running, we'll use whatever works.
if os.environ.get('DB_HOST') is None:
    os.environ['DB_HOST'] = 'db' # Default for container
if os.environ.get('REDIS_URL') is None:
    os.environ['REDIS_URL'] = 'redis://redis:6379/0'

django.setup()

from apps.organisations.models import Organisation, Department, Subscription, OrganisationSettings, Domain
from apps.organisations.services.provisioning import OrganisationProvisioningService
from rest_framework.test import APIRequestFactory
from apps.organisations.api.v1.views.test_public import PublicOrganisationViewSet

def test_provisioning():
    print("Testing OrganisationProvisioningService...")
    # Clean up first
    Organisation.objects.filter(slug='test-prov').delete()
    
    org = Organisation.objects.create(name="Test Provisioning", slug="test-prov")
    # Provisioning is triggered by signal, but we can call it manually to be sure
    # OrganisationProvisioningService.setup_new_organisation(org)
    
    # Verify Subscription
    sub = Subscription.objects.filter(organisation=org).first()
    assert sub is not None, "Subscription not created"
    assert sub.plan_type == 'STARTER', f"Unexpected plan type: {sub.plan_type}"
    print("  - Subscription created OK")
    
    # Verify Settings
    settings_obj = OrganisationSettings.objects.filter(organisation=org).first()
    assert settings_obj is not None, "Settings not created"
    print("  - Settings created OK")
    
    # Verify Departments
    depts = Department.objects.filter(organisation=org)
    assert depts.count() == 4, f"Expected 4 departments, found {depts.count()}"
    dept_names = set(depts.values_list('name', flat=True))
    expected_names = {'Administration', 'Operations', 'Finance', 'Human Resources'}
    assert expected_names.issubset(dept_names), f"Missing departments: {expected_names - dept_names}"
    print("  - Departments created OK")
    
    # Verify Domain
    domain = Domain.objects.filter(organisation=org).first()
    assert domain is not None, "Domain not created"
    print("  - Domain created OK")
    
    # Cleanup
    org.delete()
    print("Provisioning test passed!\n")

def test_public_viewset():
    print("Testing PublicOrganisationViewSet...")
    # Ensure at least one active organisation exists
    org, created = Organisation.objects.get_or_create(
        slug='test-public-org',
        defaults={'name': 'Test Public Org', 'is_active': True}
    )
    
    factory = APIRequestFactory()
    view = PublicOrganisationViewSet.as_view({'get': 'list'})
    request = factory.get('/api/v1/organisations/tenants/')
    response = view(request)
    
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    # Check if our org is in the list
    results = response.data.get('results', response.data)
    found = any(item['slug'] == 'test-public-org' for item in results)
    assert found, "Test organisation not found in public list"
    print("  - Public list OK")
    
    # Test current action
    view_current = PublicOrganisationViewSet.as_view({'get': 'current'})
    request_current = factory.get('/api/v1/organisations/tenants/current/')
    response_current = view_current(request_current)
    assert response_current.status_code == 200, f"Expected 200, got {response_current.status_code}"
    assert response_current.data['slug'] is not None, "Current org slug is None"
    print("  - Public 'current' action OK")
    
    if created:
        org.delete()
    print("Public ViewSet test passed!\n")

if __name__ == "__main__":
    try:
        test_provisioning()
        test_public_viewset()
        print("All manual verifications passed!")
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()
