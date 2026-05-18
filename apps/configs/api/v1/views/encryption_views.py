from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.configs.models import EncryptionKey
from apps.configs.api.v1.serializers import EncryptionKeySerializer, EncryptionKeyRotateSerializer
from apps.configs.api.v1.permissions import IsSuperAdmin
from apps.configs.api.v1.throttles import ConfigReadThrottle, ConfigWriteThrottle
from apps.configs.api.v1.filters import EncryptionKeyFilter
from apps.configs.services.security.rotation_manager import RotationManager
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.constants import AuditAction

class EncryptionKeyViewSet(viewsets.ModelViewSet):
    queryset = EncryptionKey.objects.all()
    serializer_class = EncryptionKeySerializer
    permission_classes = [IsSuperAdmin]
    throttle_classes = [ConfigReadThrottle, ConfigWriteThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = EncryptionKeyFilter
    search_fields = ['key_alias', 'key_id']
    ordering_fields = ['activated_at', 'expires_at', 'usage_count']
    ordering = ['-is_default', '-activated_at']

    @action(detail=False, methods=['post'])
    def rotate(self, request):
        serializer = EncryptionKeyRotateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        manager = RotationManager()
        new_key = manager.rotate_key(
            serializer.validated_data['old_key_id'],
            serializer.validated_data['new_key_alias'],
            serializer.validated_data['key_source'],
            request.user.id
        )
        AuditLogger().log_success(AuditAction.ROTATE_KEY, request.user.id, 'super_admin', details={'old_key': serializer.validated_data['old_key_id'], 'new_key': new_key.key_alias})
        return Response(self.get_serializer(new_key).data)

    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        key = self.get_object()
        manager = RotationManager()
        revoked = manager.revoke_compromised_key(str(key.id), request.user.id)
        AuditLogger().log_success(AuditAction.ROTATE_KEY, request.user.id, 'super_admin', details={'revoked_key': key.key_alias, 'reason': 'compromised'})
        return Response(self.get_serializer(revoked).data)

    @action(detail=False, methods=['get'])
    def default(self, request):
        default_key = EncryptionKey.objects.filter(is_default=True, key_status='active').first()
        if default_key:
            serializer = self.get_serializer(default_key)
            return Response(serializer.data)
        return Response({'error': 'No default active key found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def needs_rotation(self, request):
        manager = RotationManager()
        keys = manager.check_keys_needing_rotation()
        serializer = self.get_serializer(keys, many=True)
        return Response(serializer.data)