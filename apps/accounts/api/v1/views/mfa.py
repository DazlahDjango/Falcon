from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.models import MFADevice, MFAAuditLog
from apps.accounts.services.auth.mfa import MFAService
from apps.accounts.api.v1.serializers import (
    MFADeviceSerializer, MFADeviceListSerializer, MFADeviceDetailSerializer,
    MFAAuditLogSerializer
)
from apps.accounts.api.v1.filters import MFADeviceFilter
from apps.accounts.api.v1.permissions import IsOwner, IsSuperAdmin
from .base import BaseModelViewset, BaseReadOnlyViewset

class MFADeviceViewSet(BaseModelViewset):
    queryset = MFADevice.objects.all()
    filterset_class = MFADeviceFilter
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['created_at', 'last_used_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return MFADeviceListSerializer
        elif self.action == 'retrieve':
            return MFADeviceDetailSerializer
        return MFADeviceSerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_superuser:
            qs = qs.filter(user=self.request.user)
        return qs
    
    def get_permissions(self):
        if self.action in ['destroy', 'update', 'partial_update']:
            self.permission_classes = [IsAuthenticated, IsOwner]
        elif self.action == 'set_primary':
            self.permission_classes = [IsAuthenticated, IsOwner]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'], url_path='set-primary') 
    def set_primary(self,request, pk=None):
        device = self.get_object()
        mfa_service = MFAService()
        success = mfa_service.set_primary_device(request.user, str(device.id))
        if not success:
            return Response({'error': 'Failed to set primary device'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Primary device updated successfully'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='verify')
    def verify_device(self, request, pk=None):
        device = self.get_object()
        otp = request.data.get('otp')
        if not otp:
            return Response({'error': 'OTP code is required'}, status=status.HTTP_400_BAD_REQUEST)
        mfa_service = MFAService()
        is_valid, _ = mfa_service.verify_otp(request.user, otp, str(device.id))
        if not is_valid:
            return Response({'error': 'Invalid OTP code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Device verified successfully'}, status=status.HTTP_200_OK)
    
class MFAAuditLogViewSet(BaseReadOnlyViewset):
    queryset = MFAAuditLog.objects.all()
    serializer_class = MFAAuditLogSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['event_type', 'success']
    search_fields = ['ip_address', 'message']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_superuser:
            qs = qs.filter(user=self.request.user)
        return qs
    
    def get_permissions(self):
        self.permission_classes = [IsAuthenticated]
        return super().get_permissions()