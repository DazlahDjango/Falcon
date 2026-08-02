# bulk.py
import os
import uuid
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from ..serializers import (
    BulkKPIUploadSerializer, BulkActualUploadSerializer,
    BulkTargetUploadSerializer
)
from ..throttles import BulkUploadThrottle
from ..permissions import IsAuthenticatedAndActive, IsDashboardChampion
from apps.kpi.tasks import process_bulk_upload_task

def save_uploaded_file(uploaded_file) -> str:
    temp_dir = os.path.join(settings.BASE_DIR, 'tmp', 'uploads')
    os.makedirs(temp_dir, exist_ok=True)
    
    ext = os.path.splitext(uploaded_file.name)[1]
    filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(temp_dir, filename)
    
    with open(file_path, 'wb+') as destination:
        for chunk in uploaded_file.chunks():
            destination.write(chunk)
            
    return file_path


class BulkKPIUploadView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsDashboardChampion]
    throttle_classes = [BulkUploadThrottle]

    def post(self, request):
        serializer = BulkKPIUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        dry_run = serializer.validated_data.get('dry_run', False)
        
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)

        # Save file to temporary workspace path
        file_path = save_uploaded_file(file)

        # Trigger background Celery worker
        task = process_bulk_upload_task.delay(
            file_path=file_path,
            tenant_id=str(tenant_id),
            user_id=str(request.user.id),
            import_type='kpi',
            extra_params={'dry_run': dry_run}
        )

        return Response({
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'KPI file upload accepted. Import is processing in the background.'
        }, status=status.HTTP_202_ACCEPTED)


class BulkActualUploadView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsDashboardChampion]
    throttle_classes = [BulkUploadThrottle]

    def post(self, request):
        serializer = BulkActualUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        year = serializer.validated_data['year']
        month = serializer.validated_data['month']
        dry_run = serializer.validated_data.get('dry_run', False)
        
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)

        # Save file to temporary workspace path
        file_path = save_uploaded_file(file)

        # Trigger background Celery worker
        task = process_bulk_upload_task.delay(
            file_path=file_path,
            tenant_id=str(tenant_id),
            user_id=str(request.user.id),
            import_type='actual',
            extra_params={'dry_run': dry_run, 'year': year, 'month': month}
        )

        return Response({
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'Actuals file upload accepted. Import is processing in the background.'
        }, status=status.HTTP_202_ACCEPTED)


class BulkTargetUploadView(APIView):
    permission_classes = [IsAuthenticatedAndActive, IsDashboardChampion]
    throttle_classes = [BulkUploadThrottle]

    def post(self, request):
        serializer = BulkTargetUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        file = serializer.validated_data['file']
        year = serializer.validated_data['year']
        dry_run = serializer.validated_data.get('dry_run', False)
        
        tenant_id = getattr(request, 'current_tenant_id', None)
        if not tenant_id and hasattr(request.user, 'tenant_id'):
            tenant_id = str(request.user.tenant_id)

        # Save file to temporary workspace path
        file_path = save_uploaded_file(file)

        # Trigger background Celery worker
        task = process_bulk_upload_task.delay(
            file_path=file_path,
            tenant_id=str(tenant_id),
            user_id=str(request.user.id),
            import_type='target',
            extra_params={'dry_run': dry_run, 'year': year}
        )

        return Response({
            'task_id': task.id,
            'status': 'PENDING',
            'message': 'Targets file upload accepted. Import is processing in the background.'
        }, status=status.HTTP_202_ACCEPTED)