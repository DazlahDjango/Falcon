from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from django.utils import timezone
from apps.structure.api.v1.throttles.structure_limits import HierarchyReadThrottle
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanViewOrgChart
from .base import BaseStructureReadOnlyViewSet


class StructureDashboardViewSet(BaseStructureReadOnlyViewSet):
    permission_classes = [IsTenantMember, CanViewOrgChart]
    throttle_classes = [HierarchyReadThrottle]
    
    @action(detail=False, methods=['get'], url_path='overview')
    def get_overview(self, request):
        tenant_id = request.user.tenant_id
        from apps.structure.models import OrganizationalUnit, Employment, Position, Location, CostCenter
        # Organizational Unit stats
        units = OrganizationalUnit.objects.filter(tenant_id=tenant_id, is_deleted=False)
        unit_total = units.count()
        unit_active = units.filter(is_active=True).count()
        unit_root = units.filter(parent__isnull=True).count()
        # Employment stats
        employments = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True)
        emp_total = employments.count()
        emp_managers = employments.filter(is_manager=True).count()
        emp_executives = employments.filter(is_executive=True).count()
        # Position stats
        positions = Position.objects.filter(tenant_id=tenant_id, is_deleted=False)
        pos_total = positions.count()
        pos_vacant = positions.filter(current_incumbents_count=0).count()
        pos_occupied = pos_total - pos_vacant
        # Location stats
        locations = Location.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True)
        loc_total = locations.count()
        loc_countries = locations.values('country').distinct().count()
        # Cost center stats
        cost_centers = CostCenter.objects.filter(tenant_id=tenant_id, is_deleted=False, is_active=True)
        cc_total = cost_centers.count()
        total_budget = cost_centers.aggregate(total=models.Sum('budget_amount'))['total'] or 0
        # Level distribution
        from apps.structure.enums.org_level import OrgLevel
        level_distribution = {}
        for level in [OrgLevel.DIVISION, OrgLevel.DEPARTMENT, OrgLevel.SECTION, OrgLevel.UNIT]:
            count = units.filter(level=level, is_deleted=False).count()
            level_distribution[level] = count
        return Response({
            'tenant_id': str(tenant_id),
            'generated_at': timezone.now().isoformat(),
            'organizational_units': {
                'total': unit_total,
                'active': unit_active,
                'root_units': unit_root,
                'inactive': unit_total - unit_active,
                'activation_rate': round((unit_active / unit_total * 100), 2) if unit_total > 0 else 0,
                'level_distribution': level_distribution
            },
            'employments': {
                'total_current': emp_total,
                'managers': emp_managers,
                'executives': emp_executives,
                'management_percentage': round((emp_managers / emp_total * 100), 2) if emp_total > 0 else 0
            },
            'positions': {
                'total': pos_total,
                'vacant': pos_vacant,
                'occupied': pos_occupied,
                'occupancy_rate': round((pos_occupied / pos_total * 100), 2) if pos_total > 0 else 0
            },
            'locations': {
                'total_active': loc_total,
                'countries': loc_countries
            },
            'cost_centers': {
                'total_active': cc_total,
                'total_budget': float(total_budget)
            }
        })
    
    @action(detail=False, methods=['get'], url_path='hierarchy-health')
    def get_hierarchy_health(self, request):
        tenant_id = request.user.tenant_id
        from apps.structure.services.hierarchy.cycle_detector import CycleDetector
        from apps.structure.services.validation.org_validator import OrgValidatorService
        from apps.structure.services.reporting.span_of_control import SpanOfControl
        cycles = CycleDetector().find_all_cycles(tenant_id)
        validator = OrgValidatorService()
        integrity_check = validator.validate_org_integrity(tenant_id)
        span_service = SpanOfControl()
        managers_with_issue = span_service.identify_overloaded_managers(tenant_id, threshold=15)
        health_score = 100
        health_issues = []
        if cycles:
            health_score -= len(cycles) * 5
            health_issues.append(f"{len(cycles)} cycle(s) detected")
        if not integrity_check['is_valid']:
            health_score -= integrity_check['issue_count'] * 2
            health_issues.append(f"{integrity_check['issue_count']} integrity issue(s) found")
        if managers_with_issue:
            health_score -= len(managers_with_issue) * 2
            health_issues.append(f"{len(managers_with_issue)} manager(s) exceed span of control")
        health_score = max(0, min(100, health_score))
        return Response({
            'tenant_id': str(tenant_id),
            'health_score': health_score,
            'status': 'healthy' if health_score >= 80 else 'warning' if health_score >= 50 else 'critical',
            'issues': health_issues,
            'details': {
                'cycles': len(cycles),
                'integrity_issues': integrity_check['issue_count'],
                'managers_with_span_warning': len(managers_with_issue)
            }
        })
    
    @action(detail=False, methods=['get'], url_path='trends')
    def get_trends(self, request):
        tenant_id = request.user.tenant_id
        months = int(request.query_params.get('months', 6))
        from apps.structure.models.hierarchy_version import HierarchyVersion
        versions = HierarchyVersion.objects.filter(
            tenant_id=tenant_id,
            is_deleted=False,
            version_type='auto'
        ).order_by('-effective_from')[:months]
        trends = []
        for version in reversed(versions):
            snapshot = version.snapshot
            if snapshot:
                trends.append({
                    'date': version.effective_from.date().isoformat(),
                    'version_number': version.version_number,
                    'units_count': len(snapshot.get('divisions', []))
                })
        return Response({
            'tenant_id': str(tenant_id),
            'trends': trends,
            'period_months': months
        })