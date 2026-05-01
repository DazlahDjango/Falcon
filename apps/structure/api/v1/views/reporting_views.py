from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction, models
from django.utils import timezone
from uuid import UUID
from ....models import ReportingLine
from ..serializers.reporting import ReportingLineSerializer, ReportingLineDetailSerializer, ReportingLineCreateUpdateSerializer
from ..filters.reporting_filter import ReportingLineFilter
from ..throttles.structure_limits import ReportingRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from ..permissions.structure_permissions import CanViewReportingLine, CanEditReportingLine, CanDeleteReportingLine
from .base import BaseStructureViewSet


class ReportingLineViewSet(BaseStructureViewSet):
    queryset = ReportingLine.objects.select_related('employee', 'employee__position', 'manager', 'manager__position').all()
    filterset_class = ReportingLineFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['change_reason']
    ordering_fields = ['effective_from', 'effective_to', 'created_at', 'reporting_weight']
    ordering = ['-effective_from']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ReportingLineDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ReportingLineCreateUpdateSerializer
        return ReportingLineSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            self.permission_classes = [CanEditReportingLine]
        elif self.action == 'destroy':
            self.permission_classes = [CanDeleteReportingLine]
        else:
            self.permission_classes = [CanViewReportingLine]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.throttle_classes = [ReportingRateThrottle, HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=False, methods=['get'], url_path='by-employee/(?P<employee_user_id>[0-9a-f-]+)')
    def get_by_employee(self, request, employee_user_id=None):
        from ....models.employment import Employment
        tenant_id = request.user.tenant_id
        employment = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employment:
            return Response({'error': 'Employee employment not found'}, status=status.HTTP_404_NOT_FOUND)
        reporting_lines = ReportingLine.objects.filter(
            employee_id=employment.id,
            tenant_id=tenant_id,
            is_deleted=False
        ).select_related('manager', 'manager__position')
        serializer = ReportingLineDetailSerializer(reporting_lines, many=True, context={'request': request})
        return Response({
            'employee_user_id': employee_user_id,
            'reporting_lines': serializer.data,
            'count': reporting_lines.count()
        })
    
    @action(detail=False, methods=['get'], url_path='by-manager/(?P<manager_user_id>[0-9a-f-]+)')
    def get_by_manager(self, request, manager_user_id=None):
        from ....models.employment import Employment
        tenant_id = request.user.tenant_id
        employment = Employment.objects.filter(
            user_id=manager_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employment:
            return Response({'error': 'Manager employment not found'}, status=status.HTTP_404_NOT_FOUND)
        reporting_lines = ReportingLine.objects.filter(
            manager_id=employment.id,
            tenant_id=tenant_id,
            is_deleted=False,
            is_active=True
        ).select_related('employee', 'employee__position')
        serializer = ReportingLineDetailSerializer(reporting_lines, many=True, context={'request': request})
        return Response({
            'manager_user_id': manager_user_id,
            'direct_reports': serializer.data,
            'count': reporting_lines.count()
        })
    
    @action(detail=False, methods=['get'], url_path='team/(?P<manager_user_id>[0-9a-f-]+)')
    def get_team_members(self, request, manager_user_id=None):
        from ....services.reporting.chain_service import ReportingChainService
        tenant_id = request.user.tenant_id
        chain_service = ReportingChainService()
        team = chain_service.get_chain_down(UUID(manager_user_id), tenant_id, include_indirect=True)
        return Response({
            'manager_user_id': manager_user_id,
            'team_members': team,
            'count': len(team)
        })
    
    @action(detail=False, methods=['get'], url_path='chain/(?P<employee_user_id>[0-9a-f-]+)')
    def get_reporting_chain(self, request, employee_user_id=None):
        from ....services.reporting.chain_service import ReportingChainService
        tenant_id = request.user.tenant_id
        chain_service = ReportingChainService()
        chain_up = chain_service.get_chain_up(UUID(employee_user_id), tenant_id, include_self=True)
        chain_down = chain_service.get_chain_down(UUID(employee_user_id), tenant_id)
        return Response({
            'employee_user_id': employee_user_id,
            'managers': chain_up,
            'subordinates': chain_down,
            'management_level': len(chain_up) - 1 if chain_up else 0,
            'total_subordinates': len(chain_down)
        })
    
    @action(detail=False, methods=['post'], url_path='assign-matrix')
    @transaction.atomic
    def assign_matrix_reporting(self, request):
        employee_user_id = request.data.get('employee_user_id')
        manager_user_id = request.data.get('manager_user_id')
        weight = request.data.get('weight', 0.3)
        relation_type = request.data.get('relation_type', 'dotted')
        if not employee_user_id or not manager_user_id:
            return Response({'error': 'employee_user_id and manager_user_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        from ....models.employment import Employment
        from ....services.reporting.matrix_support import MatrixSupportService
        tenant_id = request.user.tenant_id
        try:
            reporting_line = MatrixSupportService.add_dotted_line_report(
                UUID(employee_user_id),
                UUID(manager_user_id),
                tenant_id,
                weight,
                relation_type=relation_type,
                created_by=request.user.id,
                effective_from=timezone.now().date()
            )
            self._invalidate_cache()
            serializer = ReportingLineSerializer(reporting_line, context={'request': request})
            return Response({
                'message': f'{relation_type} reporting relationship created',
                'reporting_line': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='span-of-control/(?P<manager_user_id>[0-9a-f-]+)')
    def get_span_of_control(self, request, manager_user_id=None):
        from ....services.reporting.span_of_control import SpanOfControlService
        tenant_id = request.user.tenant_id
        span_service = SpanOfControlService()
        span = span_service.get_total_span(UUID(manager_user_id), tenant_id)
        return Response(span)
    
    @action(detail=False, methods=['get'], url_path='organization-span')
    def get_organization_span(self, request):
        from ....services.reporting.span_of_control import SpanOfControlService
        tenant_id = request.user.tenant_id
        span_service = SpanOfControlService()
        report = span_service.get_organization_span_report(tenant_id)
        average = span_service.get_average_span(tenant_id)
        distribution = span_service.get_span_distribution(tenant_id)
        warnings = span_service.identify_managers_with_span_warning(tenant_id)
        return Response({
            'span_report': report,
            'average_metrics': average,
            'distribution': distribution,
            'managers_with_warning': warnings,
            'warning_count': len(warnings)
        })