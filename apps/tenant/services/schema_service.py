import logging
from django.db import connection, transaction
from django.utils import timezone
from apps.tenant.models import OrganizationSchema
from apps.tenant.exceptions import SchemaError

logger = logging.getLogger(__name__)


class SchemaService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def create_schema(self, organization_id, schema_name):
        with transaction.atomic():
            if OrganizationSchema.objects.filter(schema_name=schema_name).exists():
                raise SchemaError(f"Schema '{schema_name}' already exists")
            schema = OrganizationSchema.objects.create(
                organization_id=organization_id,
                schema_name=schema_name,
                status='PENDING'
            )
            self.logger.info(f"Created schema record: {schema_name} for organization {organization_id}")
            return schema

    def provision_schema(self, schema_id):
        schema = OrganizationSchema.objects.get(id=schema_id)
        if schema.status != 'PENDING':
            raise SchemaError(f"Schema {schema.schema_name} is not pending")
        schema.mark_creating()
        try:
            with connection.cursor() as cursor:
                cursor.execute(f'CREATE SCHEMA IF NOT EXISTS "{schema.schema_name}"')
                cursor.execute(f'GRANT ALL ON SCHEMA "{schema.schema_name}" TO CURRENT_USER')
            schema.mark_active()
            self.logger.info(f"Provisioned schema: {schema.schema_name}")
            return schema
        except Exception as e:
            schema.mark_failed(str(e))
            self.logger.error(f"Schema provisioning failed: {schema.schema_name} - {str(e)}")
            raise SchemaError(f"Failed to provision schema: {str(e)}")

    def drop_schema(self, schema_id):
        schema = OrganizationSchema.objects.get(id=schema_id)
        if schema.status == 'DELETED':
            raise SchemaError(f"Schema {schema.schema_name} is already deleted")
        try:
            with connection.cursor() as cursor:
                cursor.execute(f'DROP SCHEMA IF EXISTS "{schema.schema_name}" CASCADE')
            schema.status = 'DELETED'
            schema.is_ready = False
            schema.save(update_fields=['status', 'is_ready'])
            self.logger.warning(f"Dropped schema: {schema.schema_name}")
            return schema
        except Exception as e:
            self.logger.error(f"Schema drop failed: {schema.schema_name} - {str(e)}")
            raise SchemaError(f"Failed to drop schema: {str(e)}")

    def get_schema(self, schema_id):
        try:
            return OrganizationSchema.objects.get(id=schema_id)
        except OrganizationSchema.DoesNotExist:
            raise SchemaError(f"Schema {schema_id} not found")

    def get_schema_by_name(self, schema_name):
        schema = OrganizationSchema.objects.by_schema_name(schema_name)
        if not schema:
            raise SchemaError(f"Schema '{schema_name}' not found")
        return schema

    def get_schema_for_organization(self, organization_id):
        schema = OrganizationSchema.objects.get_primary_schema(organization_id)
        if not schema:
            raise SchemaError(f"No schema found for organization {organization_id}")
        return schema

    def list_schemas(self, filters=None):
        qs = OrganizationSchema.objects.all_with_deleted()
        if filters:
            if filters.get('status'):
                qs = qs.filter(status=filters['status'])
            if filters.get('is_ready') is not None:
                qs = qs.filter(is_ready=filters['is_ready'])
            if filters.get('organization_id'):
                qs = qs.filter(organization_id=filters['organization_id'])
        return qs

    def update_schema_stats(self, schema_id):
        schema = OrganizationSchema.objects.get(id=schema_id)
        try:
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT COUNT(*)::int, 
                           COALESCE(SUM(pg_total_relation_size('"' || schemaname || '"."' || tablename || '"')), 0)::double precision
                    FROM pg_tables 
                    WHERE schemaname = %s
                """, [schema.schema_name])
                row = cursor.fetchone()
                if row:
                    schema.table_count = row[0] or 0
                    schema.size_mb = (row[1] or 0) / 1024.0 / 1024.0
                    schema.save(update_fields=['table_count', 'size_mb'])
            self.logger.info(f"Updated stats for schema: {schema.schema_name}")
            return schema
        except Exception as e:
            self.logger.warning(f"Failed to update schema stats: {str(e)}")
            return schema