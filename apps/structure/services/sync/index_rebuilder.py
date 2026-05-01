class IndexRebuilderService:
    def __init__(self):
        self._index_statements = {
            'department': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_department_path_gin ON structure_department USING GIN (path gin_trgm_ops);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_department_tenant_parent ON structure_department (tenant_id, parent_id, is_deleted);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_department_code_tenant ON structure_department (code, tenant_id);"
            ],
            'team': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_tenant_department ON structure_team (tenant_id, department_id, is_deleted);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_parent ON structure_team (parent_team_id);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_lead ON structure_team (team_lead);"
            ],
            'employment': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employment_user_current ON structure_employment (user_id, is_current) WHERE is_current = true;",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employment_department_current ON structure_employment (department_id, is_current) WHERE is_current = true;",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employment_tenant_active ON structure_employment (tenant_id, is_active, is_current);"
            ],
            'reporting_line': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reporting_employee_manager ON structure_reporting_line (employee_id, manager_id) WHERE is_active = true;",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reporting_manager_active ON structure_reporting_line (manager_id, is_active);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reporting_relation_type ON structure_reporting_line (relation_type, is_active);"
            ],
            'position': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_level_tenant ON structure_position (level, tenant_id);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_reports_to ON structure_position (reports_to_id);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_position_job_code ON structure_position (job_code);"
            ],
            'cost_center': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cost_center_tenant_fiscal ON structure_cost_center (tenant_id, fiscal_year);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cost_center_parent ON structure_cost_center (parent_id);"
            ],
            'location': [
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_country_city ON structure_location (country, city);",
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_location_tenant_active ON structure_location (tenant_id, is_active);"
            ]
        }
    
    def rebuild_all_indexes(self, tenant_schema: str = 'public') -> dict:
        from django.db import connection
        results = {}
        for table, statements in self._index_statements.items():
            table_results = []
            for statement in statements:
                try:
                    with connection.cursor() as cursor:
                        if tenant_schema != 'public':
                            cursor.execute(f"SET search_path TO {tenant_schema};")
                        cursor.execute(statement)
                    table_results.append({'statement': statement, 'status': 'success'})
                except Exception as e:
                    table_results.append({'statement': statement, 'status': 'failed', 'error': str(e)})
            results[table] = table_results
        return results
    
    def reindex_table(self, table_name: str, concurrently: bool = True) -> bool:
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                concurrently_clause = "CONCURRENTLY" if concurrently else ""
                cursor.execute(f"REINDEX INDEX {concurrently_clause} CONCURRENTLY {table_name};")
            return True
        except Exception:
            return False
    
    def analyze_tables(self, tenant_schema: str = 'public') -> dict:
        from django.db import connection
        tables = ['structure_department', 'structure_team', 'structure_employment', 
                  'structure_reporting_line', 'structure_position', 'structure_cost_center', 
                  'structure_location', 'structure_hierarchy_version']
        
        results = {}
        for table in tables:
            try:
                with connection.cursor() as cursor:
                    if tenant_schema != 'public':
                        cursor.execute(f"SET search_path TO {tenant_schema};")
                    cursor.execute(f"ANALYZE {table};")
                results[table] = 'success'
            except Exception as e:
                results[table] = f'failed: {str(e)}'
        return results
    
    def get_index_usage_stats(self) -> list:
        from django.db import connection
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
        try:
            with connection.cursor() as cursor:
                cursor.execute(query)
                columns = [col[0] for col in cursor.description]
                rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
            return rows
        except Exception:
            return []
    
    def identify_unused_indexes(self, min_scans: int = 10) -> list:
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