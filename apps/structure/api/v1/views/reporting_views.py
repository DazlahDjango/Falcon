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

    def get_span_data_dict(self, manager_employment):
        tenant_id = manager_employment.tenant_id
        # Direct reports count
        if manager_employment.position:
            direct_reports_count = Employment.objects.filter(
                position__reports_to=manager_employment.position,
                is_current=True,
                is_active=True,
                is_deleted=False,
                tenant_id=tenant_id
            ).count()
        else:
            direct_reports_count = 0
            
        # All reports (direct + indirect)
        all_reports = self.chain_service.get_all_reports(manager_employment.user_id, tenant_id)
        total_reports_count = len(all_reports)
        indirect_reports_count = max(0, total_reports_count - direct_reports_count)
        
        return {
            'manager_user_id': manager_employment.user_id,
            'direct_reports': direct_reports_count,
            'indirect_reports': indirect_reports_count,
            'total_reports': total_reports_count,
            'is_healthy': direct_reports_count <= 15,
            'warning': direct_reports_count > 15
        }

    @action(detail=False, methods=['get'], url_path='by-employee/(?P<user_id>[0-9a-f-]+)')
    def by_employee(self, request, user_id=None):
        tenant_id = request.user.tenant_id
        chain = self.chain_service.get_chain_of_command(user_id, tenant_id)
        return Response(chain)

    @action(detail=False, methods=['get'], url_path='by-manager/(?P<user_id>[0-9a-f-]+)')
    def by_manager(self, request, user_id=None):
        tenant_id = request.user.tenant_id
        reports = self.chain_service.get_direct_reports(user_id, tenant_id)
        from apps.structure.api.v1.serializers.employment import EmploymentSerializer
        serializer = EmploymentSerializer(reports, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='chain/(?P<user_id>[0-9a-f-]+)')
    def chain(self, request, user_id=None):
        tenant_id = request.user.tenant_id
        chain = self.chain_service.get_chain_of_command(user_id, tenant_id)
        return Response(chain)

    @action(detail=False, methods=['get'], url_path='span-of-control/(?P<manager_id>[0-9a-f-]+)')
    def span_of_control(self, request, manager_id=None):
        tenant_id = request.user.tenant_id
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
        tenant_id = request.user.tenant_id
        
        # Get all managers in tenant
        managers = Employment.objects.filter(
            tenant_id=tenant_id,
            is_manager=True,
            is_current=True,
            is_active=True,
            is_deleted=False
        )
        
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
