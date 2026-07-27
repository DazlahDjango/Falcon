
import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
sys.path.insert(0, str(BASE_DIR / 'apps'))

import django
django.setup()

print("Django setup completed")

try:
    from apps.tenant.models import Organization
    print("Organization model imported okay")
    print(f"Organization table exists: {Organization._meta.db_table}")
    print(f"Organization fields: {[f.name for f in Organization._meta.fields]}")

    from apps.tenant.api.v1.views.admin_views import AdminOrganizationViewSet
    print("AdminOrganizationViewSet imported okay")

    from apps.tenant.services.health_service import HealthCheckService
    health = HealthCheckService()
    print("HealthCheckService imported okay")
    print("System health:", health.full_health_check())

    print("=== All tests passed ===")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
