from typing import List, Optional, Dict, Any
from uuid import UUID
from django.db import transaction
from django.utils import timezone
from datetime import datetime
from django.core.cache import cache
from apps.structure.models.employment import Employment
from apps.structure.models.reporting_line import ReportingLine
from apps.structure.models.interim_assignment import InterimAssignment
from apps.structure.constants import DEFAULT_MAX_CACHE_TTL_SECONDS
from apps.structure.exceptions import ReportingChainError, SelfReportingError, EmploymentNotFoundError

class ChainService:
    def __init__(self):
        self._cache = cache
    
    def get_chain_of_command(self, user_id: UUID, tenant_id: UUID, use_cache: bool = True) -> List[Dict[str, Any]]:
        cache_key = f"structure:reporting_chain:{tenant_id}:{user_id}"
        if use_cache:
            cached = self._cache.get(cache_key)
            if cached:
                return cached
        employment = Employment.objects.current_by_user(user_id).first()
        if not employment:
            raise EmploymentNotFoundError(user_id)
        chain = []
        current = employment
        while current:
            reporting_line = ReportingLine.objects.filter(employee=current, is_active=True, is_deleted=False).first()
            if not reporting_line:
                break
            manager = reporting_line.manager
            interim = InterimAssignment.objects.current_by_employee(manager.id).first()
            if interim:
                chain.append({
                    'user_id': str(interim.interim_manager.user_id),
                    'employment_id': str(interim.interim_manager.id),
                    'is_interim': True,
                    'interim_id': str(interim.id),
                    'effective_to': interim.effective_to.isoformat() if interim.effective_to else None,
                    'position': interim.interim_manager.position.title if interim.interim_manager.position else None,
                    'is_manager': interim.interim_manager.is_manager,
                    'is_executive': interim.interim_manager.is_executive
                })
                current = interim.interim_manager
            else:
                chain.append({
                    'user_id': str(manager.user_id),
                    'employment_id': str(manager.id),
                    'is_interim': False,
                    'interim_id': None,
                    'effective_to': None,
                    'position': manager.position.title if manager.position else None,
                    'is_manager': manager.is_manager,
                    'is_executive': manager.is_executive
                })
                current = manager
        if use_cache:
            self._cache.set(cache_key, chain, DEFAULT_MAX_CACHE_TTL_SECONDS)
        return chain
    
    def get_direct_reports(self, user_id: UUID, tenant_id: UUID) -> List[Employment]:
        employment = Employment.objects.current_by_user(user_id).first()
        if not employment:
            raise EmploymentNotFoundError(user_id)
        reporting_lines = ReportingLine.objects.filter(manager=employment, is_active=True, is_deleted=False)
        return [rl.employee for rl in reporting_lines]
    
    def get_all_reports(self, user_id: UUID, tenant_id: UUID) -> List[Employment]:
        direct_reports = self.get_direct_reports(user_id, tenant_id)
        all_reports = list(direct_reports)
        for report in direct_reports:
            all_reports.extend(self.get_all_reports(str(report.user_id), tenant_id))
        return all_reports
    
    def get_reporting_depth(self, user_id: UUID, tenant_id: UUID) -> int:
        chain = self.get_chain_of_command(user_id, tenant_id)
        return len(chain)
    
    def get_effective_manager(self, user_id: UUID, tenant_id: UUID) -> Optional[Employment]:
        employment = Employment.objects.current_by_user(user_id).first()
        if not employment:
            raise EmploymentNotFoundError(user_id)
        interim = InterimAssignment.objects.current_by_employee(employment.id).first()
        if interim:
            return interim.interim_manager
        reporting_line = ReportingLine.objects.filter(employee=employment, is_active=True, is_deleted=False).first()
        if reporting_line:
            return reporting_line.manager
        return None
    
    def get_ultimate_manager(self, user_id: UUID, tenant_id: UUID) -> Optional[Dict[str, Any]]:
        chain = self.get_chain_of_command(user_id, tenant_id)
        if chain:
            return chain[-1]
        return None
    
    def get_span_of_control(self, user_id: UUID, tenant_id: UUID) -> Dict[str, Any]:
        direct_reports = self.get_direct_reports(user_id, tenant_id)
        return {
            'direct_count': len(direct_reports),
            'direct_reports': [str(e.user_id) for e in direct_reports],
            'total_reports': len(self.get_all_reports(user_id, tenant_id))
        }
    
    def validate_chain_integrity(self, tenant_id: UUID) -> List[Dict[str, Any]]:
        errors = []
        employments = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_active=True, is_deleted=False)
        for emp in employments:
            try:
                chain = self.get_chain_of_command(str(emp.user_id), tenant_id)
                seen = set()
                for node in chain:
                    if node['user_id'] in seen:
                        errors.append({
                            'user_id': str(emp.user_id),
                            'error': 'Circular reference detected in reporting chain'
                        })
                        break
                    seen.add(node['user_id'])
            except Exception as e:
                errors.append({
                    'user_id': str(emp.user_id),
                    'error': str(e)
                })
        return errors
    
    def assign_manager(self, employee_id: UUID, manager_id: UUID, effective_from: Optional[datetime] = None, approved_by: Optional[UUID] = None) -> ReportingLine:
        with transaction.atomic():
            employee = Employment.objects.get(id=employee_id, is_deleted=False)
            manager = Employment.objects.get(id=manager_id, is_deleted=False)
            if employee.user_id == manager.user_id:
                raise SelfReportingError()
            if employee.tenant_id != manager.tenant_id:
                raise ReportingChainError("Employee and manager must be in same tenant.")
            if not effective_from:
                effective_from = timezone.now().date()
            ReportingLine.objects.filter(employee=employee, is_active=True, is_deleted=False).update(is_active=False, effective_to=effective_from)
            reporting_line = ReportingLine.objects.create(
                tenant_id=employee.tenant_id,
                employee=employee,
                manager=manager,
                effective_from=effective_from,
                is_active=True,
                approved_by_id=approved_by
            )
            self._cache.delete(f"structure:reporting_chain:{employee.tenant_id}:{employee.user_id}")
            return reporting_line
    
    def remove_manager(self, employee_id: UUID) -> bool:
        with transaction.atomic():
            reporting_line = ReportingLine.objects.filter(
                employee_id=employee_id,
                is_active=True,
                is_deleted=False
            ).first()
            if reporting_line:
                reporting_line.is_active = False
                reporting_line.effective_to = timezone.now().date()
                reporting_line.save()
                self._cache.delete(f"structure:reporting_chain:{reporting_line.tenant_id}:{reporting_line.employee.user_id}")
            return True
    
    def clear_cache(self, tenant_id: UUID, user_id: Optional[UUID] = None) -> None:
        if user_id:
            self._cache.delete(f"structure:reporting_chain:{tenant_id}:{user_id}")
        else:
            keys = self._cache.keys(f"structure:reporting_chain:{tenant_id}:*")
            for key in keys:
                self._cache.delete(key)