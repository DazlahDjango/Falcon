from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from ..permissions import (
    IsAuthenticatedAndActive, 
    IsFrameworkAdmin, 
    CanPublishFramework, 
    CanArchiveFramework,
    IsTenantMember
)
from apps.kpi.models import Sector, KPIFramework, KPICategory, KPITemplate
from ..serializers import (
    SectorSerializer, KPIFrameworkSerializer, KPICategorySerializer,
    KPITemplateSerializer, KPIListSerializer, KPIDetailSerializer
)
from ....services import KPICreator
from .base import BaseKpiViewset

class SectorViewSet(BaseKpiViewset):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    permission_classes = [IsAuthenticatedAndActive, IsTenantMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sector_type', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsFrameworkAdmin]
        return super().get_permissions()

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedAndActive])
    def frameworks(self, request, pk=None):
        sector = self.get_object()
        tenant_id = getattr(request, 'current_tenant_id', None)
        frameworks = KPIFramework.objects.filter(sector=sector, tenant_id=tenant_id)
        
        role = getattr(request.user, 'role', '')
        if role not in ['super_admin', 'client_admin']:
            frameworks = frameworks.filter(status='PUBLISHED')
        
        serializer = KPIFrameworkSerializer(frameworks, many=True)
        return Response(serializer.data)


class KPIFrameworkViewSet(BaseKpiViewset):
    queryset = KPIFramework.objects.all()
    serializer_class = KPIFrameworkSerializer
    permission_classes = [IsAuthenticatedAndActive, IsTenantMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sector', 'status', 'is_default']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'version', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        role = getattr(self.request.user, 'role', '')
        if role not in ['super_admin', 'client_admin']:
            queryset = queryset.filter(status='PUBLISHED')
        
        return queryset.annotate(kpi_count=Count('kpis'))

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsFrameworkAdmin]
        return super().get_permissions()

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedAndActive])
    def categories(self, request, pk=None):
        framework = self.get_object()
        tenant_id = getattr(request, 'current_tenant_id', None)
        categories = KPICategory.objects.filter(
            framework=framework, 
            is_active=True,
            tenant_id=tenant_id
        )
        serializer = KPICategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedAndActive])
    def kpis(self, request, pk=None):
        framework = self.get_object()
        kpis = framework.kpis.filter(is_active=True)
        serializer = KPIListSerializer(kpis, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[CanPublishFramework])
    def publish(self, request, pk=None):
        framework = self.get_object()
        
        if framework.status != 'DRAFT':
            return Response(
                {'error': f'Cannot publish framework with status: {framework.status}. Only DRAFT frameworks can be published.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        framework.publish()
        serializer = self.get_serializer(framework)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[CanArchiveFramework])
    def archive(self, request, pk=None):
        framework = self.get_object()
        
        if framework.status != 'PUBLISHED':
            return Response(
                {'error': f'Cannot archive framework with status: {framework.status}. Only PUBLISHED frameworks can be archived.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        framework.archive()
        serializer = self.get_serializer(framework)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsFrameworkAdmin])
    def duplicate(self, request, pk=None):
        original = self.get_object()
        
        new_framework = KPIFramework.objects.create(
            tenant_id=original.tenant_id,
            name=f"{original.name} (Copy)",
            code=f"{original.code}_COPY",
            sector=original.sector,
            description=f"Copy of {original.name} created on {timezone.now().date()}",
            version="1.0.0",
            status='DRAFT',
            created_by=request.user,
            updated_by=request.user
        )
        
        for cat in original.categories.filter(is_active=True):
            KPICategory.objects.create(
                tenant_id=original.tenant_id,
                name=cat.name,
                code=f"{cat.code}_COPY",
                category_type=cat.category_type,
                framework=new_framework,
                parent=None,
                description=cat.description,
                color=cat.color,
                icon=cat.icon,
                display_order=cat.display_order,
                created_by=request.user,
                updated_by=request.user
            )
        
        serializer = self.get_serializer(new_framework)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class KPICategoryViewSet(BaseKpiViewset):
    queryset = KPICategory.objects.all()
    serializer_class = KPICategorySerializer
    permission_classes = [IsAuthenticatedAndActive, IsTenantMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['framework', 'category_type', 'is_active', 'parent']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['display_order', 'name']
    ordering = ['display_order', 'name']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsFrameworkAdmin]
        return super().get_permissions()

    @action(detail=True, methods=['post'], permission_classes=[IsFrameworkAdmin])
    def move(self, request, pk=None):
        category = self.get_object()
        new_parent_id = request.data.get('parent_id')
        tenant_id = getattr(request, 'current_tenant_id', None)
        
        if new_parent_id:
            try:
                new_parent = KPICategory.objects.get(
                    id=new_parent_id, 
                    framework=category.framework,
                    tenant_id=tenant_id
                )
                category.parent = new_parent
            except KPICategory.DoesNotExist:
                return Response(
                    {'error': 'Invalid parent category. Must belong to the same framework.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            category.parent = None
        
        category.save()
        serializer = self.get_serializer(category)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedAndActive])
    def children(self, request, pk=None):
        category = self.get_object()
        tenant_id = getattr(request, 'current_tenant_id', None)
        children = category.children.filter(is_active=True, tenant_id=tenant_id)
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedAndActive])
    def kpis(self, request, pk=None):
        category = self.get_object()
        kpis = category.kpis.filter(is_active=True)
        serializer = KPIListSerializer(kpis, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[IsFrameworkAdmin])
    def reorder(self, request):
        category_orders = request.data.get('categories', [])
        tenant_id = getattr(request, 'current_tenant_id', None)
        
        if not category_orders:
            return Response(
                {'error': 'categories list required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated = []
        errors = []
        
        for item in category_orders:
            try:
                category = KPICategory.objects.get(
                    id=item['id'],
                    tenant_id=tenant_id
                )
                category.display_order = item.get('display_order', 0)
                category.save(update_fields=['display_order'])
                updated.append(str(category.id))
            except KPICategory.DoesNotExist:
                errors.append({'id': item['id'], 'error': 'Category not found'})
        
        return Response({
            'updated': updated,
            'errors': errors,
            'total': len(category_orders)
        })


class KPITemplateViewSet(BaseKpiViewset):
    queryset = KPITemplate.objects.all()
    serializer_class = KPITemplateSerializer
    permission_classes = [IsAuthenticatedAndActive, IsTenantMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sector', 'category', 'difficulty', 'is_published']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'usage_count', 'created_at']
    ordering = ['-usage_count', 'name']

    def get_queryset(self):
        queryset = super().get_queryset()
        role = getattr(self.request.user, 'role', '')
        if role not in ['super_admin', 'client_admin']:
            queryset = queryset.filter(is_published=True)
        
        return queryset

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsFrameworkAdmin]
        return super().get_permissions()

    @action(detail=True, methods=['post'], permission_classes=[IsFrameworkAdmin])
    def publish(self, request, pk=None):
        template = self.get_object()
        template.is_published = True
        template.save()
        serializer = self.get_serializer(template)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedAndActive])
    def use_template(self, request, pk=None):
        template = self.get_object()
        
        if not template.is_published:
            return Response(
                {'error': 'Cannot use unpublished template'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        template.increment_usage()
        
        kpi_data = template.kpi_definition.copy()
        kpi_data.update({
            'framework_id': request.data.get('framework_id'),
            'sector_id': template.sector_id,
            'owner_id': request.user.id,
        })
        
        creator = KPICreator()
        kpi = creator.create(kpi_data, request.user)
        serializer = KPIDetailSerializer(kpi)
        return Response(serializer.data, status=status.HTTP_201_CREATED)