
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
    from apps.tenant.models import Client
    print("Client model imported okay")
    print(f"Client table exists: {Client._meta.db_table}")
    print(f"Client fields: {[f.name for f in Client._meta.fields]}")

    from apps.tenant.api.v1.views.tenant_admin import TenantViewSet
    print("TenantViewSet imported okay")

    from apps.tenant.services.monitoring.health_check import HealthCheck
    health = HealthCheck()
    print("HealthCheck imported okay")
    print("System health:", health.check_system_health())

    print("=== All tests passed ===")
except Exception as e:
    print(f"ERROR: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
