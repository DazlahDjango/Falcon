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
    
    def by_division(self, division_id, tenant_id, current_only=True):
        qs = self.filter(division_id=division_id, tenant_id=tenant_id, is_deleted=False)
        if current_only:
            qs = qs.filter(is_current=True, is_active=True)
        return qs
    
    def by_department(self, department_id, tenant_id, current_only=True):
        qs = self.filter(department_id=department_id, tenant_id=tenant_id, is_deleted=False)
        if current_only:
            qs = qs.filter(is_current=True, is_active=True)
        return qs
    
    def by_section(self, section_id, tenant_id, current_only=True):
        qs = self.filter(section_id=section_id, tenant_id=tenant_id, is_deleted=False)
        if current_only:
            qs = qs.filter(is_current=True, is_active=True)
        return qs
    
    def by_unit(self, unit_id, tenant_id, current_only=True):
        qs = self.filter(unit_id=unit_id, tenant_id=tenant_id, is_deleted=False)
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
        return self.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            effective_from__lte=date,
            is_active=True
        ).filter(
            models.Q(effective_to__isnull=True) | models.Q(effective_to__gte=date)
        )
    
    def get_direct_reports(self, manager_user_id, tenant_id):
        from apps.structure.models.reporting_line import ReportingLine
        manager_emp = self.current_by_user(manager_user_id, tenant_id)
        if not manager_emp:
            return self.none()
        reporting_lines = ReportingLine.objects.filter(
            manager=manager_emp,
            is_active=True,
            tenant_id=tenant_id,
            is_deleted=False
        ).select_related('employee')
        employee_ids = [rl.employee.id for rl in reporting_lines]
        return self.filter(id__in=employee_ids, tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True)
    
    def get_descendants(self, manager_user_id, tenant_id, depth=0, max_depth=10):
        if depth > max_depth:
            return []
        from apps.structure.models.reporting_line import ReportingLine
        manager_emp = self.current_by_user(manager_user_id, tenant_id)
        if not manager_emp:
            return []
        direct_reports = ReportingLine.objects.filter(
            manager=manager_emp,
            is_active=True,
            tenant_id=tenant_id,
            is_deleted=False
        ).select_related('employee')
        descendant_ids = []
        for report in direct_reports:
            if report.employee:
                descendant_ids.append(report.employee.user_id)
                descendant_ids.extend(self.get_descendants(report.employee.user_id, tenant_id, depth + 1, max_depth))
        return descendant_ids
    
    def get_management_chain_up(self, user_id, tenant_id, include_self=False, max_depth=10):
        chain = []
        current_user_id = user_id
        depth = 0
        while current_user_id and depth < max_depth:
            emp = self.current_by_user(current_user_id, tenant_id)
            if not emp:
                break
            reporting_line = ReportingLine.objects.filter(
                employee=emp,
                is_active=True,
                tenant_id=tenant_id,
                is_deleted=False
            ).select_related('manager').first()
            if not reporting_line or not reporting_line.manager:
                break
            chain.append(reporting_line.manager.user_id)
            current_user_id = reporting_line.manager.user_id
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
    
    def get_by_org_unit_path(self, tenant_id, path):
        from apps.structure.models.organizational_unit import OrganizationalUnit
        unit = OrganizationalUnit.objects.filter(tenant_id=tenant_id, path=path, is_deleted=False).first()
        if not unit:
            return self.none()
        return self.filter(
            models.Q(division_id=unit.id) |
            models.Q(department_id=unit.id) |
            models.Q(section_id=unit.id) |
            models.Q(unit_id=unit.id),
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).distinct()