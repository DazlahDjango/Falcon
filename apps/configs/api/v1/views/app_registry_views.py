from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from apps.configs.models import RegisteredApp, AppDependency
from apps.configs.api.v1.serializers import RegisteredAppSerializer, RegisteredAppDetailSerializer, AppDependencySerializer
from apps.configs.api.v1.permissions import IsSuperAdmin, IsConfigAccess, IsSuperAdminOrReadOnly
from apps.configs.api.v1.throttles import ConfigReadThrottle, ConfigWriteThrottle
from apps.configs.api.v1.filters import RegisteredAppFilter, AppDependencyFilter
from apps.configs.services.registry.app_registry import AppRegistry
from apps.configs.services.registry.dependency_resolver import DependencyResolver
from apps.configs.services.registry.recovery_order import RecoveryOrder
from apps.configs.services.security.audit_logger import AuditLogger
from apps.configs.constants import AuditAction

class RegisteredAppViewSet(viewsets.ModelViewSet):
    queryset = RegisteredApp.objects.all()
    serializer_class = RegisteredAppSerializer
    permission_classes = [IsConfigAccess]
    throttle_classes = [ConfigReadThrottle, ConfigWriteThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = RegisteredAppFilter
    search_fields = ['name', 'display_name']
    ordering_fields = ['name', 'recovery_priority', 'created_at']
    ordering = ['recovery_priority', 'name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RegisteredAppDetailSerializer
        return RegisteredAppSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.id, updated_by=self.request.user.id)
        AuditLogger().log_success(AuditAction.REGISTER_APP, self.request.user.id, getattr(self.request.user, 'role', 'unknown'), target_app=serializer.instance, details={'app_name': serializer.instance.name})

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user.id)
        AuditLogger().log_success(AuditAction.REGISTER_APP, self.request.user.id, getattr(self.request.user, 'role', 'unknown'), target_app=serializer.instance, details={'app_name': serializer.instance.name, 'update': True})

    def perform_destroy(self, instance):
        AuditLogger().log_success(AuditAction.UNREGISTER_APP, self.request.user.id, getattr(self.request.user, 'role', 'unknown'), target_app=instance, details={'app_name': instance.name})
        instance.is_registered = False
        instance.save()

    @action(detail=False, methods=['post'], permission_classes=[IsSuperAdmin])
    def register_v1_apps(self, request):
        registry = AppRegistry()
        v1_apps = [
            ('accounts', 'Accounts & Authentication', True, 1),
            ('kpi', 'KPI Engine', True, 1),
            ('billing', 'Billing & Subscription', False, 2),
            ('reviews', 'Performance Reviews', False, 2),
            ('tenants', 'Tenant Management', True, 1),
            ('structure', 'Organization Structure', False, 2),
            ('dashboard', 'Dashboard & Analytics', False, 3),
        ]
        results = []
        for name, display, critical, priority in v1_apps:
            app = registry.register_app(name, display, critical, priority)
            results.append({'name': name, 'id': str(app.id)})
        return Response({'registered_apps': results})

    @action(detail=False, methods=['get'])
    def recovery_sequence(self, request):
        recovery = RecoveryOrder()
        sequence = recovery.get_recovery_sequence()
        serializer = self.get_serializer(sequence, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def priority_order(self, request):
        recovery = RecoveryOrder()
        apps = recovery.get_priority_order()
        serializer = self.get_serializer(apps, many=True)
        return Response(serializer.data)

class AppDependencyViewSet(viewsets.ModelViewSet):
    queryset = AppDependency.objects.all()
    serializer_class = AppDependencySerializer
    permission_classes = [IsSuperAdmin]
    throttle_classes = [ConfigWriteThrottle]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_class = AppDependencyFilter
    search_fields = ['source_app__name', 'target_app__name']

    def perform_create(self, serializer):
        serializer.save()
        DependencyResolver().validate_dependencies()
        AuditLogger().log_success(AuditAction.REGISTER_APP, self.request.user.id, 'super_admin', details={'dependency': f"{serializer.instance.source_app.name} -> {serializer.instance.target_app.name}"})

    def perform_destroy(self, instance):
        AuditLogger().log_success(AuditAction.UNREGISTER_APP, self.request.user.id, 'super_admin', details={'dependency': f"{instance.source_app.name} -> {instance.target_app.name}"})
        instance.delete()