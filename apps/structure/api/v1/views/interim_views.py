from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone
from uuid import UUID
from apps.structure.models.interim_assignment import InterimAssignment
from apps.structure.api.v1.serializers.interim_assignment import InterimAssignmentSerializer, InterimAssignmentDetailSerializer
from apps.structure.api.v1.throttles.structure_limits import ReportingRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from apps.structure.api.v1.permissions.org_permissions import IsTenantMember, CanManageReporting, CanViewOrgChart
from .base import BaseStructureViewSet


class InterimAssignmentViewSet(BaseStructureViewSet):
    queryset = InterimAssignment.objects.select_related('employee', 'employee__position', 'interim_manager', 'interim_manager__position').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['reason', 'notes']
    ordering_fields = ['effective_from', 'effective_to', 'created_at']
    ordering = ['-effective_from']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return InterimAssignmentDetailSerializer
        return InterimAssignmentSerializer
    
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
            return Response({'error': 'Employee not found'}, status=status.HTTP_404_NOT_FOUND)
        assignments = InterimAssignment.objects.filter(
            employee_id=employment.id,
            tenant_id=tenant_id,
            is_deleted=False
        ).order_by('-effective_from')
        serializer = InterimAssignmentSerializer(assignments, many=True, context={'request': request})
        current = assignments.filter(is_active=True).first()
        return Response({
            'employee_user_id': employee_user_id,
            'assignments': serializer.data,
            'count': assignments.count(),
            'current_assignment': InterimAssignmentSerializer(current, context={'request': request}).data if current else None
        })
    
    @action(detail=False, methods=['post'], url_path='assign')
    @transaction.atomic
    def assign_interim(self, request):
        employee_user_id = request.data.get('employee_user_id')
        interim_manager_user_id = request.data.get('interim_manager_user_id')
        effective_from = request.data.get('effective_from')
        effective_to = request.data.get('effective_to')
        reason = request.data.get('reason', '')
        
        if not employee_user_id or not interim_manager_user_id or not effective_from or not effective_to:
            return Response({'error': 'employee_user_id, interim_manager_user_id, effective_from, and effective_to are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.structure.services.reporting.interim_manager import InterimManagerService
        from apps.structure.models.employment import Employment
        from datetime import date
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
        
        interim_emp = Employment.objects.filter(
            user_id=interim_manager_user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not interim_emp:
            return Response({'error': 'Interim manager not found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            if isinstance(effective_from, str):
                effective_from = date.fromisoformat(effective_from)
            if isinstance(effective_to, str):
                effective_to = date.fromisoformat(effective_to)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
        
        service = InterimManagerService()
        try:
            assignment = service.assign_interim_manager(
                employee_emp.id,
                interim_emp.id,
                effective_from,
                effective_to,
                reason,
                request.user.id
            )
            serializer = InterimAssignmentSerializer(assignment, context={'request': request})
            return Response({
                'message': 'Interim manager assigned successfully',
                'assignment': serializer.data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], url_path='end')
    @transaction.atomic
    def end_interim(self, request):
        employee_user_id = request.data.get('employee_user_id')
        if not employee_user_id:
            return Response({'error': 'employee_user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        from apps.structure.services.reporting.interim_manager import InterimManagerService
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
        
        service = InterimManagerService()
        try:
            assignment = service.end_interim_assignment(employee_emp.id)
            return Response({
                'message': 'Interim assignment ended successfully',
                'employee_user_id': employee_user_id
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='expiring-soon')
    def get_expiring_soon(self, request):
        tenant_id = request.user.tenant_id
        days = int(request.query_params.get('days', 7))
        from apps.structure.services.reporting.interim_manager import InterimManagerService
        service = InterimManagerService()
        assignments = service.get_expiring_soon(tenant_id, days)
        serializer = InterimAssignmentSerializer(assignments, many=True, context={'request': request})
        return Response({
            'expiring_soon': serializer.data,
            'count': len(assignments),
            'days_threshold': days
        })
    
    @action(detail=False, methods=['get'], url_path='active')
    def get_active_interims(self, request):
        tenant_id = request.user.tenant_id
        from apps.structure.services.reporting.interim_manager import InterimManagerService
        service = InterimManagerService()
        assignments = service.get_active_interim_managers(tenant_id)
        serializer = InterimAssignmentSerializer(assignments, many=True, context={'request': request})
        return Response({
            'active_assignments': serializer.data,
            'count': len(assignments)
        })