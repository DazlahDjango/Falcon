from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.configs.models import RegisteredApp, AppDependency
from apps.configs.api.v1.serializers import RegisteredAppSerializer, RegisteredAppDetailSerializer, AppDependencySerializer
from apps.configs.api.v1.permissions import IsSuperAdmin, IsSuperAdminOrReadOnly
from apps.configs.api.v1.throttles import ConfigReadThrottle, ConfigWriteThrottle
from apps.configs.api.v1.filters import RegisteredAppFilter, AppDependencyFilter
from apps.configs.services.registry.app_registry import AppRegistry
from apps.configs.services.registry.app_definitions import V1_APP_DEFINITIONS
from apps.configs.services.registry.dependency_resolver import DependencyResolver
from apps.configs.services.registry.recovery_order import RecoveryOrder
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.constants import AuditAction

class RegisteredAppViewSet(viewsets.ModelViewSet):
    """
    CIA-aligned app registry API.
    - Confidentiality: write restricted to super_admin (IsSuperAdminOrReadOnly).
    - Integrity: name immutable; sync_registry reconciles from canonical definitions.
    - Availability: critical/priority/RPO/RTO drive recovery ordering.
    """
    queryset = RegisteredApp.objects.all()
    serializer_class = RegisteredAppSerializer
    permission_classes = [IsSuperAdminOrReadOnly]
    throttle_classes = [ConfigReadThrottle, ConfigWriteThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = RegisteredAppFilter
    search_fields = ['name', 'display_name']
    ordering_fields = ['name', 'recovery_priority', 'is_critical', 'created_at']
    ordering = ['recovery_priority', 'name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RegisteredAppDetailSerializer
        return RegisteredAppSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action == 'list' and self.request.query_params.get('registered_only', 'true').lower() != 'false':
            qs = qs.filter(is_registered=True)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.id, updated_by=self.request.user.id)
        AuditLogger().log_success(
            AuditAction.REGISTER_APP, self.request.user.id,
            getattr(self.request.user, 'role', 'unknown'),
            target_app=serializer.instance,
            details={'app_name': serializer.instance.name},
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user.id)
        AuditLogger().log_success(
            AuditAction.REGISTER_APP, self.request.user.id,
            getattr(self.request.user, 'role', 'unknown'),
            target_app=serializer.instance,
            details={'app_name': serializer.instance.name, 'update': True},
        )

    def perform_destroy(self, instance):
        AuditLogger().log_success(
            AuditAction.UNREGISTER_APP, self.request.user.id,
            getattr(self.request.user, 'role', 'unknown'),
            target_app=instance,
            details={'app_name': instance.name},
        )
        instance.is_registered = False
        instance.save(update_fields=['is_registered', 'updated_at'])

    @action(detail=False, methods=['post'], permission_classes=[IsSuperAdmin], url_path='sync_registry')
    def sync_registry(self, request):
        """Reconcile all registered apps with canonical V1 definitions."""
        registry = AppRegistry()
        app_names = request.data.get('app_names')
        synced = registry.sync_all_definitions(app_names=app_names)
        DependencyResolver().validate_dependencies()
        AuditLogger().log_success(
            AuditAction.REGISTER_APP, request.user.id, 'super_admin',
            details={'action': 'sync_registry', 'count': len(synced)},
        )
        serializer = self.get_serializer(synced, many=True)
        return Response({
            'synced_count': len(synced),
            'apps': serializer.data,
            'message': 'Registry synchronized with canonical definitions.',
        })

    @action(detail=False, methods=['post'], permission_classes=[IsSuperAdmin], url_path='register_v1_apps')
    def register_v1_apps(self, request):
        """Deprecated alias — use sync_registry."""
        return self.sync_registry(request)

    @action(detail=False, methods=['get'], url_path='definitions')
    def definitions(self, request):
        """Read-only canonical definitions (Integrity reference)."""
        data = []
        for name, defn in V1_APP_DEFINITIONS.items():
            data.append({
                'name': defn.name,
                'display_name': defn.display_name,
                'is_critical': defn.is_critical,
                'recovery_priority': defn.recovery_priority,
                'rpo_minutes': defn.rpo_minutes,
                'rto_minutes': defn.rto_minutes,
                'backup_retention_days': defn.backup_retention_days,
                'dependencies': list(defn.dependencies),
                'cia': defn.cia_summary,
                'health_check_path': defn.health_check_path,
            })
        return Response({'definitions': data, 'count': len(data)})

    @action(detail=False, methods=['get'], url_path='recovery_sequence')
    def recovery_sequence(self, request):
        recovery = RecoveryOrder()
        sequence = recovery.get_recovery_sequence()
        serializer = self.get_serializer(sequence, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='priority_order')
    def priority_order(self, request):
        recovery = RecoveryOrder()
        apps = recovery.get_priority_order()
        serializer = self.get_serializer(apps, many=True)
        return Response(serializer.data)


class AppDependencyViewSet(viewsets.ModelViewSet):
    queryset = AppDependency.objects.select_related('source_app', 'target_app')
    serializer_class = AppDependencySerializer
    permission_classes = [IsSuperAdmin]
    throttle_classes = [ConfigWriteThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = AppDependencyFilter
    search_fields = ['source_app__name', 'target_app__name']

    def perform_create(self, serializer):
        serializer.save()
        DependencyResolver().validate_dependencies()
        AuditLogger().log_success(
            AuditAction.REGISTER_APP, self.request.user.id, 'super_admin',
            details={'dependency': f"{serializer.instance.source_app.name} -> {serializer.instance.target_app.name}"},
        )

    def perform_destroy(self, instance):
        AuditLogger().log_success(
            AuditAction.UNREGISTER_APP, self.request.user.id, 'super_admin',
            details={'dependency': f"{instance.source_app.name} -> {instance.target_app.name}"},
        )
        instance.delete()
