from typing import List, Dict, Any, Optional
from uuid import UUID
from django.db import models
from ...models.employment import Employment
from ...models.reporting_line import ReportingLine
from ...exceptions import InvalidReportingWeightError, ReportingCycleExistsError

class MatrixSupportService:
    @staticmethod
    def get_all_reporting_relationships(employee_user_id: UUID, tenant_id: UUID, active_only: bool = True) -> List[Dict[str, Any]]:
        employment = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employment:
            return []
        reporting_lines = ReportingLine.objects.filter(
            employee_id=employment.id,
            tenant_id=tenant_id,
            is_deleted=False
        )
        if active_only:
            reporting_lines = reporting_lines.filter(is_active=True)
        results = []
        for line in reporting_lines.select_related('manager', 'manager__position'):
            results.append({
                'manager_user_id': str(line.manager.user_id),
                'manager_position': line.manager.position.title if line.manager.position else None,
                'relation_type': line.relation_type,
                'reporting_weight': float(line.reporting_weight),
                'can_approve_kpi': line.can_approve_kpi,
                'can_conduct_review': line.can_conduct_review,
                'effective_from': line.effective_from,
                'effective_to': line.effective_to,
                'is_active': line.is_active
            })
        return results
    @staticmethod
    def add_dotted_line_report(employee_user_id: UUID, manager_user_id: UUID, tenant_id: UUID, weight: float = 0.3, **kwargs) -> ReportingLine:
        if weight < 0 or weight > 1:
            raise InvalidReportingWeightError(weight)
        employee_emp = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        manager_emp = Employment.objects.filter(
            user_id=manager_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employee_emp or not manager_emp:
            raise ValueError("Employee or manager not found")
        existing = ReportingLine.objects.filter(
            employee_id=employee_emp.id,
            manager_id=manager_emp.id,
            relation_type='dotted',
            is_active=True,
            tenant_id=tenant_id
        ).exists()
        if existing:
            raise ReportingCycleExistsError(str(employee_user_id), str(manager_user_id), 'dotted')
        return ReportingLine.objects.create(
            employee_id=employee_emp.id,
            manager_id=manager_emp.id,
            relation_type='dotted',
            reporting_weight=weight,
            tenant_id=tenant_id,
            **kwargs
        )
    
    @staticmethod
    def update_reporting_weights(employee_user_id: UUID, tenant_id: UUID, weights: Dict[UUID, float]) -> bool:
        employment = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employment:
            return False
        total_weight = sum(weights.values())
        if abs(total_weight - 1.0) > 0.01:
            raise InvalidReportingWeightError(total_weight)
        for manager_id, weight in weights.items():
            ReportingLine.objects.filter(
                employee_id=employment.id,
                manager__user_id=manager_id,
                tenant_id=tenant_id,
                is_active=True
            ).update(reporting_weight=weight)
        return True
    
    @staticmethod
    def get_primary_manager(employee_user_id: UUID, tenant_id: UUID) -> Optional[Dict[str, Any]]:
        relationships = MatrixSupportService.get_all_reporting_relationships(employee_user_id, tenant_id)
        for rel in relationships:
            if rel['relation_type'] == 'solid':
                return rel
        return None
    
    @staticmethod
    def get_functional_managers(employee_user_id: UUID, tenant_id: UUID) -> List[Dict[str, Any]]:
        relationships = MatrixSupportService.get_all_reporting_relationships(employee_user_id, tenant_id)
        return [rel for rel in relationships if rel['relation_type'] in ['dotted', 'matrix']]
    
    @staticmethod
    def validate_reporting_distribution(employee_user_id: UUID, tenant_id: UUID) -> bool:
        relationships = MatrixSupportService.get_all_reporting_relationships(employee_user_id, tenant_id, active_only=True)
        total_weight = sum(rel['reporting_weight'] for rel in relationships)
        return abs(total_weight - 1.0) <= 0.01