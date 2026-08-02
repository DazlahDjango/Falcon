# apps/reportplt/services/extraction/production/structure_extractor.py
import logging
from typing import Dict, Any, List, Optional
from django.db import models
from django.utils import timezone
from apps.structure.models import (
    Division, Department, Section, Unit, Position, Employment,
    InterimAssignment, CostCenter, CostCenterAllocation, Location
)
from apps.structure.services.reporting.chain_service import ChainService

logger = logging.getLogger(__name__)


class StructureOrgChartExtractor:
    """Extracts 4-level organizational hierarchy (Division -> Department -> Section -> Unit), paths, depth, and headcount statistics."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        divisions = Division.objects.filter(is_active=True)
        departments = Department.objects.filter(is_active=True)
        sections = Section.objects.filter(is_active=True)
        units = Unit.objects.filter(is_active=True)
        employments = Employment.objects.filter(is_current=True, is_active=True)

        if self.tenant_id:
            divisions = divisions.filter(tenant_id=self.tenant_id)
            departments = departments.filter(tenant_id=self.tenant_id)
            sections = sections.filter(tenant_id=self.tenant_id)
            units = units.filter(tenant_id=self.tenant_id)
            employments = employments.filter(tenant_id=self.tenant_id)

        div_list = []
        for d in divisions[:50]:
            dept_count = departments.filter(division=d).count()
            emp_count = employments.filter(position__department__division=d).count()
            div_list.append({
                'id': str(d.id),
                'code': d.code,
                'name': d.name,
                'depth': d.depth,
                'path': d.path,
                'departments_count': dept_count,
                'employee_count': emp_count,
            })

        dept_list = []
        for dept in departments[:100]:
            sec_count = sections.filter(department=dept).count()
            emp_count = employments.filter(position__department=dept).count()
            dept_list.append({
                'id': str(dept.id),
                'code': dept.code,
                'name': dept.name,
                'division_code': dept.division.code if dept.division else 'N/A',
                'parent_code': dept.parent.code if dept.parent else None,
                'depth': dept.depth,
                'path': dept.path,
                'sensitivity_level': dept.sensitivity_level,
                'sections_count': sec_count,
                'employee_count': emp_count,
            })

        return {
            'summary': {
                'total_divisions': len(div_list),
                'total_departments': len(dept_list),
                'total_sections': sections.count(),
                'total_units': units.count(),
                'total_active_employees': employments.count(),
            },
            'divisions': div_list,
            'departments': dept_list,
        }


class StructureSpanOfControlExtractor:
    """Extracts manager direct report counts, indirect report counts, and identifies managers exceeding span-of-control limits."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.chain_service = ChainService()

    def extract(self) -> Dict[str, Any]:
        managers = Employment.objects.filter(is_current=True, is_active=True, is_manager=True)
        if self.tenant_id:
            managers = managers.filter(tenant_id=self.tenant_id)

        manager_span_list = []
        overloaded_managers = 0

        for mgr in managers.select_related('position')[:100]:
            t_id = self.tenant_id or str(mgr.tenant_id)
            try:
                span_data = self.chain_service.get_span_of_control(mgr.user_id, t_id)
                direct_count = span_data['direct_count']
                total_count = span_data['total_reports']
            except Exception:
                direct_count = 0
                total_count = 0

            is_overloaded = direct_count > 50
            if is_overloaded:
                overloaded_managers += 1

            manager_span_list.append({
                'manager_id': str(mgr.id),
                'user_id': str(mgr.user_id),
                'position_title': mgr.position.title if mgr.position else 'N/A',
                'department_name': mgr.position.department.name if mgr.position and mgr.position.department else 'N/A',
                'direct_reports_count': direct_count,
                'total_reports_count': total_count,
                'is_overloaded': is_overloaded,
                'is_executive': mgr.is_executive,
            })

        return {
            'summary': {
                'total_managers': len(manager_span_list),
                'overloaded_managers_count': overloaded_managers,
                'average_direct_reports': round(sum(m['direct_reports_count'] for m in manager_span_list) / len(manager_span_list), 2) if manager_span_list else 0.0,
            },
            'managers': manager_span_list,
        }


class StructureInterimDelegationExtractor:
    """Extracts active interim assignments, acting manager delegations, and remaining validity periods."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        interims = InterimAssignment.objects.filter(is_active=True).select_related('employee', 'interim_manager')
        if self.tenant_id:
            interims = interims.filter(tenant_id=self.tenant_id)

        interim_list = []
        now = timezone.now().date()
        expiring_soon_count = 0

        for ia in interims.order_by('-effective_from')[:100]:
            days_left = ia.days_remaining
            if days_left <= 7:
                expiring_soon_count += 1

            interim_list.append({
                'id': str(ia.id),
                'employee_user_id': str(ia.employee.user_id) if ia.employee else 'N/A',
                'interim_manager_user_id': str(ia.interim_manager.user_id) if ia.interim_manager else 'N/A',
                'reporting_type': ia.reporting_type,
                'effective_from': ia.effective_from.isoformat() if ia.effective_from else None,
                'effective_to': ia.effective_to.isoformat() if ia.effective_to else None,
                'days_remaining': days_left,
                'is_current': ia.is_current,
                'reason': ia.reason,
            })

        return {
            'summary': {
                'total_active_interim_assignments': len(interim_list),
                'expiring_in_7_days': expiring_soon_count,
            },
            'interim_assignments': interim_list,
        }


class StructureCostCenterAllocationExtractor:
    """Extracts cost center categories, budget allocations, department cost splits, and physical location hubs."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        cost_centers = CostCenter.objects.filter(is_active=True)
        allocations = CostCenterAllocation.objects.all().select_related('cost_center', 'department')
        locations = Location.objects.filter(is_active=True)

        if self.tenant_id:
            cost_centers = cost_centers.filter(tenant_id=self.tenant_id)
            allocations = allocations.filter(tenant_id=self.tenant_id)
            locations = locations.filter(tenant_id=self.tenant_id)

        cc_list = []
        total_budget = 0.0

        for cc in cost_centers[:50]:
            b_val = float(cc.budget_amount) if cc.budget_amount else 0.0
            total_budget += b_val
            dept_allocs = allocations.filter(cost_center=cc)

            cc_list.append({
                'id': str(cc.id),
                'code': cc.code,
                'name': cc.name,
                'category': cc.category,
                'budget_amount': b_val,
                'allocated_departments_count': dept_allocs.count(),
            })

        loc_list = []
        for loc in locations[:50]:
            loc_list.append({
                'id': str(loc.id),
                'code': loc.code,
                'name': loc.name,
                'location_type': loc.location_type,
                'city': loc.city,
                'country': loc.country,
            })

        return {
            'summary': {
                'total_cost_centers': len(cc_list),
                'total_budget_allocated': round(total_budget, 2),
                'total_locations': len(loc_list),
            },
            'cost_centers': cc_list,
            'locations': loc_list,
        }


class StructureSecuritySensitivityExtractor:
    """Extracts department sensitivity level distributions and scope enforcement statistics."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}

    def extract(self) -> Dict[str, Any]:
        departments = Department.objects.filter(is_active=True)
        if self.tenant_id:
            departments = departments.filter(tenant_id=self.tenant_id)

        sensitivity_counts = {
            'public': departments.filter(sensitivity_level='public').count(),
            'internal': departments.filter(sensitivity_level='internal').count(),
            'confidential': departments.filter(sensitivity_level='confidential').count(),
            'restricted': departments.filter(sensitivity_level='restricted').count(),
        }

        restricted_depts = []
        for d in departments.filter(sensitivity_level__in=['confidential', 'restricted'])[:50]:
            restricted_depts.append({
                'id': str(d.id),
                'code': d.code,
                'name': d.name,
                'sensitivity_level': d.sensitivity_level,
                'manager_id': str(d.manager_id) if d.manager_id else None,
            })

        return {
            'summary': {
                'total_monitored_departments': departments.count(),
                'sensitivity_breakdown': sensitivity_counts,
                'restricted_confidential_count': sensitivity_counts['confidential'] + sensitivity_counts['restricted'],
            },
            'sensitive_departments': restricted_depts,
        }


class StructureUnifiedExtractor:
    """Master Unified Extractor orchestrating real-data structure extractions across org charts, span-of-control, interim management, and cost centers."""

    def __init__(self, tenant_id: Optional[str] = None, filters: Optional[Dict] = None):
        self.tenant_id = tenant_id
        self.filters = filters or {}
        self.org_chart_extractor = StructureOrgChartExtractor(tenant_id, filters)
        self.span_extractor = StructureSpanOfControlExtractor(tenant_id, filters)
        self.interim_extractor = StructureInterimDelegationExtractor(tenant_id, filters)
        self.cost_center_extractor = StructureCostCenterAllocationExtractor(tenant_id, filters)
        self.security_extractor = StructureSecuritySensitivityExtractor(tenant_id, filters)

    def extract(self) -> Dict[str, Any]:
        chart_data = self.org_chart_extractor.extract()
        span_data = self.span_extractor.extract()
        interim_data = self.interim_extractor.extract()
        cost_data = self.cost_center_extractor.extract()
        sec_data = self.security_extractor.extract()

        return {
            'source': 'structure',
            'extracted_at': timezone.now().isoformat(),
            'org_chart': chart_data,
            'span_of_control': span_data,
            'interim_delegation': interim_data,
            'cost_center_allocation': cost_data,
            'security_sensitivity': sec_data,
            'summary': {
                'total_divisions': chart_data['summary']['total_divisions'],
                'total_departments': chart_data['summary']['total_departments'],
                'total_active_employees': chart_data['summary']['total_active_employees'],
                'total_managers': span_data['summary']['total_managers'],
                'overloaded_managers_count': span_data['summary']['overloaded_managers_count'],
                'active_interim_assignments': interim_data['summary']['total_active_interim_assignments'],
                'total_budget_allocated': cost_data['summary']['total_budget_allocated'],
            }
        }


StructureDataExtractor = StructureUnifiedExtractor
