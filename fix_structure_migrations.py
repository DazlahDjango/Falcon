"""
Apply structure migrations to tenant schemas that are missing the structure_division table.
"""
import os
import django
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from apps.tenant.models import Organization
from apps.tenant.services import MigrationService

# Orgs missing the structure_division table (with valid schemas)
ORG_IDS_TO_FIX = [
    'c732f915-34d1-489d-8551-3c71bf92a372',  # Airtel
    '275adb1f-8e12-46ee-b394-ea42d41b10c9',  # Test
]

STRUCTURE_MIGRATIONS = [
    ('structure', '0001_initial'),
    ('structure', '0002_division_interimassignment_organizationalunit_and_more'),
    ('structure', '0003_costcenterallocation_locationallocation_and_more'),
]

service = MigrationService()

for org_id in ORG_IDS_TO_FIX:
    try:
        org = Organization.objects.get(id=org_id)
        schema = service._get_schema_name(org.id)
        print(f"\n{'='*60}")
        print(f"Processing: {org.name} (schema: {schema})")
        print(f"{'='*60}")

        # Verify schema exists first
        with connection.cursor() as cursor:
            cursor.execute("SELECT EXISTS(SELECT 1 FROM pg_namespace WHERE nspname = %s)", [schema])
            if not cursor.fetchone()[0]:
                print(f"  SKIP - Schema '{schema}' does not exist.")
                continue

        for app_name, migration_name in STRUCTURE_MIGRATIONS:
            print(f"\n  Applying {app_name}.{migration_name}...")
            try:
                with connection.cursor() as cursor:
                    cursor.execute(f'SET search_path TO "{schema}", public')

                    # Ensure django_migrations exists
                    cursor.execute(f"""
                        CREATE TABLE IF NOT EXISTS "{schema}".django_migrations (
                            id bigserial PRIMARY KEY,
                            app varchar(255) NOT NULL,
                            name varchar(255) NOT NULL,
                            applied timestamptz NOT NULL DEFAULT now()
                        )
                    """)

                    # Check if already applied in the tenant's django_migrations
                    cursor.execute(
                        "SELECT EXISTS(SELECT 1 FROM django_migrations WHERE app=%s AND name=%s)",
                        [app_name, migration_name]
                    )
                    already_applied = cursor.fetchone()[0]

                if already_applied:
                    print(f"  OK - Already applied in schema.")
                else:
                    result = service.apply_migration(org.id, app_name, migration_name)
                    print(f"  DONE - Status: {result.status}")
            except Exception as e:
                print(f"  FAILED: {e}")
                import traceback
                traceback.print_exc()

    except Organization.DoesNotExist:
        print(f"ERROR: Org {org_id} not found.")

print("\n\nDone! Verifying tables now...")

for org_id in ORG_IDS_TO_FIX:
    try:
        org = Organization.objects.get(id=org_id)
        schema = service._get_schema_name(org.id)
        with connection.cursor() as cursor:
            cursor.execute(f'SET search_path TO "{schema}", public')
            cursor.execute(
                "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema=%s AND table_name='structure_division')",
                [schema]
            )
            table_exists = cursor.fetchone()[0]
            status = "TABLE EXISTS" if table_exists else "STILL MISSING"
            print(f"  {org.name}: {status}")
    except Exception as e:
        print(f"  {org_id} ERROR: {e}")
