from uuid import UUID
from apps.structure.models import Department, Team, Employment

class JSONExporterService:
    @staticmethod
    def export_departments(tenant_id: UUID, include_inactive: bool = False) -> str:
        import json
        from django.core.serializers.json import DjangoJSONEncoder
        departments = Department.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            departments = departments.filter(is_active=True)
        data = []
        for dept in departments.select_related('parent'):
            data.append({
                'id': str(dept.id),
                'code': dept.code,
                'name': dept.name,
                'description': dept.description,
                'parent_code': dept.parent.code if dept.parent else None,
                'depth': dept.depth,
                'path': dept.path,
                'headcount_limit': dept.headcount_limit,
                'sensitivity_level': dept.sensitivity_level,
                'is_active': dept.is_active,
                'created_at': dept.created_at.isoformat() if dept.created_at else None
            })
        return json.dumps(data, cls=DjangoJSONEncoder, indent=2)
    
    @staticmethod
    def export_full_org(tenant_id: UUID, include_inactive: bool = False) -> str:
        import json
        from django.core.serializers.json import DjangoJSONEncoder
        departments = Department.objects.filter(tenant_id=tenant_id, is_deleted=False)
        if not include_inactive:
            departments = departments.filter(is_active=True)
        root_departments = [d for d in departments if not d.parent_id]
        def build_dept_json(dept: Department) -> dict:
            children = [build_dept_json(child) for child in departments if child.parent_id == dept.id]
            teams = Team.objects.filter(department_id=dept.id, tenant_id=tenant_id, is_deleted=False)
            if not include_inactive:
                teams = teams.filter(is_active=True)
            teams_json = []
            for team in teams:
                team_members = Employment.objects.filter(team_id=team.id, tenant_id=tenant_id, is_current=True, is_deleted=False)
                teams_json.append({
                    'id': str(team.id),
                    'code': team.code,
                    'name': team.name,
                    'description': team.description,
                    'team_lead': str(team.team_lead) if team.team_lead else None,
                    'max_members': team.max_members,
                    'members': [{'user_id': str(m.user_id)} for m in team_members]
                })
            return {
                'id': str(dept.id),
                'code': dept.code,
                'name': dept.name,
                'description': dept.description,
                'headcount_limit': dept.headcount_limit,
                'teams': teams_json,
                'children': children
            }
        org_data = {
            'tenant_id': str(tenant_id),
            'export_date': None,
            'departments': [build_dept_json(dept) for dept in root_departments]
        }
        from django.utils import timezone
        org_data['export_date'] = timezone.now().isoformat()
        return json.dumps(org_data, cls=DjangoJSONEncoder, indent=2)