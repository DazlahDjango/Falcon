from django.db import models
from django.utils import timezone
from .base import BaseStructureManager

class InterimAssignmentManager(BaseStructureManager):
    def active(self):
        return self.filter(is_active=True, is_deleted=False)
    
    def by_tenant(self, tenant_id):
        return self.filter(tenant_id=tenant_id, is_deleted=False)
    
    def by_employee(self, employment_id):
        return self.filter(employee_id=employment_id, is_deleted=False)
    
    def by_interim_manager(self, employment_id):
        return self.filter(interim_manager_id=employment_id, is_deleted=False)
    
    def current_by_employee(self, employment_id):
        now = timezone.now().date()
        return self.filter(
            employee_id=employment_id,
            effective_from__lte=now,
            effective_to__gte=now,
            is_active=True,
            is_deleted=False
        )
    
    def active_on_date(self, employment_id, date):
        return self.filter(
            employee_id=employment_id,
            effective_from__lte=date,
            effective_to__gte=date,
            is_active=True,
            is_deleted=False
        )
    
    def expiring_soon(self, tenant_id, days=7):
        from datetime import timedelta
        threshold = timezone.now().date() + timedelta(days=days)
        return self.filter(
            tenant_id=tenant_id,
            effective_to__lte=threshold,
            is_active=True,
            is_deleted=False
        )
    
    def expired(self, tenant_id):
        now = timezone.now().date()
        return self.filter(
            tenant_id=tenant_id,
            effective_to__lt=now,
            is_active=True,
            is_deleted=False
        )
    
    def get_current_interim_manager(self, employment_id):
        assignment = self.current_by_employee(employment_id).first()
        return assignment.interim_manager if assignment else None
    
    def get_active_by_employee_user(self, user_id, tenant_id):
        from apps.structure.models.employment import Employment
        employment = Employment.objects.current_by_user(user_id, tenant_id)
        if not employment:
            return self.none()
        return self.current_by_employee(employment.id)
    
    def get_interim_history(self, user_id, tenant_id):
        from apps.structure.models.employment import Employment
        employment = Employment.objects.current_by_user(user_id, tenant_id)
        if not employment:
            return self.none()
        return self.filter(employee_id=employment.id, is_deleted=False).order_by('-effective_from')
    
    def get_employees_under_interim(self, interim_manager_id, tenant_id):
        from apps.structure.models.employment import Employment
        assignments = self.filter(
            interim_manager_id=interim_manager_id,
            is_active=True,
            is_deleted=False
        )
        employee_ids = [a.employee_id for a in assignments]
        return Employment.objects.filter(id__in=employee_ids, tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True)
    
    def current_interim_by_manager(self, interim_manager_id):
        now = timezone.now().date()
        return self.filter(
            interim_manager_id=interim_manager_id,
            effective_from__lte=now,
            effective_to__gte=now,
            is_active=True,
            is_deleted=False
        )