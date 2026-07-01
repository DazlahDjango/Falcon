from typing import List, Dict, Any, Optional, Tuple
from uuid import UUID
from apps.structure.models.organizational_unit import OrganizationalUnit
from apps.structure.models.employment import Employment

class HeadcountValidatorService:
    @staticmethod
    def validate_org_unit_headcount(unit_id: UUID, tenant_id: UUID, include_pending: bool = False) -> Tuple[bool, int, Optional[int]]:
        unit = OrganizationalUnit.objects.filter(id=unit_id, tenant_id=tenant_id, is_deleted=False).first()
        if not unit:
            return False, 0, None
        if not unit.headcount_limit:
            return True, 0, None
        current_count = Employment.objects.filter(
            unit_id=unit_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).count()
        is_valid = current_count <= unit.headcount_limit
        return is_valid, current_count, unit.headcount_limit
    
    @staticmethod
    def validate_department_headcount(department_id: UUID, tenant_id: UUID, include_pending: bool = False) -> Tuple[bool, int, Optional[int]]:
        department = OrganizationalUnit.objects.filter(id=department_id, tenant_id=tenant_id, is_deleted=False).first()
        if not department:
            return False, 0, None
        if not department.headcount_limit:
            return True, 0, None
        current_count = Employment.objects.filter(
            department_id=department_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).count()
        is_valid = current_count <= department.headcount_limit
        return is_valid, current_count, department.headcount_limit
    
    @staticmethod
    def get_organization_headcount(tenant_id: UUID, include_inactive: bool = False) -> int:
        queryset = Employment.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        )
        if not include_inactive:
            queryset = queryset.filter(is_current=True, is_active=True)
        return queryset.count()
    
    @staticmethod
    def get_org_unit_headcount_report(tenant_id: UUID) -> List[Dict[str, Any]]:
        units = OrganizationalUnit.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False
        )
        report = []
        for unit in units:
            current_count = Employment.objects.filter(
                unit_id=unit.id,
                tenant_id=tenant_id,
                is_current=True,
                is_deleted=False,
                is_active=True
            ).count()
            report.append({
                'unit_id': str(unit.id),
                'unit_code': unit.code,
                'unit_name': unit.name,
                'level': unit.level,
                'current_headcount': current_count,
                'headcount_limit': unit.headcount_limit,
                'utilization_percentage': round((current_count / unit.headcount_limit * 100), 2) if unit.headcount_limit else None,
                'is_over_limit': current_count > unit.headcount_limit if unit.headcount_limit else False
            })
        return sorted(report, key=lambda x: x['current_headcount'], reverse=True)
    
    @staticmethod
    def get_headcount_by_level(tenant_id: UUID) -> Dict[str, int]:
        from apps.structure.enums.org_level import OrgLevel
        result = {}
        for level in [OrgLevel.DIVISION, OrgLevel.DEPARTMENT, OrgLevel.SECTION, OrgLevel.UNIT]:
            units = OrganizationalUnit.objects.filter(
                tenant_id=tenant_id,
                level=level,
                is_deleted=False,
                is_active=True
            )
            total = 0
            for unit in units:
                count = Employment.objects.filter(
                    unit_id=unit.id,
                    tenant_id=tenant_id,
                    is_current=True,
                    is_deleted=False,
                    is_active=True
                ).count()
                total += count
            result[level] = total
        return result