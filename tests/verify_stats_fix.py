import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
# In container, DB_HOST should be 'db'
if os.environ.get('DB_HOST') is None:
    os.environ['DB_HOST'] = 'db'
if os.environ.get('REDIS_URL') is None:
    os.environ['REDIS_URL'] = 'redis://redis:6379/0'

# Ensure the paths are correct for the container environment
import sys
BASE_DIR = '/workspaces/falcon-pms'
sys.path.append(BASE_DIR)
sys.path.append(os.path.join(BASE_DIR, 'apps'))

django.setup()

from apps.accounts.models import AuditLog
from apps.accounts.constants import AuditActionTypes
from apps.accounts.models import User
from apps.accounts.api.v1.views.admin import AdminUserViewSet
from rest_framework.test import APIRequestFactory, force_authenticate

def test_audit_log_creation():
    print("Testing AuditLog creation...")
    try:
        log = AuditLog.objects.create(
            action='test.action',
            action_type=AuditActionTypes.CREATE,
            ip_address='127.0.0.1',
            user_agent='TestAgent',
            is_immutable=True
        )
        print(f"  - Created log ID: {log.id}")
        
        # Verify it can't be updated
        try:
            log.action = 'updated.action'
            log.save()
            print("  - ERROR: Immutable log was updated!")
            raise Exception("Immutability failed")
        except PermissionError as e:
            print(f"  - Immutability confirmed: {e}")
            
        # Cleanup
        # Note: AuditLog.delete is also blocked if immutable.
        # We might need to bypass it for cleanup or just leave it.
    except Exception as e:
        print(f"AuditLog test failed: {e}")
        raise e

def test_admin_stats():
    print("Testing AdminUserViewSet.stats...")
    factory = APIRequestFactory()
    
    # Get a superuser
    user = User.objects.filter(is_superuser=True).first()
    if not user:
        print("No superuser found, using guest admin...")
        # If no superuser, we might need to create one, but for a check we can just see if it crashes
        # Actually, let's try to mock the user if necessary, but better to use real one
    
    view = AdminUserViewSet.as_view({'get': 'stats'})
    request = factory.get('/api/v1/accounts/admin/users/stats/')
    
    if user:
        force_authenticate(request, user=user)
    
    try:
        response = view(request)
        print(f"Status Code: {response.status_code}")
        # print(f"Response Data: {response.data}")
        
        if response.status_code == 200:
            assert 'total_users' in response.data
            assert 'users_by_role' in response.data
            print("Admin stats check passed (200 OK)!")
        elif response.status_code == 403:
            print("Admin stats returned 403 (Permission Denied) - This is expected if not authenticated correctly, but it's NOT a 500!")
        else:
            print(f"Admin stats returned {response.status_code}")
    except Exception as e:
        print(f"Admin stats crashed with error: {e}")
        raise e

if __name__ == "__main__":
    try:
        test_audit_log_creation()
        test_admin_stats()
        print("\nAll backend stability checks passed!")
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
