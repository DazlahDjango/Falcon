# backend/apps/kpi/views/framework.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
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
from ..serializers import SectorSerializer, KPIFrameworkSerializer, KPICategorySerializer, KPITemplateSerializer
from .base import BaseKpiViewset


class SectorViewSet(BaseKpiViewset):
    """Sector management - viewable by all, editable by admins only"""
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    permission_classes = [IsAuthenticatedAndActive, IsTenantMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sector_type', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(tenant_id=self.request.tenant.id)

    def get_permissions(self):
        """Write operations require admin access"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsFrameworkAdmin]
        return super().get_permissions()

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedAndActive])
    def frameworks(self, request, pk=None):
        """Get all frameworks for this sector (published only for non-admins)"""
        sector = self.get_object()
        frameworks = KPIFramework.objects.filter(sector=sector, tenant_id=request.tenant.id)
        
        # Non-admins only see published frameworks
        role = getattr(request.user, 'role', '')
        if role not in ['super_admin', 'client_admin']:
            frameworks = frameworks.filter(status='PUBLISHED')
        
        serializer = KPIFrameworkSerializer(frameworks, many=True)
        return Response(serializer.data)


class KPIFrameworkViewSet(BaseKpiViewset):
    """Framework management - full CRUD for admins, read-only for others"""
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
        queryset = queryset.filter(tenant_id=self.request.tenant.id)
        
        # Non-admins only see published frameworks
        role = getattr(self.request.user, 'role', '')
        if role not in ['super_admin', 'client_admin']:
            queryset = queryset.filter(status='PUBLISHED')
        
        return queryset.annotate(kpi_count=Count('kpis'))

    def get_permissions(self):
        """Write operations require admin access"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsFrameworkAdmin]
        return super().get_permissions()

    def perform_create(self, serializer):
        """Create framework - always starts as DRAFT"""
        serializer.save(
            tenant_id=self.request.tenant.id,
            created_by=self.request.user,
            updated_by=self.request.user,
            status='DRAFT'
        )

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedAndActive])
    def categories(self, request, pk=None):
        """Get all categories for this framework"""
        framework = self.get_object()
        categories = KPICategory.objects.filter(
            framework=framework, 
            is_active=True,
            tenant_id=request.tenant.id
        )
        serializer = KPICategorySerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedAndActive])
    def kpis(self, request, pk=None):
        """Get all KPIs for this framework"""
        framework = self.get_object()
        kpis = framework.kpis.filter(is_active=True)
        serializer = KPIListSerializer(kpis, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[CanPublishFramework])
    def publish(self, request, pk=None):
        """Publish framework - admin only"""
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
        """Archive framework - admin only"""
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
        """Duplicate framework - admin only"""
        original = self.get_object()
        
        # Create copy
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
        
        # Copy categories
        for cat in original.categories.filter(is_active=True):
            KPICategory.objects.create(
                tenant_id=original.tenant_id,
                name=cat.name,
                code=f"{cat.code}_COPY",
                category_type=cat.category_type,
                framework=new_framework,
                parent=None,  # Reset parent hierarchy
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
    """Category management - full CRUD for admins, read-only for others"""
    queryset = KPICategory.objects.all()
    serializer_class = KPICategorySerializer
    permission_classes = [IsAuthenticatedAndActive, IsTenantMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['framework', 'category_type', 'is_active', 'parent']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['display_order', 'name']
    ordering = ['display_order', 'name']

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(
            tenant_id=self.request.tenant.id,
            framework__tenant_id=self.request.tenant.id
        )

    def get_permissions(self):
        """Write operations require admin access"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsFrameworkAdmin]
        return super().get_permissions()

    def perform_create(self, serializer):
        """Create category - admin only"""
        serializer.save(
            tenant_id=self.request.tenant.id,
            created_by=self.request.user,
            updated_by=self.request.user
        )

    @action(detail=True, methods=['post'], permission_classes=[IsFrameworkAdmin])
    def move(self, request, pk=None):
        """Move category to different parent - admin only"""
        category = self.get_object()
        new_parent_id = request.data.get('parent_id')
        
        # Validate new parent belongs to same framework
        if new_parent_id:
            try:
                new_parent = KPICategory.objects.get(
                    id=new_parent_id, 
                    framework=category.framework,
                    tenant_id=request.tenant.id
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
        """Get child categories"""
        category = self.get_object()
        children = category.children.filter(is_active=True, tenant_id=request.tenant.id)
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticatedAndActive])
    def kpis(self, request, pk=None):
        """Get KPIs in this category"""
        category = self.get_object()
        kpis = category.kpis.filter(is_active=True)
        serializer = KPIListSerializer(kpis, many=True)
        return Response(serializer.data)
        
    @action(detail=False, methods=['post'], permission_classes=[IsFrameworkAdmin])
    def reorder(self, request):
        """Batch update category display order"""
        category_orders = request.data.get('categories', [])
        
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
                    tenant_id=request.tenant.id,
                    framework_id=item.get('framework_id')
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
    """Template management - viewable by all, admin for write operations"""
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
        queryset = queryset.filter(tenant_id=self.request.tenant.id)
        
        # Non-admins only see published templates
        role = getattr(self.request.user, 'role', '')
        if role not in ['super_admin', 'client_admin']:
            queryset = queryset.filter(is_published=True)
        
        return queryset

    def get_permissions(self):
        """Write operations require admin access"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsFrameworkAdmin]
        return super().get_permissions()

    @action(detail=True, methods=['post'], permission_classes=[IsFrameworkAdmin])
    def publish(self, request, pk=None):
        """Publish template - admin only"""
        template = self.get_object()
        template.is_published = True
        template.save()
        serializer = self.get_serializer(template)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticatedAndActive])
    def use_template(self, request, pk=None):
        """Use template to create KPI - any authenticated user"""
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
            'tenant_id': self.request.tenant.id
        })
        
        creator = KPICreator()
        kpi = creator.create(kpi_data, request.user)
        serializer = KPIDetailSerializer(kpi)
        return Response(serializer.data, status=status.HTTP_201_CREATED)