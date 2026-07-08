from django.db import models
from django.utils import timezone
from .base import BaseStructureManager

class ReportingLineManager(BaseStructureManager):
    def active(self):
        return self.filter(is_active=True, is_deleted=False)
    
    def by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id, is_deleted=False)
    
    def by_employee(self, employee_employment_id, tenant_id, active_only=True):
        qs = self.filter(employee_id=employee_employment_id, tenant_id=tenant_id, is_deleted=False)
        if active_only:
            qs = qs.filter(is_active=True)
        return qs
    
    def by_manager(self, manager_employment_id, tenant_id, active_only=True):
        qs = self.filter(manager_id=manager_employment_id, tenant_id=tenant_id, is_deleted=False)
        if active_only:
            qs = qs.filter(is_active=True)
        return qs
    
    def by_employee_user(self, user_id, tenant_id, active_only=True):
        from apps.structure.models.employment import Employment
        employment = Employment.objects.current_by_user(user_id, tenant_id)
        if not employment:
            return self.none()
        return self.by_employee(employment.id, tenant_id, active_only)
    
    def by_manager_user(self, user_id, tenant_id, active_only=True):
        from apps.structure.models.employment import Employment
        employment = Employment.objects.current_by_user(user_id, tenant_id)
        if not employment:
            return self.none()
        return self.by_manager(employment.id, tenant_id, active_only)
    
    def get_direct_reports(self, manager_user_id, tenant_id):
        from apps.structure.models.employment import Employment
        manager_emp = Employment.objects.current_by_user(manager_user_id, tenant_id)
        if not manager_emp:
            return self.none()
        qs = self.filter(manager_id=manager_emp.id, is_active=True, tenant_id=tenant_id, is_deleted=False)
        employee_ids = qs.values_list('employee_id', flat=True)
        return Employment.objects.filter(id__in=employee_ids, tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True)
    
    def get_all_managers(self, employee_user_id, tenant_id):
        from apps.structure.models.employment import Employment
        employee_emp = Employment.objects.current_by_user(employee_user_id, tenant_id)
        if not employee_emp:
            return []
        managers = []
        current = employee_emp
        depth = 0
        max_depth = 10
        while current and depth < max_depth:
            reporting = self.filter(
                employee_id=current.id,
                is_active=True,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('manager').first()
            if not reporting or not reporting.manager:
                break
            managers.append(reporting.manager.user_id)
            current = reporting.manager
            depth += 1
        return managers
    
    def end_active_reporting(self, employee_employment_id, tenant_id, end_date=None, reason=''):
        if not end_date:
            end_date = timezone.now().date()
        return self.filter(
            employee_id=employee_employment_id,
            is_active=True,
            tenant_id=tenant_id,
            is_deleted=False
        ).update(is_active=False, effective_to=end_date, change_reason=reason)
    
    def has_reporting_cycle(self, employee_employment_id, manager_employment_id, tenant_id):
        return self.filter(
            employee_id=employee_employment_id,
            manager_id=manager_employment_id,
            is_active=True,
            tenant_id=tenant_id,
            is_deleted=False
        ).exists()
    
    def get_manager_chain(self, employee_employment_id, tenant_id, max_depth=10):
        chain = []
        current = employee_employment_id
        depth = 0
        while current and depth < max_depth:
            reporting = self.filter(
                employee_id=current,
                is_active=True,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('manager').first()
            if not reporting or not reporting.manager:
                break
            chain.append(reporting.manager)
            current = reporting.manager.id
            depth += 1
        return chain
    
    def current_by_employee(self, employee_employment_id):
        return self.filter(employee_id=employee_employment_id, is_active=True, is_deleted=False).first()