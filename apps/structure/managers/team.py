from .base import BaseStructureManager

class TeamManager(BaseStructureManager):
    def active(self):
        return self.filter(is_active=True, is_deleted=False)
    def by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id, is_deleted=False)
    def by_department(self, department_id, tenant_id):
        return self.filter(department_id=department_id, tenant_id=tenant_id, is_deleted=False)
    def with_team_lead(self, user_id, tenant_id):
        return self.filter(team_lead=user_id, tenant_id=tenant_id, is_deleted=False)
    def root_teams(self, department_id, tenant_id):
        return self.filter(department_id=department_id, parent_team__isnull=True, tenant_id=tenant_id, is_deleted=False, is_active=True)
    def get_full_name(self, team_id):
        from apps.structure.models.team import Team
        team = self.get(id=team_id)
        parts = [team.name]
        current = team.parent_team
        while current:
            parts.insert(0, current.name)
            current = current.parent_team
        department = team.department
        return f"{department.name} / {' / '.join(parts)}"