from django.db import models
from django.utils import timezone
from .base import BaseStructureManager

class ReportingLineManager(BaseStructureManager):
    def active(self):
        return self.filter(is_active=True, is_deleted=False)
    def by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id, is_deleted=False)
    def by_employee(self, user_id, tenant_id, active_only=True):
        from apps.structure.models.employment import Employment
        employments = Employment.objects.current_by_user(user_id, tenant_id)
        if not employments:
            return self.none()
        qs = self.filter(employee_id=employments.id, tenant_id=tenant_id, is_deleted=False)
        if active_only:
            qs = qs.filter(is_active=True)
        return qs
    def by_manager(self, user_id, tenant_id, active_only=True):
        from apps.structure.models.employment import Employment
        employments = Employment.objects.current_by_user(user_id, tenant_id)
        if not employments:
            return self.none()
        qs = self.filter(manager_id=employments.id, tenant_id=tenant_id, is_deleted=False)
        if active_only:
            qs = qs.filter(is_active=True)
        return qs
    def solid_lines(self, tenant_id, active_only=True):
        qs = self.filter(relation_type='solid', tenant_id=tenant_id, is_deleted=False)
        if active_only:
            qs = qs.filter(is_active=True)
        return qs
    def dotted_lines(self, tenant_id, active_only=True):
        qs = self.filter(relation_type='dotted', tenant_id=tenant_id, is_deleted=False)
        if active_only:
            qs = qs.filter(is_active=True)
        return qs
    def get_direct_reports(self, manager_user_id, tenant_id, relation_type=None):
        from apps.structure.models.employment import Employment
        manager_emp = Employment.objects.current_by_user(manager_user_id, tenant_id)
        if not manager_emp:
            return self.none()
        qs = self.filter(manager_id=manager_emp.id, is_active=True, tenant_id=tenant_id, is_deleted=False)
        if relation_type:
            qs = qs.filter(relation_type=relation_type)
        employee_ids = qs.values_list('employee__user_id', flat=True)
        return Employment.objects.filter(user_id__in=employee_ids, tenant_id=tenant_id, is_current=True, is_deleted=False)
    def get_all_managers(self, employee_user_id, tenant_id, relation_type='solid'):
        from apps.structure.models.employment import Employment
        employee_emp = Employment.objects.current_by_user(employee_user_id, tenant_id)
        if not employee_emp:
            return []
        managers = []
        current = employee_emp
        depth = 0
        max_depth = 10
        while current and depth < max_depth:
            reporting = self.filter(employee_id=current.id, relation_type=relation_type, is_active=True, tenant_id=tenant_id, is_deleted=False).select_related('manager').first()
            if not reporting or not reporting.manager:
                break
            managers.append(reporting.manager.user_id)
            current = reporting.manager
            depth += 1
        return managers
    def end_active_reporting(self, employee_user_id, tenant_id, end_date=None, reason=''):
        from apps.structure.models.employment import Employment
        employee_emp = Employment.objects.current_by_user(employee_user_id, tenant_id)
        if not employee_emp:
            return 0
        if not end_date:
            end_date = timezone.now().date()
        return self.filter(employee_id=employee_emp.id, is_active=True, tenant_id=tenant_id, is_deleted=False).update(is_active=False, effective_to=end_date, change_reason=reason)
    def has_reporting_cycle(self, employee_user_id, manager_user_id, tenant_id):
        from apps.structure.models.employment import Employment
        employee_emp = Employment.objects.current_by_user(employee_user_id, tenant_id)
        manager_emp = Employment.objects.current_by_user(manager_user_id, tenant_id)
        if not employee_emp or not manager_emp:
            return False
        return self.filter(employee_id=employee_emp.id, manager_id=manager_emp.id, is_active=True, tenant_id=tenant_id, is_deleted=False).exists()