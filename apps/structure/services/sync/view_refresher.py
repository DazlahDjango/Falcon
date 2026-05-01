from uuid import UUID
class ViewRefresherService:
    MATERIALIZED_VIEWS = [
        'mv_organization_hierarchy',
        'mv_department_statistics',
        'mv_reporting_matrix'
    ]
    
    def refresh_organization_hierarchy(self, concurrently: bool = True) -> bool:
        from django.db import connection
        try:
            with connection.cursor() as cursor:
                concurrently_clause = "CONCURRENTLY" if concurrently else ""
                cursor.execute(f"REFRESH MATERIALIZED VIEW {concurrently_clause} mv_organization_hierarchy;")
            return True
        except Exception:
            return False
    
    def refresh_department_statistics(self, concurrently: bool = True) -> bool:
        from django.db import connection
        create_view_sql = """
            CREATE MATERIALIZED VIEW IF NOT EXISTS mv_department_statistics AS
            SELECT 
                d.id,
                d.tenant_id,
                d.code,
                d.name,
                d.parent_id,
                COUNT(DISTINCT e.id) as employee_count,
                COUNT(DISTINCT t.id) as team_count,
                COUNT(DISTINCT sub.id) as sub_department_count
            FROM structure_department d
            LEFT JOIN structure_employment e ON e.department_id = d.id AND e.is_current = true AND e.is_deleted = false
            LEFT JOIN structure_team t ON t.department_id = d.id AND t.is_deleted = false
            LEFT JOIN structure_department sub ON sub.parent_id = d.id AND sub.is_deleted = false
            WHERE d.is_deleted = false
            GROUP BY d.id, d.tenant_id, d.code, d.name, d.parent_id;
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(create_view_sql)
                concurrently_clause = "CONCURRENTLY" if concurrently else ""
                cursor.execute(f"REFRESH MATERIALIZED VIEW {concurrently_clause} mv_department_statistics;")
            return True
        except Exception:
            return False
    
    def refresh_reporting_matrix(self, concurrently: bool = True) -> bool:
        """Refresh reporting matrix materialized view"""
        from django.db import connection
        
        create_view_sql = """
            CREATE MATERIALIZED VIEW IF NOT EXISTS mv_reporting_matrix AS
            WITH RECURSIVE reporting_tree AS (
                SELECT 
                    rl.employee_id,
                    rl.manager_id,
                    rl.relation_type,
                    1 as depth,
                    ARRAY[rl.manager_id] as path
                FROM structure_reporting_line rl
                WHERE rl.is_active = true AND rl.is_deleted = false
                
                UNION ALL
                
                SELECT 
                    rt.employee_id,
                    rl.manager_id,
                    rt.relation_type,
                    rt.depth + 1,
                    rt.path || rl.manager_id
                FROM reporting_tree rt
                JOIN structure_reporting_line rl ON rl.employee_id = rt.manager_id
                WHERE rl.is_active = true AND rl.is_deleted = false AND rt.depth < 10
            )
            SELECT * FROM reporting_tree;
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(create_view_sql)
                concurrently_clause = "CONCURRENTLY" if concurrently else ""
                cursor.execute(f"REFRESH MATERIALIZED VIEW {concurrently_clause} mv_reporting_matrix;")
            return True
        except Exception:
            return False
    
    def refresh_all(self, concurrently: bool = True) -> dict:
        results = {
            'organization_hierarchy': self.refresh_organization_hierarchy(concurrently),
            'department_statistics': self.refresh_department_statistics(concurrently),
            'reporting_matrix': self.refresh_reporting_matrix(concurrently)
        }
        return results
    
    def refresh_for_tenant(self, tenant_id: UUID, concurrently: bool = True) -> dict:
        results = {
            'organization_hierarchy': self.refresh_organization_hierarchy(concurrently),
            'department_statistics': self.refresh_department_statistics(concurrently),
            'reporting_matrix': self.refresh_reporting_matrix(concurrently)
        }
        return results
    
    def get_view_status(self) -> dict:
        from django.db import connection
        views_status = {}
        for view_name in self.MATERIALIZED_VIEWS:
            try:
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT 
                            schemaname,
                            matviewname,
                            ispopulated
                        FROM pg_matviews
                        WHERE matviewname = %s;
                    """, [view_name])
                    row = cursor.fetchone()
                    if row:
                        views_status[view_name] = {
                            'exists': True,
                            'schema': row[0],
                            'is_populated': row[2]
                        }
                    else:
                        views_status[view_name] = {'exists': False, 'is_populated': False}
            except Exception:
                views_status[view_name] = {'exists': False, 'is_populated': False, 'error': True}
        return views_status