from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.configs.models import ConfigSystemSettings
from apps.configs.api.v1.serializers.system_settings import ConfigSystemSettingsSerializer
from apps.configs.api.v1.permissions import IsSuperAdminOrReadOnly, IsSuperAdmin
from apps.configs.api.v1.throttles import ConfigReadThrottle, ConfigWriteThrottle
from apps.configs.services.settings import ConfigSettingsService
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.constants import AuditAction


class ConfigSystemSettingsView(APIView):
    """
    Singleton system settings — GET (config access), PATCH/POST reset (super admin).
    """
    permission_classes = [IsSuperAdminOrReadOnly]
    throttle_classes = [ConfigReadThrottle, ConfigWriteThrottle]

    def get_object(self):
        return ConfigSettingsService.get_record()

    def get(self, request):
        record = self.get_object()
        serializer = ConfigSystemSettingsSerializer(record)
        return Response(serializer.data)

    def patch(self, request):
        record = self.get_object()
        serializer = ConfigSystemSettingsSerializer(
            record, data=request.data, partial=True, context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        record = serializer.save()
        AuditLogger().log_success(
            AuditAction.UPDATE_POLICY,
            request.user.id,
            getattr(request.user, 'role', 'unknown'),
            details={'resource': 'system_settings', 'version': record.version, 'sections': list(request.data.keys())},
        )
        output = ConfigSystemSettingsSerializer(record)
        return Response(output.data)

    def put(self, request):
        return self.patch(request)


class ConfigSystemSettingsResetView(APIView):
    permission_classes = [IsSuperAdmin]
    throttle_classes = [ConfigWriteThrottle]

    def post(self, request):
        record = ConfigSettingsService.reset_to_defaults(user_id=request.user.id)
        AuditLogger().log_success(
            AuditAction.SYSTEM_ACTION,
            request.user.id,
            'super_admin',
            details={'action': 'reset_system_settings', 'version': record.version},
        )
        serializer = ConfigSystemSettingsSerializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)
