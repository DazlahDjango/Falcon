import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from apps.tenant.models import Organization
from apps.tenant.services import MigrationService

service = MigrationService()
orgs = Organization.objects.filter(is_active=True)
missing = []
for org in orgs:
    schema = service._get_schema_name(org.id)
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = %s)", [schema])
            schema_exists = cursor.fetchone()[0]
            if schema_exists:
                cursor.execute(f'SET search_path TO "{schema}", public')
                cursor.execute(
                    "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema=%s AND table_name='structure_division')",
                    [schema]
                )
                table_exists = cursor.fetchone()[0]
                status = "OK" if table_exists else "MISSING TABLE"
                if not table_exists:
                    missing.append(str(org.id))
                print(f"{org.name} | schema={schema} | {status}")
            else:
                print(f"{org.name} | schema={schema} | NO SCHEMA")
                missing.append(str(org.id))
    except Exception as e:
        print(f"{org.name} ERROR: {e}")

print("\n\nOrgs missing structure_division table:")
for m in missing:
    print(m)
