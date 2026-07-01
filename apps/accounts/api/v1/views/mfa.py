from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count
from apps.accounts.models import MFADevice, MFAAuditLog 
from apps.accounts.services import MFAService
from ..serializers.mfa import (
    MFADeviceSerializer, 
    MFADeviceListSerializer, 
    MFADeviceDetailSerializer,
    MFADeviceCreateSerializer,
    MFADeviceUpdateSerializer,
    MFAAuditLogSerializer,
    MFAAuditLogDetailSerializer,
    MFABackupCodeVerifySerializer,
    MFABackupCodeGenerateSerializer,
    MFABackupListSerializer,
    MFAVerifyOTPSerializer,
    MFADisableSerializer,
    MFASetPrimarySerializer,
    MFASetupTOTPSerializer,
    MFAVerifySetupSerializer,
    MFAMFAStatusSerializer,
    MFASuccessSerializer,
    MFAErrorSerializer
)
from ..filters import MFADeviceFilter
from ..permissions import IsOwner, IsSuperAdmin
from .base import BaseModelViewset, BaseReadOnlyViewset

# ✅ FIXED: Use absolute import instead of relative
from apps.accounts.services.realtime import AccountsEventBroadcaster


class MFADeviceViewSet(BaseModelViewset):
    queryset = MFADevice.objects.all()
    filterset_class = MFADeviceFilter
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['created_at', 'last_used_at', 'name']
    ordering = ['-created_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.mfa_service = MFAService()
    
    def get_serializer_class(self):
        action_serializers = {
            'list': MFADeviceListSerializer,
            'retrieve': MFADeviceDetailSerializer,
            'create': MFADeviceCreateSerializer,
            'update': MFADeviceUpdateSerializer,
            'partial_update': MFADeviceUpdateSerializer,
            'verify_device': MFAVerifyOTPSerializer,
            'verify_backup_code': MFABackupCodeVerifySerializer,
            'setup_totp': MFASetupTOTPSerializer,
            'verify_totp_setup': MFAVerifySetupSerializer,
            'disable_mfa': MFADisableSerializer,
            'set_primary': MFASetPrimarySerializer,
            'generate_backup_codes': MFABackupCodeGenerateSerializer,
        }
        
        if self.action in action_serializers:
            return action_serializers[self.action]
        return MFADeviceSerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.select_related('user').filter(is_deleted=False)
        
        if not self.request.user.is_superuser:
            qs = qs.filter(user=self.request.user)
        
        return qs
    
    def get_permissions(self):
        admin_actions = ['destroy', 'update', 'partial_update', 'set_primary']
        if self.action in admin_actions:
            self.permission_classes = [IsAuthenticated, IsOwner]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()

    @action(detail=False, methods=['post'], url_path='setup-totp')
    def setup_totp(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            result = self.mfa_service.setup_totp(
                user=request.user,
                device_name=serializer.validated_data['device_name'],
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            return Response({
                'message': 'TOTP setup initiated. Verify with OTP to complete.',
                'data': result
            }, status=status.HTTP_201_CREATED)
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Setup failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='verify-totp-setup')
    def verify_totp_setup(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        success, device, message = self.mfa_service.verify_otp(
            user=request.user,
            otp=serializer.validated_data['otp'],
            device_id=serializer.validated_data['device_id'],
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        if not success:
            return Response({
                'error': message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': 'TOTP device verified successfully',
            'data': {
                'device_id': str(device.id) if device else None,
                'is_verified': True
            }
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='verify')
    def verify_device(self, request, pk=None):
        device = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if device.is_locked():
            return Response({
                'error': f'Device "{device.name}" is locked due to too many failed attempts. Try again later.',
                'locked_until': device.locked_until
            }, status=status.HTTP_423_LOCKED)
        
        success, verified_device, message = self.mfa_service.verify_otp(
            user=request.user,
            otp=serializer.validated_data['otp'],
            device_id=str(device.id),
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        if not success:
            return Response({
                'error': message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ✅ FIXED: Import is now at top
        AccountsEventBroadcaster.mfa_enabled(
            user_id=str(request.user.id),
            tenant_id=str(request.user.tenant_id),
            device_id=str(device.id),
        )
        
        return Response({
            'message': message,
            'data': {
                'device_id': str(device.id),
                'device_name': device.name,
                'is_verified': device.is_verified
            }
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='verify-backup')
    def verify_backup_code(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        success, device, message = self.mfa_service.verify_otp(
            user=request.user,
            otp=serializer.validated_data['code'],
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        if not success:
            return Response({
                'error': message
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': 'Backup code verified successfully',
            'data': {
                'method': 'backup_code'
            }
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='generate-backup-codes')
    def generate_backup_codes(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        count = serializer.validated_data.get('count', 10)
        try:
            raw_codes, num_codes = self.mfa_service.regenerate_backup_codes(
                user=request.user,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            if count != 10:
                raw_codes = raw_codes[:count]
            response_serializer = MFABackupListSerializer({
                'codes': raw_codes,
                'remaining': len(raw_codes)
            })
            
            return Response({
                'message': f'{len(raw_codes)} backup codes generated successfully',
                'data': response_serializer.data
            }, status=status.HTTP_200_OK)
            
        except ValueError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='backup-codes-status')
    def backup_codes_status(self, request):
        from apps.accounts.models.mfa import MFABackupCode
        remaining = self.mfa_service.get_backup_codes_remaining(request.user)
        return Response({
            'remaining': remaining,
            'total_generated': remaining + MFABackupCode.objects.filter(
                user=request.user, is_used=True
            ).count(),
            'has_codes': remaining > 0
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='set-primary')
    def set_primary(self, request, pk=None):
        device = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        success = self.mfa_service.set_primary_device(
            request.user, 
            str(device.id)
        )
        
        if not success:
            return Response({
                'error': 'Failed to set primary device. Ensure device is active and verified.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'message': f'Device "{device.name}" set as primary successfully'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='disable')
    def disable_mfa(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        device_id = serializer.validated_data.get('device_id')
        
        success = self.mfa_service.disable_mfa(
            user=request.user,
            device_id=device_id,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        if not success:
            return Response({
                'error': 'Failed to disable MFA. Device may not exist.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        message = 'MFA disabled for specific device' if device_id else 'All MFA devices disabled'
        
        return Response({
            'message': message
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='status')
    def mfa_status(self, request):
        status_data = self.mfa_service.get_mfa_status(request.user)
        status_data.setdefault('requires_mfa', False)
        status_data['totp'] = {
            'enabled': any(d['device_type'] == 'totp' and d['is_verified'] for d in status_data.get('devices', [])),
            'configured': any(d['device_type'] == 'totp' for d in status_data.get('devices', [])),
            'verified': any(d['device_type'] == 'totp' and d['is_verified'] for d in status_data.get('devices', [])),
            'primary': any(d['device_type'] == 'totp' and d['is_primary'] for d in status_data.get('devices', [])),
            'last_used': next((d['last_used_at'] for d in status_data.get('devices', []) if d['device_type'] == 'totp'), None)
        }
        
        status_data['backup_codes'] = {
            'enabled': status_data['backup_codes_remaining'] > 0,
            'configured': status_data['backup_codes_remaining'] > 0,
            'verified': True,
            'primary': False,
            'last_used': None
        }
        status_data.pop('devices', None)
        serializer = MFAMFAStatusSerializer(status_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='activity')
    def recent_activity(self, request):
        hours = request.query_params.get('hours', 24)
        try:
            hours = int(hours)
            hours = min(max(hours, 1), 168)
        except ValueError:
            hours = 24
        
        activity = self.mfa_service.get_recent_activity(request.user, hours)
        
        return Response({
            'activity': activity,
            'count': len(activity),
            'period_hours': hours
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='failure-rate')
    def failure_rate(self, request):
        hours = request.query_params.get('hours', 24)
        try:
            hours = int(hours)
        except ValueError:
            hours = 24
        
        rate = self.mfa_service.get_failure_rate(request.user, hours)
        
        return Response({
            'failure_rate': round(rate * 100, 2),
            'period_hours': hours,
            'status': 'good' if rate < 0.1 else 'warning' if rate < 0.3 else 'critical'
        }, status=status.HTTP_200_OK)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if serializer.validated_data.get('device_type') == 'totp':
            return Response({
                'error': 'Use /setup-totp endpoint to create TOTP devices'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        device_data = serializer.validated_data
        device = MFADevice(
            user=request.user,
            tenant_id=request.user.tenant_id,
            **device_data
        )
        
        has_active_devices = MFADevice.objects.filter(
            user=request.user, 
            is_active=True, 
            is_deleted=False
        ).exists()
        device.is_primary = not has_active_devices
        
        device.save()
        
        # ✅ FIXED: Use MFAAuditLog.objects.create directly
        MFAAuditLog.objects.create(
            user=request.user,
            device=device,
            event_type='enroll',
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:2000],
            success=True,
            message=f'{device.get_device_type_display()} device created',
            tenant_id=request.user.tenant_id
        )
        
        response_serializer = MFADeviceDetailSerializer(device)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def destroy(self, request, *args, **kwargs):
        device = self.get_object()
        device.is_deleted = True
        device.is_active = False
        device.deleted_at = timezone.now()
        device.save(update_fields=['is_deleted', 'is_active', 'deleted_at'])
        
        if device.is_primary:
            other_device = MFADevice.objects.filter(
                user=request.user, 
                is_active=True, 
                is_deleted=False
            ).exclude(id=device.id).first()
            
            if other_device:
                other_device.is_primary = True
                other_device.save(update_fields=['is_primary'])
        
        # ✅ FIXED: Use MFAAuditLog.objects.create directly
        MFAAuditLog.objects.create(
            user=request.user,
            device=device,
            event_type='disable',
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:2000],
            success=True,
            message=f'Device "{device.name}" deleted',
            tenant_id=request.user.tenant_id
        )
        
        return Response({
            'message': f'Device "{device.name}" deleted successfully'
        }, status=status.HTTP_200_OK)


class MFAAuditLogViewSet(BaseReadOnlyViewset):
    queryset = MFAAuditLog.objects.all()
    serializer_class = MFAAuditLogSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['event_type', 'success', 'device__device_type']
    search_fields = ['ip_address', 'message', 'user_agent']
    ordering_fields = ['created_at', 'event_type']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return MFAAuditLogDetailSerializer
        return MFAAuditLogSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.select_related('user', 'device').filter(is_deleted=False)
        
        if not self.request.user.is_superuser:
            qs = qs.filter(user=self.request.user)
        
        return qs
    
    def get_permissions(self):
        self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        queryset = self.get_queryset()
        today = timezone.now().date()
        this_week = today - timezone.timedelta(days=7)
        this_month = today - timezone.timedelta(days=30)
        
        summary = {
            'total_events': queryset.count(),
            'success_rate': {
                'today': self._calculate_success_rate(queryset.filter(created_at__date=today)),
                'this_week': self._calculate_success_rate(queryset.filter(created_at__date__gte=this_week)),
                'this_month': self._calculate_success_rate(queryset.filter(created_at__date__gte=this_month)),
                'overall': self._calculate_success_rate(queryset),
            },
            'events_by_type': dict(
                queryset.values('event_type').annotate(count=Count('id'))
                .values_list('event_type', 'count')
            ),
            'top_ips': list(
                queryset.values('ip_address')
                .annotate(count=Count('id'))
                .order_by('-count')[:5]
            ),
        }
        
        return Response(summary, status=status.HTTP_200_OK)
    
    def _calculate_success_rate(self, queryset):
        total = queryset.count()
        if total == 0:
            return 0
        successes = queryset.filter(success=True).count()
        return round((successes / total) * 100, 2)