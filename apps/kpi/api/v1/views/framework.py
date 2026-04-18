from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .base import BaseKpiViewset
from ..serializers import SectorSerializer, KPIFrameworkSerializer, KPICategorySerializer, KPITemplateSerializer, KPIListSerializer, KPIDetailSerializer
from ....models import Sector, KPIFramework, KPICategory, KPITemplate
from ..filters import BaseKPIListFilter
from ....services import KPICreator

class SectorViewSet(BaseKpiViewset):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sector_type', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['get'])
    def frameworks(self, request, pk=None):
        sector = self.get_object()
        frameworks = KPIFramework.objects.filter(sector=sector, status='PUBLISHED')
        serializer = KPIFrameworkSerializer(frameworks, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['get'])
    def templates(self, request, pk=None):
        sector = self.get_object()
        templates = KPITemplate.objects.filter(sector=sector, is_published=True)
        serializer = KPITemplateSerializer(templates, many=True)
        return Response(serializer.data)
    
class KPIFrameworkViewSet(BaseKpiViewset):
    queryset = KPIFramework.objects.all()
    serializer_class = KPIFrameworkSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sector', 'status', 'is_default']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'version', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.annotate(kpi_count=Count('kpis'))
    @action(detail=True, methods=['get'])
    def categories(self, request, pk=None):
        framework = self.get_object()
        categories = KPICategory.objects.filter(framework=framework, is_active=True)
        serializer = KPICategorySerializer(categories, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['get'])
    def kpis(self, request, pk=None):
        framework = self.get_object()
        kpis = framework.kpis.filter(is_active=True)
        serializer = KPIListSerializer(kpis, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        framework = self.get_object()
        framework.pubish()
        serializer = self.get_serializer(framework)
        return Response(serializer.data)
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        framework = self.get_object()
        framework.archive()
        serializer = self.get_serializer(framework)
        return Response(serializer.data)

class KPICategoryViewSet(BaseKpiViewset):
    queryset = KPICategory.objects.all()
    serializer_class = KPICategorySerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['framework', 'category_type', 'is_active', 'parent']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['display_order', 'name']
    ordering = ['display_order', 'name']

    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        category = self.get_object()
        children = category.children.filter(is_active=True)
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['get'])
    def kpis(self, request, pk=None):
        category = self.get_object()
        kpis = category.kpis.filter(is_active=True)
        serializer = KPIListSerializer(kpis, many=True)
        return Response(serializer.data)

class KPITemplateViewSet(BaseKpiViewset):
    queryset = KPITemplate.objects.all()
    serializer_class = KPITemplateSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['sector', 'category', 'difficulty', 'is_published']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'usage_count', 'created_at']
    ordering = ['-usage_count', 'name']

    @action(detail=True, methods=['post'])
    def use_template(self, request, pk=None):
        template = self.get_object()
        template.increment_usage()
        kpi_data = template.kpi_definition
        kpi_data.update({
            'framework_id': request.data.get('framework_id'),
            'sector_id': template.sector_id,
            'owner_id': request.user.id,
            'tenant_id': self.request.tenant.id
        })
        creator = KPICreator()
        kpi = creator.create(kpi_data, request.user)
        serializer = KPIDetailSerializer(kpi)
        return Response(serializer.data, status=201)