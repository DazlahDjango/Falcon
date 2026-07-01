from typing import Dict, Any, List
from uuid import UUID
from django.db import connection
from django.db import models
from apps.structure.models.division import Division
from apps.structure.models.department import Department
from apps.structure.models.section import Section
from apps.structure.models.unit import Unit
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.models.position import Position
from apps.structure.models.employment import Employment
from apps.structure.models.reporting_line import ReportingLine

class IndexRebuilder:
    def __init__(self):
        self._index_statements = {
            'organizational_unit': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_unit_path_gin ON structure_organizational_unit USING GIN (path gin_trgm_ops);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_unit_tenant_parent ON structure_organizational_unit (tenant_id, parent_id, is_deleted);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_unit_code_tenant ON structure_organizational_unit (code, tenant_id);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_org_unit_level_tenant ON structure_organizational_unit (level, tenant_id);"
            ],
            'division': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_division_tenant_active ON structure_division (tenant_id, is_active);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_division_path ON structure_division (path);"
            ],
            'department': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_department_path_gin ON structure_department USING GIN (path gin_trgm_ops);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_department_tenant_parent ON structure_department (tenant_id, parent_id, is_deleted);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_department_code_tenant ON structure_department (code, tenant_id);"
            ],
            'section': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_section_tenant_parent ON structure_section (tenant_id, parent_id, is_deleted);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_section_path ON structure_section (path);"
            ],
            'unit': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_unit_tenant_parent ON structure_unit (tenant_id, parent_id, is_deleted);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_unit_path ON structure_unit (path);"
            ],
            'employment': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employment_user_current ON structure_employment (user_id, is_current) WHERE is_current = true;",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employment_unit_current ON structure_employment (unit_id, is_current) WHERE is_current = true;",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employment_department_current ON structure_employment (department_id, is_current) WHERE is_current = true;",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employment_tenant_active ON structure_employment (tenant_id, is_active, is_current);"
            ],
            'reporting_line': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reporting_employee_manager ON structure_reporting_line (employee_id, manager_id) WHERE is_active = true;",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reporting_manager_active ON structure_reporting_line (manager_id, is_active);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reporting_employee_active ON structure_reporting_line (employee_id, is_active);"
            ],
            'position': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_level_tenant ON structure_position (level, tenant_id);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_reports_to ON structure_position (reports_to_id);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_job_code ON structure_position (job_code);"
            ],
            'cost_center': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cost_center_tenant_fiscal ON structure_cost_center (tenant_id, fiscal_year);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cost_center_org_unit ON structure_cost_center (organizational_unit_id);"
            ],
            'location': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_country_city ON structure_location (country, city);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_tenant_active ON structure_location (tenant_id, is_active);"
            ]
        }
    
    def rebuild_paths(self, tenant_id: UUID) -> int:
        units = OrganizationalUnit.objects.filter(tenant_id=tenant_id, is_deleted=False)
        updated = 0
        for unit in units:
            if unit.parent:
                unit.path = f"{unit.parent.path}/{unit.code}" if unit.parent.path else unit.code
                unit.depth = unit.parent.depth + 1
            else:
                unit.path = unit.code
                unit.depth = 0
            unit.save(update_fields=['path', 'depth'])
            updated += 1
        return updated
    
    def rebuild_all_paths(self) -> Dict[str, int]:
        tenants = OrganizationalUnit.objects.values_list('tenant_id', flat=True).distinct()
        results = {}
        for tenant_id in tenants:
            results[str(tenant_id)] = self.rebuild_paths(tenant_id)
        return results
    
    def rebuild_indices(self, model_class) -> bool:
        with connection.cursor() as cursor:
            table_name = model_class._meta.db_table
            try:
                cursor.execute(f"REINDEX INDEX CONCURRENTLY {table_name}_pkey")
            except Exception:
                pass
            try:
                cursor.execute(f"REINDEX INDEX CONCURRENTLY {table_name}_path_*")
            except Exception:
                pass
        return True
    
    def rebuild_all_indices(self) -> Dict[str, bool]:
        models = [Division, Department, Section, Unit, OrganizationalUnit, Employment, ReportingLine, Position]
        results = {}
        for model in models:
            results[model.__name__] = self.rebuild_indices(model)
        return results
    
    def update_incumbent_counts(self, tenant_id: UUID) -> int:
        positions = Position.objects.filter(tenant_id=tenant_id, is_deleted=False)
        updated = 0
        for position in positions:
            count = Employment.objects.filter(
                position=position,
                is_current=True,
                is_active=True,
                is_deleted=False
            ).count()
            position.current_incumbents_count = count
            position.save(update_fields=['current_incumbents_count'])
            updated += 1
        return updated
    
    def update_all_incumbent_counts(self) -> Dict[str, int]:
        tenants = Position.objects.values_list('tenant_id', flat=True).distinct()
        results = {}
        for tenant_id in tenants:
            results[str(tenant_id)] = self.update_incumbent_counts(tenant_id)
        return results
    
    def validate_indexes(self, model_class) -> List[Dict[str, Any]]:
        with connection.cursor() as cursor:
            cursor.execute(f"""
                SELECT tablename, indexname, indexdef
                FROM pg_indexes
                WHERE tablename = '{model_class._meta.db_table}'
            """)
            rows = cursor.fetchall()
            return [{
                'table': row[0],
                'index': row[1],
                'definition': row[2]
            } for row in rows]
    
    def get_index_usage_stats(self) -> List[Dict[str, Any]]:
        query = """
            SELECT 
                schemaname,
                tablename,
                indexname,
                idx_scan as number_of_scans,
                idx_tup_read as tuples_read,
                idx_tup_fetch as tuples_fetched
            FROM pg_stat_user_indexes
            WHERE tablename LIKE 'structure_%'
            ORDER BY idx_scan DESC;
        """
        with connection.cursor() as cursor:
            cursor.execute(query)
            columns = [col[0] for col in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return rows
    
    def identify_unused_indexes(self, min_scans: int = 10) -> List[Dict[str, Any]]:
        stats = self.get_index_usage_stats()
        unused = []
        for stat in stats:
            if stat.get('number_of_scans', 0) < min_scans:
                unused.append({
                    'table': stat.get('tablename'),
                    'index': stat.get('indexname'),
                    'scans': stat.get('number_of_scans', 0)
                })
        return unused