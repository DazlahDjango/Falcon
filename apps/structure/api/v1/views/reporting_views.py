from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from apps.structure.services.reporting.chain_service import ChainService
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanViewOrgChart
from apps.structure.models.employment import Employment
from apps.structure.api.v1.serializers.reporting_chain import (
    SpanOfControlSerializer,
    OrganizationSpanReportSerializer
)
from uuid import UUID

class ReportingLineViewSet(viewsets.ViewSet):
    permission_classes = [IsTenantMember, CanViewOrgChart]
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.chain_service = ChainService()

    def _get_tenant_id(self, request):
        tenant_id = getattr(request, 'current_tenant_id', None) or getattr(request.user, 'tenant_id', None)
        if not tenant_id:
            tenant_id = '6102e576-12b5-4347-9bb8-4ddae94b8a94'
        return tenant_id

    def get_span_data_dict(self, manager_employment):
        tenant_id = manager_employment.tenant_id
        from apps.accounts.models import User
        user = User.objects.filter(id=manager_employment.user_id).first()
        user_name = f"{user.first_name} {user.last_name}".strip() if user else str(manager_employment.user_id)
        user_email = user.email if user else ''
        pos_title = manager_employment.position.title if manager_employment.position else 'No Position'

        direct_reports = self.chain_service.get_direct_reports(manager_employment.user_id, tenant_id)
        direct_reports_count = len(direct_reports)
        all_reports = self.chain_service.get_all_reports(manager_employment.user_id, tenant_id)
        total_reports_count = len(all_reports)
        indirect_reports_count = max(0, total_reports_count - direct_reports_count)
        
        return {
            'manager_user_id': manager_employment.user_id,
            'manager_name': user_name,
            'manager_email': user_email,
            'manager_position': pos_title,
            'direct_reports': direct_reports_count,
            'indirect_reports': indirect_reports_count,
            'total_reports': total_reports_count,
            'is_healthy': direct_reports_count <= 15,
            'warning': direct_reports_count > 15
        }

    def list(self, request):
        tenant_id = self._get_tenant_id(request)
        from apps.accounts.models import User
        employments = Employment.objects.filter(
            tenant_id=tenant_id,
            is_current=True,
            is_active=True,
            is_deleted=False
        ).select_related('position', 'position__reports_to')
        
        user_ids = {e.user_id for e in employments if e.user_id}
        pos_ids = [e.position.reports_to_id for e in employments if e.position and e.position.reports_to_id]
        mgr_employments = {e.position_id: e for e in Employment.objects.filter(position_id__in=pos_ids, tenant_id=tenant_id, is_current=True, is_active=True, is_deleted=False)}
        for mgr_emp in mgr_employments.values():
            if mgr_emp.user_id:
                user_ids.add(mgr_emp.user_id)

        users = {u.id: u for u in User.objects.filter(id__in=user_ids)}
        
        results = []
        for emp in employments:
            user = users.get(emp.user_id)
            mgr_emp = None
            if emp.position and emp.position.reports_to_id:
                mgr_emp = mgr_employments.get(emp.position.reports_to_id)
            
            mgr_user = users.get(mgr_emp.user_id) if mgr_emp else None
            
            results.append({
                'id': str(emp.id),
                'employee_id': str(emp.id),
                'employee_user_id': str(emp.user_id),
                'employee_name': user.get_full_name() if user else str(emp.user_id),
                'employee_email': user.email if user else '',
                'employee_position': emp.position.title if emp.position else 'No Position',
                'manager_id': str(mgr_emp.id) if mgr_emp else None,
                'manager_user_id': str(mgr_emp.user_id) if mgr_emp else None,
                'manager_name': mgr_user.get_full_name() if mgr_user else 'None (Top Executive / CEO)',
                'manager_email': mgr_user.email if mgr_user else '',
                'manager_position': mgr_emp.position.title if mgr_emp and mgr_emp.position else 'None',
                'is_active': emp.is_active
            })
        return Response({'results': results, 'count': len(results)})

    @action(detail=False, methods=['get'], url_path='by-employee/(?P<user_id>[0-9a-f-]+)')
    def by_employee(self, request, user_id=None):
        tenant_id = self._get_tenant_id(request)
        chain = self.chain_service.get_chain_of_command(user_id, tenant_id)
        return Response(chain)

    @action(detail=False, methods=['get'], url_path='by-manager/(?P<user_id>[0-9a-f-]+)')
    def by_manager(self, request, user_id=None):
        tenant_id = self._get_tenant_id(request)
        reports = self.chain_service.get_direct_reports(user_id, tenant_id)
        from apps.structure.api.v1.serializers.employment import EmploymentSerializer
        serializer = EmploymentSerializer(reports, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='chain/(?P<user_id>[0-9a-f-]+)')
    def chain(self, request, user_id=None):
        tenant_id = self._get_tenant_id(request)
        chain = self.chain_service.get_chain_of_command(user_id, tenant_id)
        return Response(chain)

    @action(detail=False, methods=['get'], url_path='span-of-control(?:/(?P<manager_id>[0-9a-f-]+))?')
    def span_of_control(self, request, manager_id=None):
        tenant_id = self._get_tenant_id(request)
        if not manager_id:
            manager_id = request.query_params.get('manager_id') or request.query_params.get('user_id')
            
        if not manager_id:
            return self.organization_span(request)
            
        # Find manager employment by employment id first
        emp = Employment.objects.filter(id=manager_id, tenant_id=tenant_id, is_deleted=False).first()
        if not emp:
            # Fall back to user_id
            emp = Employment.objects.filter(user_id=manager_id, tenant_id=tenant_id, is_current=True, is_active=True, is_deleted=False).first()
            
        if not emp:
            return Response({'error': 'Employment not found for the specified manager ID.'}, status=status.HTTP_404_NOT_FOUND)
            
        span_data = self.get_span_data_dict(emp)
        serializer = SpanOfControlSerializer(span_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='organization-span')
    def organization_span(self, request):
        tenant_id = self._get_tenant_id(request)
        from django.db.models import Q
        
        # Get all managers and executives in tenant
        managers = Employment.objects.filter(
            Q(is_manager=True) | Q(is_executive=True),
            tenant_id=tenant_id,
            is_current=True,
            is_active=True,
            is_deleted=False
        ).select_related('position')
        
        manager_spans = []
        for mgr in managers:
            manager_spans.append(self.get_span_data_dict(mgr))
            
        # Distribution
        distribution = {
            '0': 0,
            '1-5': 0,
            '6-10': 0,
            '11-15': 0,
            '16-20': 0,
            '20+': 0
        }
        for span in manager_spans:
            total = span['direct_reports']
            if total == 0:
                distribution['0'] += 1
            elif total <= 5:
                distribution['1-5'] += 1
            elif total <= 10:
                distribution['6-10'] += 1
            elif total <= 15:
                distribution['11-15'] += 1
            elif total <= 20:
                distribution['16-20'] += 1
            else:
                distribution['20+'] += 1
                
        # Averages
        if manager_spans:
            count = len(manager_spans)
            avg_direct = sum(s['direct_reports'] for s in manager_spans) / count
            avg_indirect = sum(s['indirect_reports'] for s in manager_spans) / count
            avg_total = sum(s['total_reports'] for s in manager_spans) / count
        else:
            avg_direct = avg_indirect = avg_total = 0.0
            
        managers_with_warning = [s for s in manager_spans if s['warning']]
        
        report_data = {
            'managers': manager_spans,
            'average_direct': round(avg_direct, 2),
            'average_indirect': round(avg_indirect, 2),
            'average_total': round(avg_total, 2),
            'distribution': distribution,
            'managers_with_warning': managers_with_warning
        }
        
        serializer = OrganizationSpanReportSerializer(report_data)
        return Response(serializer.data)
