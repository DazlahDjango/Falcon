from uuid import UUID
from ...models import Department, Team, ReportingLine, Employment, Position

class CSVExporterService:
    @staticmethod
    def export_departments(tenant_id: UUID, include_inactive: bool = False) -> str:
        import csv
        from io import StringIO
        departments = Department.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            departments = departments.filter(is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Code', 'Name', 'Description', 'Parent Code', 'Depth', 'Path', 'Headcount Limit', 'Sensitivity Level', 'Is Active', 'Created At'])
        for dept in departments.select_related('parent'):
            writer.writerow([
                str(dept.id),
                dept.code,
                dept.name,
                dept.description,
                dept.parent.code if dept.parent else '',
                dept.depth,
                dept.path,
                dept.headcount_limit or '',
                dept.sensitivity_level,
                dept.is_active,
                dept.created_at.isoformat() if dept.created_at else ''
            ])
        return output.getvalue()
    
    @staticmethod
    def export_teams(tenant_id: UUID, include_inactive: bool = False) -> str:
        import csv
        from io import StringIO
        teams = Team.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('department', 'parent_team')
        if not include_inactive:
            teams = teams.filter(is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Code', 'Name', 'Description', 'Department Code', 'Parent Team Code', 'Team Lead', 'Max Members', 'Is Active', 'Created At'])
        for team in teams:
            writer.writerow([
                str(team.id),
                team.code,
                team.name,
                team.description,
                team.department.code if team.department else '',
                team.parent_team.code if team.parent_team else '',
                str(team.team_lead) if team.team_lead else '',
                team.max_members or '',
                team.is_active,
                team.created_at.isoformat() if team.created_at else ''
            ])
        return output.getvalue()
    
    @staticmethod
    def export_employments(tenant_id: UUID, current_only: bool = True) -> str:
        import csv
        from io import StringIO
        employments = Employment.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('position', 'department', 'team')
        if current_only:
            employments = employments.filter(is_current=True, is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['User ID', 'Position Code', 'Department Code', 'Team Code', 'Employment Type', 'Is Manager', 'Is Executive', 'Effective From', 'Effective To', 'Is Current'])
        for emp in employments:
            writer.writerow([
                str(emp.user_id),
                emp.position.job_code if emp.position else '',
                emp.department.code if emp.department else '',
                emp.team.code if emp.team else '',
                emp.employment_type,
                emp.is_manager,
                emp.is_executive,
                emp.effective_from.isoformat() if emp.effective_from else '',
                emp.effective_to.isoformat() if emp.effective_to else '',
                emp.is_current
            ])
        return output.getvalue()
    
    @staticmethod
    def export_positions(tenant_id: UUID) -> str:
        import csv
        from io import StringIO
        positions = Position.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('reports_to', 'default_department')
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Job Code', 'Title', 'Grade', 'Level', 'Reports To Code', 'Default Department Code', 'Is Single Incumbent', 'Current Incumbents', 'Max Incumbents'])
        for pos in positions:
            writer.writerow([
                pos.job_code,
                pos.title,
                pos.grade,
                pos.level,
                pos.reports_to.job_code if pos.reports_to else '',
                pos.default_department.code if pos.default_department else '',
                pos.is_single_incumbent,
                pos.current_incumbents_count,
                pos.max_incumbents or ''
            ])
        return output.getvalue()
    
    @staticmethod
    def export_reporting_lines(tenant_id: UUID, active_only: bool = True) -> str:
        import csv
        from io import StringIO
        lines = ReportingLine.objects.filter(tenant_id=tenant_id, is_deleted=False).select_related('employee', 'manager')
        if active_only:
            lines = lines.filter(is_active=True)
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['Employee User ID', 'Manager User ID', 'Relation Type', 'Reporting Weight', 'Can Approve KPI', 'Effective From', 'Effective To', 'Is Active'])
        for line in lines:
            writer.writerow([
                str(line.employee.user_id) if line.employee else '',
                str(line.manager.user_id) if line.manager else '',
                line.relation_type,
                float(line.reporting_weight),
                line.can_approve_kpi,
                line.effective_from.isoformat() if line.effective_from else '',
                line.effective_to.isoformat() if line.effective_to else '',
                line.is_active
            ])
        return output.getvalue()