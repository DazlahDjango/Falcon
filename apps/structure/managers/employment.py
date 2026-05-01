from django.db import models
from django.utils import timezone
from .base import BaseStructureManager

class EmploymentManager(BaseStructureManager):
    def current(self):
        return self.filter(is_current=True, is_deleted=False, is_active=True)
    def by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id, is_deleted=False)
    def by_user(self, user_id, tenant_id=None):
        qs = self.filter(user_id=user_id, is_deleted=False)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        return qs
    def current_by_user(self, user_id, tenant_id=None):
        qs = self.filter(user_id=user_id, is_current=True, is_deleted=False, is_active=True)
        if tenant_id:
            qs = qs.filter(tenant_id=tenant_id)
        return qs.first()
    def by_position(self, position_id, tenant_id, current_only=True):
        qs = self.filter(position_id=position_id, tenant_id=tenant_id, is_deleted=False)
        if current_only:
            qs = qs.filter(is_current=True, is_active=True)
        return qs
    def by_department(self, department_id, tenant_id, current_only=True):
        qs = self.filter(department_id=department_id, tenant_id=tenant_id, is_deleted=False)
        if current_only:
            qs = qs.filter(is_current=True, is_active=True)
        return qs
    def by_team(self, team_id, tenant_id, current_only=True):
        qs = self.filter(team_id=team_id, tenant_id=tenant_id, is_deleted=False)
        if current_only:
            qs = qs.filter(is_current=True, is_active=True)
        return qs
    def managers(self, tenant_id, current_only=True):
        qs = self.filter(is_manager=True, tenant_id=tenant_id, is_deleted=False)
        if current_only:
            qs = qs.filter(is_current=True, is_active=True)
        return qs
    def executives(self, tenant_id, current_only=True):
        qs = self.filter(is_executive=True, tenant_id=tenant_id, is_deleted=False)
        if current_only:
            qs = qs.filter(is_current=True, is_active=True)
        return qs
    def board_members(self, tenant_id, current_only=True):
        qs = self.filter(is_board_member=True, tenant_id=tenant_id, is_deleted=False)
        if current_only:
            qs = qs.filter(is_current=True, is_active=True)
        return qs
    def active_on_date(self, tenant_id, date):
        return self.filter(tenant_id=tenant_id, is_deleted=False, effective_from__lte=date, is_active=True).filter(models.Q(effective_to__isnull=True) | models.Q(effective_to__gte=date))
    def get_team_members(self, manager_user_id, tenant_id, include_indirect=True):
        from apps.structure.models.reporting_line import ReportingLine
        direct = ReportingLine.objects.filter(manager__user_id=manager_user_id, relation_type='solid', is_active=True, tenant_id=tenant_id).values_list('employee__user_id', flat=True)
        if include_indirect:
            indirect = self.get_descendants(manager_user_id, tenant_id)
            return list(set(list(direct) + indirect))
        return list(direct)
    def get_descendants(self, manager_user_id, tenant_id, depth=0, max_depth=10):
        if depth > max_depth:
            return []
        from apps.structure.models.reporting_line import ReportingLine
        direct_reports = ReportingLine.objects.filter(manager__user_id=manager_user_id, relation_type='solid', is_active=True, tenant_id=tenant_id).select_related('employee')
        descendant_ids = []
        for report in direct_reports:
            descendant_ids.append(report.employee.user_id)
            descendant_ids.extend(self.get_descendants(report.employee.user_id, tenant_id, depth + 1, max_depth))
        return descendant_ids
    def get_management_chain_up(self, user_id, tenant_id, include_self=False, max_depth=10):
        chain = []
        current_user_id = user_id
        depth = 0
        while current_user_id and depth < max_depth:
            emp = self.current_by_user(current_user_id, tenant_id)
            if not emp or not emp.manager_user_id:
                break
            manager_emp = self.current_by_user(emp.manager_user_id, tenant_id)
            if not manager_emp:
                break
            chain.append(manager_emp.user_id)
            current_user_id = manager_emp.user_id
            depth += 1
        if include_self:
            chain.insert(0, user_id)
        return chain
    def end_current_employment(self, user_id, tenant_id, end_date=None, reason=''):
        if not end_date:
            end_date = timezone.now().date()
        employment = self.current_by_user(user_id, tenant_id)
        if employment:
            employment.is_current = False
            employment.effective_to = end_date
            employment.change_reason = reason
            employment.save(update_fields=['is_current', 'effective_to', 'change_reason'])
            return employment
        return None