from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from django.utils import timezone
from ..throttles.structure_limits import HierarchyReadThrottle
from ..permissions.structure_permissions import CanViewHierarchy
from .base import BaseStructureReadOnlyViewSet


class StructureDashboardViewSet(BaseStructureReadOnlyViewSet):
    permission_classes = [CanViewHierarchy]
    throttle_classes = [HierarchyReadThrottle]
    
    @action(detail=False, methods=['get'], url_path='overview')
    def get_overview(self, request):
        tenant_id = request.user.tenant_id
        from ....models import Department, Team, Employment, Position, Location, CostCenter
        # Department stats
        departments = Department.objects.filter(tenant_id=tenant_id, is_deleted=False)
        dept_total = departments.count()
        dept_active = departments.filter(is_active=True).count()
        dept_root = departments.filter(parent__isnull=True).count()
        # Team stats
        teams = Team.objects.filter(tenant_id=tenant_id, is_deleted=False)
        team_total = teams.count()
        team_active = teams.filter(is_active=True).count()
        team_with_leads = teams.filter(team_lead__isnull=False).count()
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
        return Response({
            'tenant_id': str(tenant_id),
            'generated_at': timezone.now().isoformat(),
            'departments': {
                'total': dept_total,
                'active': dept_active,
                'root_departments': dept_root,
                'inactive': dept_total - dept_active,
                'activation_rate': round((dept_active / dept_total * 100), 2) if dept_total > 0 else 0
            },
            'teams': {
                'total': team_total,
                'active': team_active,
                'with_team_leads': team_with_leads,
                'team_lead_coverage': round((team_with_leads / team_total * 100), 2) if team_total > 0 else 0
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
        from ....services.hierarchy.cycle_detector import CycleDetector
        from ....services.validation.org_validator import OrgValidatorService
        from ....services.reporting.span_of_control import SpanOfControlService
        dept_cycles = CycleDetector.find_all_cycles(tenant_id, 'department')
        team_cycles = CycleDetector.find_all_cycles(tenant_id, 'team')
        validator = OrgValidatorService()
        integrity_check = validator.validate_org_integrity(tenant_id)
        span_service = SpanOfControlService()
        managers_with_issue = span_service.identify_managers_with_span_warning(tenant_id, threshold=15)
        health_score = 100
        health_issues = []
        if dept_cycles:
            health_score -= len(dept_cycles) * 5
            health_issues.append(f"{len(dept_cycles)} department cycle(s) detected")
        if team_cycles:
            health_score -= len(team_cycles) * 5
            health_issues.append(f"{len(team_cycles)} team cycle(s) detected")
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
                'department_cycles': len(dept_cycles),
                'team_cycles': len(team_cycles),
                'integrity_issues': integrity_check['issue_count'],
                'managers_with_span_warning': len(managers_with_issue)
            }
        })
    
    @action(detail=False, methods=['get'], url_path='trends')
    def get_trends(self, request):
        tenant_id = request.user.tenant_id
        months = int(request.query_params.get('months', 6))
        from ....models.hierarchy_version import HierarchyVersion
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
                    'departments_count': len(snapshot.get('departments', []))
                })
        return Response({
            'tenant_id': str(tenant_id),
            'trends': trends,
            'period_months': months
        })