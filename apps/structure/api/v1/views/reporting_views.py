from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from uuid import UUID
from apps.structure.models.reporting_line import ReportingLine
from apps.structure.api.v1.serializers.reporting_line import ReportingLineSerializer, ReportingLineDetailSerializer, ReportingLineCreateUpdateSerializer
from apps.structure.api.v1.filters.reporting_filter import ReportingLineFilter
from apps.structure.api.v1.throttles.structure_limits import ReportingRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanManageReporting, CanViewOrgChart
from .base import BaseStructureViewSet


class ReportingLineViewSet(BaseStructureViewSet):
    queryset = ReportingLine.objects.select_related('employee', 'employee__position', 'manager', 'manager__position').all()
    filterset_class = ReportingLineFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['change_reason']
    ordering_fields = ['effective_from', 'effective_to', 'created_at']
    ordering = ['-effective_from']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ReportingLineDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ReportingLineCreateUpdateSerializer
        return ReportingLineSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsTenantMember, CanManageReporting]
        else:
            self.permission_classes = [IsTenantMember, CanViewOrgChart]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.throttle_classes = [ReportingRateThrottle, HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=False, methods=['get'], url_path='by-employee/(?P<employee_user_id>[0-9a-f-]+)')
    def get_by_employee(self, request, employee_user_id=None):
        from apps.structure.models.employment import Employment
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
        from apps.structure.models.employment import Employment
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
    
    @action(detail=False, methods=['get'], url_path='chain/(?P<employee_user_id>[0-9a-f-]+)')
    def get_reporting_chain(self, request, employee_user_id=None):
        from apps.structure.services.reporting.chain_service import ChainService
        tenant_id = request.user.tenant_id
        chain_service = ChainService()
        try:
            chain_up = chain_service.get_chain_of_command(UUID(employee_user_id), tenant_id)
            return Response({
                'employee_user_id': employee_user_id,
                'managers': chain_up,
                'management_level': len(chain_up)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='span-of-control/(?P<manager_user_id>[0-9a-f-]+)')
    def get_span_of_control(self, request, manager_user_id=None):
        from apps.structure.services.reporting.span_of_control import SpanOfControl
        tenant_id = request.user.tenant_id
        span_service = SpanOfControl()
        try:
            span = span_service.calculate_span(UUID(manager_user_id))
            return Response(span)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='organization-span')
    def get_organization_span(self, request):
        from apps.structure.services.reporting.span_of_control import SpanOfControl
        tenant_id = request.user.tenant_id
        span_service = SpanOfControl()
        report = span_service.get_span_by_level(tenant_id, None)
        average = span_service.get_average_span(tenant_id)
        distribution = span_service.get_span_distribution(tenant_id)
        warnings = span_service.identify_overloaded_managers(tenant_id)
        return Response({
            'span_report': report,
            'average_metrics': average,
            'distribution': distribution,
            'managers_with_warning': warnings,
            'warning_count': len(warnings)
        })
    
    @action(detail=False, methods=['post'], url_path='assign-manager')
    @transaction.atomic
    def assign_manager(self, request):
        employee_user_id = request.data.get('employee_user_id')
        manager_user_id = request.data.get('manager_user_id')
        effective_date = request.data.get('effective_date', timezone.now().date())
        
        if not employee_user_id or not manager_user_id:
            return Response({'error': 'employee_user_id and manager_user_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.structure.services.reporting.chain_service import ChainService
        from apps.structure.models.employment import Employment
        tenant_id = request.user.tenant_id
        
        employee_emp = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employee_emp:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        
        manager_emp = Employment.objects.filter(
            user_id=manager_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not manager_emp:
            return Response({'error': 'Manager not found'}, status=status.HTTP_404_NOT_FOUND)
        
        chain_service = ChainService()
        try:
            reporting_line = chain_service.assign_manager(
                employee_emp.id,
                manager_emp.id,
                effective_date,
                request.user.id
            )
            serializer = ReportingLineSerializer(reporting_line, context={'request': request})
            return Response({
                'message': 'Manager assigned successfully',
                'reporting_line': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='remove-manager')
    @transaction.atomic
    def remove_manager(self, request):
        employee_user_id = request.data.get('employee_user_id')
        if not employee_user_id:
            return Response({'error': 'employee_user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.structure.services.reporting.chain_service import ChainService
        from apps.structure.models.employment import Employment
        tenant_id = request.user.tenant_id
        
        employee_emp = Employment.objects.filter(
            user_id=employee_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not employee_emp:
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        
        chain_service = ChainService()
        try:
            chain_service.remove_manager(employee_emp.id)
            return Response({
                'message': 'Manager removed successfully',
                'employee_user_id': employee_user_id
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)