from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.tenant.models import OrganizationSettings
from apps.tenant.api.v1.serializers import SettingsSerializer, SettingsUpdateSerializer
from apps.tenant.api.v1.permissions import IsSuperAdmin
from apps.tenant.api.v1.throttles import OrganizationApiThrottle
from apps.tenant.services import OrganizationSettingsService


class SettingsViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    throttle_classes = [OrganizationApiThrottle]

    def get_queryset(self):
        return OrganizationSettings.objects.all()

    def get_serializer_class(self):
        if self.action == 'update':
            return SettingsUpdateSerializer
        return SettingsSerializer

    def list(self, request):
        settings = OrganizationSettingsService.get_settings()
        return Response({'settings': settings})

    @action(detail=False, methods=['get'])
    def section(self, request):
        section_name = request.query_params.get('section')
        if not section_name:
            return Response({'error': 'section parameter required'}, status=status.HTTP_400_BAD_REQUEST)
        data = OrganizationSettingsService.get_section(section_name)
        return Response({section_name: data})

    @action(detail=False, methods=['post'])
    def update_settings(self, request):
        serializer = SettingsUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = OrganizationSettingsService.update_settings(
            serializer.validated_data['settings'],
            user_id=request.user.id
        )
        return Response({
            'success': True,
            'version': result.version,
            'updated_at': result.updated_at
        })

    @action(detail=False, methods=['post'])
    def update_section(self, request):
        section = request.data.get('section')
        patch = request.data.get('patch')
        if not section or not patch:
            return Response({'error': 'section and patch required'}, status=status.HTTP_400_BAD_REQUEST)
        result = OrganizationSettingsService.update_section(section, patch, user_id=request.user.id)
        return Response({
            'success': True,
            'section': section,
            'version': result.version
        })

    @action(detail=False, methods=['post'])
    def reset(self, request):
        result = OrganizationSettingsService.reset_to_defaults(user_id=request.user.id)
        return Response({
            'success': True,
            'message': 'Settings reset to defaults',
            'version': result.version
        })