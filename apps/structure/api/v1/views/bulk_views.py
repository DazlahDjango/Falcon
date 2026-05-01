from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.utils import timezone
from ..throttles.structure_limits import BulkOperationThrottle, HierarchyWriteThrottle
from ..permissions.structure_permissions import CanPerformBulkOperations
from .base import BaseStructureViewSet


class BulkOperationViewSet(BaseStructureViewSet):
    permission_classes = [CanPerformBulkOperations]
    http_method_names = ['post', 'head', 'options']
    def get_throttles(self):
        self.throttle_classes = [BulkOperationThrottle, HierarchyWriteThrottle]
        return super().get_throttles()
    
    @action(detail=False, methods=['post'], url_path='departments')
    @transaction.atomic
    def bulk_departments(self, request):
        data = request.data.get('departments', [])
        action_type = request.data.get('action', 'create')
        if not data:
            return Response({'error': 'No departments provided'}, status=status.HTTP_400_BAD_REQUEST)
        if len(data) > 100:
            return Response({'error': 'Maximum 100 departments per bulk operation'}, status=status.HTTP_400_BAD_REQUEST)
        from ....models.department import Department
        from ..serializers.department import DepartmentCreateUpdateSerializer
        results = {
            'created': [],
            'updated': [],
            'failed': [],
            'total': len(data)
        }
        for item in data:
            try:
                if action_type == 'create' or not item.get('id'):
                    serializer = DepartmentCreateUpdateSerializer(data=item, context={'request': request})
                    if serializer.is_valid():
                        department = serializer.save()
                        results['created'].append({
                            'id': str(department.id),
                            'code': department.code,
                            'name': department.name
                        })
                    else:
                        results['failed'].append({
                            'data': item,
                            'errors': serializer.errors
                        })
                else:
                    department = Department.objects.filter(
                        id=item.get('id'),
                        tenant_id=request.user.tenant_id,
                        is_deleted=False
                    ).first()
                    if department:
                        serializer = DepartmentCreateUpdateSerializer(department, data=item, partial=True, context={'request': request})
                        if serializer.is_valid():
                            updated = serializer.save()
                            results['updated'].append({
                                'id': str(updated.id),
                                'code': updated.code,
                                'name': updated.name
                            })
                        else:
                            results['failed'].append({
                                'data': item,
                                'errors': serializer.errors
                            })
                    else:
                        results['failed'].append({
                            'data': item,
                            'error': 'Department not found'
                        })
            except Exception as e:
                results['failed'].append({
                    'data': item,
                    'error': str(e)
                })
        self._invalidate_cache()
        return Response({
            'message': f'Processed {len(data)} departments',
            'results': results,
            'created_count': len(results['created']),
            'updated_count': len(results['updated']),
            'failed_count': len(results['failed'])
        })
    
    @action(detail=False, methods=['post'], url_path='employments')
    @transaction.atomic
    def bulk_employments(self, request):
        data = request.data.get('employments', [])
        if not data:
            return Response({'error': 'No employments provided'}, status=status.HTTP_400_BAD_REQUEST)
        if len(data) > 100:
            return Response({'error': 'Maximum 100 employments per bulk operation'}, status=status.HTTP_400_BAD_REQUEST)
        from ....models.employment import Employment
        from ..serializers.employment import EmploymentCreateUpdateSerializer
        results = {
            'created': [],
            'updated': [],
            'failed': [],
            'total': len(data)
        }
        for item in data:
            try:
                if not item.get('id'):
                    serializer = EmploymentCreateUpdateSerializer(data=item, context={'request': request})
                    if serializer.is_valid():
                        employment = serializer.save()
                        results['created'].append({
                            'id': str(employment.id),
                            'user_id': str(employment.user_id)
                        })
                    else:
                        results['failed'].append({
                            'data': item,
                            'errors': serializer.errors
                        })
                else:
                    employment = Employment.objects.filter(
                        id=item.get('id'),
                        tenant_id=request.user.tenant_id,
                        is_deleted=False
                    ).first()
                    if employment:
                        serializer = EmploymentCreateUpdateSerializer(employment, data=item, partial=True, context={'request': request})
                        if serializer.is_valid():
                            updated = serializer.save()
                            results['updated'].append({
                                'id': str(updated.id),
                                'user_id': str(updated.user_id)
                            })
                        else:
                            results['failed'].append({
                                'data': item,
                                'errors': serializer.errors
                            })
                    else:
                        results['failed'].append({
                            'data': item,
                            'error': 'Employment not found'
                        })
            except Exception as e:
                results['failed'].append({
                    'data': item,
                    'error': str(e)
                })
        self._invalidate_cache()
        return Response({
            'message': f'Processed {len(data)} employments',
            'results': results,
            'created_count': len(results['created']),
            'updated_count': len(results['updated']),
            'failed_count': len(results['failed'])
        })
    
    @action(detail=False, methods=['post'], url_path='reporting-lines')
    @transaction.atomic
    def bulk_reporting_lines(self, request):
        data = request.data.get('reporting_lines', [])
        if not data:
            return Response({'error': 'No reporting lines provided'}, status=status.HTTP_400_BAD_REQUEST)
        if len(data) > 100:
            return Response({'error': 'Maximum 100 reporting lines per bulk operation'}, status=status.HTTP_400_BAD_REQUEST)
        from ....models.reporting_line import ReportingLine
        from ..serializers.reporting import ReportingLineCreateUpdateSerializer
        results = {
            'created': [],
            'updated': [],
            'failed': [],
            'total': len(data)
        }
        for item in data:
            try:
                if not item.get('id'):
                    serializer = ReportingLineCreateUpdateSerializer(data=item, context={'request': request})
                    if serializer.is_valid():
                        reporting_line = serializer.save()
                        results['created'].append({
                            'id': str(reporting_line.id),
                            'employee_id': str(reporting_line.employee_id),
                            'manager_id': str(reporting_line.manager_id)
                        })
                    else:
                        results['failed'].append({
                            'data': item,
                            'errors': serializer.errors
                        })
                else:
                    reporting_line = ReportingLine.objects.filter(
                        id=item.get('id'),
                        tenant_id=request.user.tenant_id,
                        is_deleted=False
                    ).first()
                    if reporting_line:
                        serializer = ReportingLineCreateUpdateSerializer(reporting_line, data=item, partial=True, context={'request': request})
                        if serializer.is_valid():
                            updated = serializer.save()
                            results['updated'].append({
                                'id': str(updated.id)
                            })
                        else:
                            results['failed'].append({
                                'data': item,
                                'errors': serializer.errors
                            })
                    else:
                        results['failed'].append({
                            'data': item,
                            'error': 'Reporting line not found'
                        })
            except Exception as e:
                results['failed'].append({
                    'data': item,
                    'error': str(e)
                })
        self._invalidate_cache()
        return Response({
            'message': f'Processed {len(data)} reporting lines',
            'results': results,
            'created_count': len(results['created']),
            'updated_count': len(results['updated']),
            'failed_count': len(results['failed'])
        })
    
    @action(detail=False, methods=['post'], url_path='reassign-manager')
    @transaction.atomic
    def reassign_manager(self, request):
        employee_ids = request.data.get('employee_ids', [])
        new_manager_id = request.data.get('new_manager_id')
        effective_date = request.data.get('effective_date', timezone.now().date())
        if not employee_ids or not new_manager_id:
            return Response({'error': 'employee_ids and new_manager_id are required'}, status=status.HTTP_400_BAD_REQUEST)
        from ....models.employment import Employment
        from ....models.reporting_line import ReportingLine
        tenant_id = request.user.tenant_id
        manager_employment = Employment.objects.filter(
            user_id=new_manager_id,
            tenant_id=tenant_id,
            is_current=True,
            is_deleted=False,
            is_active=True
        ).first()
        if not manager_employment:
            return Response({'error': 'New manager not found'}, status=status.HTTP_404_NOT_FOUND)
        results = {
            'updated': [],
            'failed': [],
            'total': len(employee_ids)
        }
        for employee_id in employee_ids:
            try:
                employee_employment = Employment.objects.filter(
                    user_id=employee_id,
                    tenant_id=tenant_id,
                    is_current=True,
                    is_deleted=False,
                    is_active=True
                ).first()
                if not employee_employment:
                    results['failed'].append({
                        'employee_id': employee_id,
                        'error': 'Employee employment not found'
                    })
                    continue
                ReportingLine.objects.filter(
                    employee_id=employee_employment.id,
                    relation_type='solid',
                    is_active=True,
                    tenant_id=tenant_id
                ).update(
                    is_active=False,
                    effective_to=effective_date,
                    change_reason=f"Bulk reassigned to {new_manager_id} on {effective_date}"
                )
                ReportingLine.objects.create(
                    tenant_id=tenant_id,
                    employee_id=employee_employment.id,
                    manager_id=manager_employment.id,
                    relation_type='solid',
                    reporting_weight=1.0,
                    effective_from=effective_date,
                    is_active=True,
                    created_by=request.user.id
                )
                results['updated'].append(employee_id)
            except Exception as e:
                results['failed'].append({
                    'employee_id': employee_id,
                    'error': str(e)
                })
        self._invalidate_cache()
        return Response({
            'message': f'Reassigned {len(results["updated"])} employees',
            'results': results,
            'updated_count': len(results['updated']),
            'failed_count': len(results['failed'])
        })