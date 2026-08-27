from typing import List, Optional, Dict, Any
from uuid import UUID
from django.db import transaction
from django.utils import timezone
from datetime import datetime
from django.core.cache import cache
from apps.structure.models.employment import Employment
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
        
        employment = Employment.objects.current_by_user(user_id, tenant_id)
        if not employment:
            raise EmploymentNotFoundError(user_id)
        
        chain = []
        current = employment
        seen_user_ids = {str(current.user_id)}
        
        while current:
            # Check for active interim assignment first
            interim = InterimAssignment.objects.current_by_employee(current.id).first()
            if interim and interim.interim_manager:
                manager = interim.interim_manager
                manager_user_id_str = str(manager.user_id)
                if manager_user_id_str in seen_user_ids:
                    # Prevent infinite cycle
                    break
                seen_user_ids.add(manager_user_id_str)
                chain.append({
                    'user_id': manager_user_id_str,
                    'employment_id': str(manager.id),
                    'is_interim': True,
                    'interim_id': str(interim.id),
                    'effective_to': interim.effective_to.isoformat() if interim.effective_to else None,
                    'position': manager.position.title if manager.position else None,
                    'is_manager': manager.is_manager,
                    'is_executive': manager.is_executive
                })
                current = manager
            else:
                # Regular manager via position reports_to relationship
                reports_to_pos = current.position.reports_to if current.position else None
                if not reports_to_pos:
                    break
                
                manager = Employment.objects.filter(
                    position=reports_to_pos,
                    tenant_id=tenant_id,
                    is_current=True,
                    is_active=True,
                    is_deleted=False
                ).first()
                
                if not manager:
                    break
                
                manager_user_id_str = str(manager.user_id)
                if manager_user_id_str in seen_user_ids:
                    # Prevent infinite cycle
                    break
                seen_user_ids.add(manager_user_id_str)
                
                from apps.accounts.models import User
                mgr_user = User.objects.filter(id=manager.user_id).first()
                mgr_name = f"{mgr_user.first_name} {mgr_user.last_name}".strip() or mgr_user.email if mgr_user else f"Manager ({manager.position.title if manager.position else 'Staff'})"
                
                chain.append({
                    'user_id': manager_user_id_str,
                    'user_name': mgr_name,
                    'user_email': mgr_user.email if mgr_user else '',
                    'employment_id': str(manager.id),
                    'is_interim': False,
                    'interim_id': None,
                    'effective_to': None,
                    'position': manager.position.title if manager.position else None,
                    'position_title': manager.position.title if manager.position else None,
                    'department_name': manager.position.department.name if manager.position and manager.position.department else None,
                    'division_name': manager.position.division.name if manager.position and manager.position.division else None,
                    'is_manager': manager.is_manager,
                    'is_executive': manager.is_executive
                })
                current = manager
                
        if use_cache:
            self._cache.set(cache_key, chain, DEFAULT_MAX_CACHE_TTL_SECONDS)
        return chain
    
    def get_direct_reports(self, user_id: UUID, tenant_id: UUID) -> List[Employment]:
        employment = Employment.objects.current_by_user(user_id, tenant_id)
        if not employment:
            return []
        
        # Solid reports (via position reports_to)
        if employment.position:
            solid_reports = list(Employment.objects.filter(
                position__reports_to=employment.position,
                tenant_id=tenant_id,
                is_current=True,
                is_active=True,
                is_deleted=False
            ))
        else:
            solid_reports = []
            
        # Interim reports (via active InterimAssignments)
        interim_assignments = InterimAssignment.objects.filter(
            interim_manager=employment,
            is_active=True,
            is_deleted=False,
            tenant_id=tenant_id
        ).select_related('employee')
        
        # Filter active dates for interim reports
        from django.utils import timezone
        now = timezone.now().date()
        interim_reports = []
        for ia in interim_assignments:
            if ia.effective_from <= now <= ia.effective_to and ia.employee.is_current and ia.employee.is_active:
                interim_reports.append(ia.employee)
                
        # Return distinct employments
        all_reports = {emp.id: emp for emp in solid_reports + interim_reports}
        return list(all_reports.values())
    
    def get_all_reports(self, user_id: UUID, tenant_id: UUID) -> List[Employment]:
        direct_reports = self.get_direct_reports(user_id, tenant_id)
        all_reports = list(direct_reports)
        seen_user_ids = {str(user_id)}
        
        for report in direct_reports:
            report_user_id_str = str(report.user_id)
            if report_user_id_str not in seen_user_ids:
                seen_user_ids.add(report_user_id_str)
                all_reports.extend(self.get_all_reports(report_user_id_str, tenant_id))
        return all_reports
    
    def get_reporting_depth(self, user_id: UUID, tenant_id: UUID) -> int:
        chain = self.get_chain_of_command(user_id, tenant_id)
        return len(chain)
    
    def get_effective_manager(self, user_id: UUID, tenant_id: UUID) -> Optional[Employment]:
        employment = Employment.objects.current_by_user(user_id, tenant_id)
        if not employment:
            return None
        
        # Check active interim assignment
        interim = InterimAssignment.objects.current_by_employee(employment.id).first()
        if interim:
            return interim.interim_manager
            
        # Check regular reports_to manager
        reports_to_pos = employment.position.reports_to if employment.position else None
        if reports_to_pos:
            return Employment.objects.filter(
                position=reports_to_pos,
                tenant_id=tenant_id,
                is_current=True,
                is_active=True,
                is_deleted=False
            ).first()
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
    
    def assign_manager(self, employee_id: UUID, manager_id: UUID, effective_from: Optional[datetime] = None, approved_by: Optional[UUID] = None) -> Employment:
        raise NotImplementedError("Manager assignments must be updated by moving positions.")
    
    def remove_manager(self, employee_id: UUID) -> bool:
        raise NotImplementedError("Manager assignments must be updated by moving positions.")
    
    def clear_cache(self, tenant_id: UUID, user_id: Optional[UUID] = None) -> None:
        if user_id:
            self._cache.delete(f"structure:reporting_chain:{tenant_id}:{user_id}")
        else:
            keys = self._cache.keys(f"structure:reporting_chain:{tenant_id}:*")
            for key in keys:
                self._cache.delete(key)