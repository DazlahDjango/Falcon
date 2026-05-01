from typing import List, Dict, Any, Optional
from uuid import UUID
from ...models.department import Department
from ...models.team import Team
from ...models.employment import Employment

class OrgChartGeneratorService:
    def __init__(self):
        self._max_depth = 10
    
    def generate_json_org_chart(self, tenant_id: UUID, root_department_id: Optional[UUID] = None, max_depth: int = 10) -> Dict[str, Any]:
        self._max_depth = max_depth
        if root_department_id:
            root_dept = Department.objects.filter(id=root_department_id, tenant_id=tenant_id, is_deleted=False).first()
            if not root_dept:
                return {}
            return self._build_org_chart_node(root_dept, 0)
        root_departments = Department.objects.filter(
            tenant_id=tenant_id,
            parent__isnull=True,
            is_deleted=False,
            is_active=True
        )
        org_chart = {
            'tenant_id': str(tenant_id),
            'name': 'Organization',
            'children': []
        }
        for dept in root_departments:
            org_chart['children'].append(self._build_org_chart_node(dept, 0))
        return org_chart
    
    def _build_org_chart_node(self, department: Department, current_depth: int) -> Dict[str, Any]:
        if current_depth >= self._max_depth:
            return {
                'id': str(department.id),
                'name': department.name,
                'code': department.code,
                'type': 'department',
                'depth_reached': True
            }
        node = {
            'id': str(department.id),
            'name': department.name,
            'code': department.code,
            'type': 'department',
            'sensitivity_level': department.sensitivity_level,
            'children': []
        }
        managers = self._get_department_managers(department.id)
        if managers:
            node['managers'] = managers
        teams = Team.objects.filter(
            department_id=department.id,
            tenant_id=department.tenant_id,
            is_deleted=False,
            is_active=True
        )
        for team in teams:
            node['children'].append(self._build_team_node(team, current_depth + 1))
        sub_departments = Department.objects.filter(
            parent_id=department.id,
            tenant_id=department.tenant_id,
            is_deleted=False,
            is_active=True
        )
        for sub_dept in sub_departments:
            node['children'].append(self._build_org_chart_node(sub_dept, current_depth + 1))
        return node
    
    def _build_team_node(self, team: Team, current_depth: int) -> Dict[str, Any]:
        node = {
            'id': str(team.id),
            'name': team.name,
            'code': team.code,
            'type': 'team',
            'children': []
        }
        team_lead = None
        if team.team_lead:
            employment = Employment.objects.filter(
                user_id=team.team_lead,
                tenant_id=team.tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).first()
            if employment:
                team_lead = {
                    'user_id': str(employment.user_id),
                    'position': employment.position.title if employment.position else None
                }
        if team_lead:
            node['team_lead'] = team_lead
        members = Employment.objects.filter(
            team_id=team.id,
            tenant_id=team.tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        node['members'] = [
            {
                'user_id': str(mem.user_id),
                'position': mem.position.title if mem.position else None,
                'is_manager': mem.is_manager
            }
            for mem in members
        ]
        sub_teams = Team.objects.filter(
            parent_team_id=team.id,
            tenant_id=team.tenant_id,
            is_deleted=False,
            is_active=True
        )
        for sub_team in sub_teams:
            node['children'].append(self._build_team_node(sub_team, current_depth + 1))
        return node
    
    def _get_department_managers(self, department_id: UUID) -> List[Dict[str, Any]]:
        employments = Employment.objects.filter(
            department_id=department_id,
            is_manager=True,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position')
        return [
            {
                'user_id': str(emp.user_id),
                'position': emp.position.title if emp.position else None,
                'is_executive': emp.is_executive
            }
            for emp in employments
        ]
    
    def generate_flat_org_chart(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        departments = Department.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            is_active=True
        ).select_related('parent')
        flat_chart = []
        for dept in departments:
            managers = self._get_department_managers(dept.id)
            employee_count = Employment.objects.filter(
                department_id=dept.id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).count()
            flat_chart.append({
                'id': str(dept.id),
                'name': dept.name,
                'code': dept.code,
                'parent_name': dept.parent.name if dept.parent else None,
                'depth': dept.depth,
                'path': dept.path,
                'managers': managers,
                'employee_count': employee_count,
                'team_count': Team.objects.filter(department_id=dept.id, tenant_id=tenant_id, is_deleted=False, is_active=True).count()
            })
        return sorted(flat_chart, key=lambda x: (x['depth'], x['code']))
    
    def generate_text_org_chart(self, tenant_id: UUID, root_department_id: Optional[UUID] = None, max_depth: int = 10) -> str:
        self._max_depth = max_depth
        lines = []
        
        def add_node(node_data: Dict[str, Any], prefix: str = '', is_last: bool = True) -> None:
            connector = '└── ' if is_last else '├── '
            lines.append(f"{prefix}{connector}{node_data['name']}")
            new_prefix = prefix + ('    ' if is_last else '│   ')
            children = node_data.get('children', [])
            for idx, child in enumerate(children):
                is_child_last = (idx == len(children) - 1)
                add_node(child, new_prefix, is_child_last)
        org_chart = self.generate_json_org_chart(tenant_id, root_department_id, max_depth)
        if org_chart:
            lines.append(org_chart.get('name', 'Organization'))
            for idx, child in enumerate(org_chart.get('children', [])):
                is_last = (idx == len(org_chart['children']) - 1)
                add_node(child, '', is_last)
        return '\n'.join(lines)