from rest_framework import status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction, models
from django.utils import timezone
from ....models import Employment
from ..serializers.employment import EmploymentSerializer, EmploymentDetailSerializer, EmploymentCreateUpdateSerializer, EmploymentBulkSerializer
from ..filters.employment_filter import EmploymentFilter, EmploymentCurrentFilter
from ..throttles.structure_limits import EmploymentRateThrottle, HierarchyReadThrottle, HierarchyWriteThrottle
from ..permissions.structure_permissions import CanViewEmployment, CanEditEmployment, CanDeleteEmployment
from .base import BaseStructureViewSet

class EmploymentViewSet(BaseStructureViewSet):
    queryset = Employment.objects.select_related('position', 'department', 'team').all()
    filterset_class = EmploymentFilter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user_id', 'change_reason']
    ordering_fields = ['effective_from', 'effective_to', 'created_at']
    ordering = ['-effective_from']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EmploymentDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EmploymentCreateUpdateSerializer
        elif self.action == 'bulk_create':
            return EmploymentBulkSerializer
        return EmploymentSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'bulk_create']:
            self.permission_classes = [CanEditEmployment]
        elif self.action == 'destroy':
            self.permission_classes = [CanDeleteEmployment]
        else:
            self.permission_classes = [CanViewEmployment]
        return super().get_permissions()
    
    def get_throttles(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'bulk_create']:
            self.throttle_classes = [EmploymentRateThrottle, HierarchyWriteThrottle]
        else:
            self.throttle_classes = [HierarchyReadThrottle]
        return super().get_throttles()
    
    @action(detail=False, methods=['get'], url_path='current')
    def get_current_employments(self, request):
        tenant_id = request.user.tenant_id
        employments = Employment.objects.filter(
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).select_related('position', 'department', 'team')
        # Apply additional filters
        department_id = request.query_params.get('department_id')
        if department_id:
            employments = employments.filter(department_id=department_id)
        team_id = request.query_params.get('team_id')
        if team_id:
            employments = employments.filter(team_id=team_id)
        is_manager = request.query_params.get('is_manager')
        if is_manager is not None:
            employments = employments.filter(is_manager=is_manager.lower() == 'true')
        serializer = EmploymentSerializer(employments, many=True, context={'request': request})
        return Response({
            'employments': serializer.data,
            'count': employments.count()
        })
    
    @action(detail=False, methods=['get'], url_path='by-user/(?P<user_id>[0-9a-f-]+)')
    def get_by_user(self, request, user_id=None):
        tenant_id = request.user.tenant_id
        employments = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_deleted=False
        ).select_related('position', 'department', 'team').order_by('-effective_from')
        serializer = EmploymentDetailSerializer(employments, many=True, context={'request': request})
        current = employments.filter(is_current=True).first()
        return Response({
            'user_id': user_id,
            'employment_history': serializer.data,
            'history_count': employments.count(),
            'current_employment': EmploymentDetailSerializer(current, context={'request': request}).data if current else None
        })
    
    @action(detail=False, methods=['post'], url_path='transfer')
    @transaction.atomic
    def transfer_employee(self, request):
        user_id = request.data.get('user_id')
        new_department_id = request.data.get('department_id')
        new_team_id = request.data.get('team_id')
        effective_date = request.data.get('effective_date', timezone.now().date())
        reason = request.data.get('reason', '')
        if not user_id or not new_department_id:
            return Response({'error': 'user_id and department_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        tenant_id = request.user.tenant_id
        current_employment = Employment.objects.filter(
            user_id=user_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not current_employment:
            return Response({'error': 'No current employment found for user'}, status=status.HTTP_404_NOT_FOUND)
        from ....models.department import Department
        new_department = Department.objects.filter(id=new_department_id, tenant_id=tenant_id, is_deleted=False).first()
        if not new_department:
            return Response({'error': 'New department not found'}, status=status.HTTP_404_NOT_FOUND)
        # End current employment
        current_employment.is_current = False
        current_employment.effective_to = effective_date
        current_employment.change_reason = f"Transferred to {new_department.name}: {reason}"
        current_employment.save()
        # Create new employment
        new_employment = Employment.objects.create(
            tenant_id=tenant_id,
            user_id=user_id,
            position_id=current_employment.position_id,
            department_id=new_department_id,
            team_id=new_team_id,
            employment_type=current_employment.employment_type,
            effective_from=effective_date,
            is_current=True,
            is_active=True,
            is_manager=current_employment.is_manager,
            is_executive=current_employment.is_executive,
            is_board_member=current_employment.is_board_member,
            change_reason=f"Transferred from {current_employment.department.name}: {reason}",
            created_by=request.user.id
        )
        self._invalidate_cache()
        return Response({
            'message': 'Employee transferred successfully',
            'old_employment_id': str(current_employment.id),
            'new_employment_id': str(new_employment.id),
            'user_id': user_id,
            'from_department': current_employment.department.name,
            'to_department': new_department.name,
            'effective_date': effective_date
        })
    
    @action(detail=False, methods=['post'], url_path='bulk-create')
    @transaction.atomic
    def bulk_create(self, request):
        serializer = EmploymentBulkSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        employments_data = serializer.validated_data.get('employments', [])
        created_employments = []
        errors = []
        for emp_data in employments_data:
            try:
                emp_serializer = EmploymentCreateUpdateSerializer(data=emp_data, context={'request': request})
                if emp_serializer.is_valid():
                    employment = emp_serializer.save()
                    created_employments.append({
                        'id': str(employment.id),
                        'user_id': str(employment.user_id)
                    })
                else:
                    errors.append({
                        'data': emp_data,
                        'errors': emp_serializer.errors
                    })
            except Exception as e:
                errors.append({
                    'data': emp_data,
                    'error': str(e)
                })
        self._invalidate_cache()
        return Response({
            'message': f'Created {len(created_employments)} employments',
            'created': created_employments,
            'errors': errors,
            'total_processed': len(employments_data),
            'success_count': len(created_employments),
            'error_count': len(errors)
        })
    
    @action(detail=False, methods=['get'], url_path='stats')
    def get_stats(self, request):
        tenant_id = request.user.tenant_id
        total_current = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True).count()
        managers = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True, is_manager=True).count()
        executives = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True, is_executive=True).count()
        employment_type_distribution = {}
        types = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True).values('employment_type').annotate(count=models.Count('id'))
        for emp_type in types:
            employment_type_distribution[emp_type['employment_type']] = emp_type['count']
        department_distribution = {}
        depts = Employment.objects.filter(tenant_id=tenant_id, is_current=True, is_deleted=False, is_active=True).values('department__code').annotate(count=models.Count('id'))
        for dept in depts:
            department_distribution[dept['department__code']] = dept['count']
        return Response({
            'total_current_employments': total_current,
            'manager_count': managers,
            'executive_count': executives,
            'management_percentage': round((managers / total_current * 100), 2) if total_current > 0 else 0,
            'employment_type_distribution': employment_type_distribution,
            'department_distribution': department_distribution
        })