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
    IsTenantMember
)
from apps.kpi.models import KPICategory
from ..serializers import (
    KPICategorySerializer, KPIListSerializer
)
from .base import BaseKpiViewset


class KPICategoryViewSet(BaseKpiViewset):
    queryset = KPICategory.objects.all()
    serializer_class = KPICategorySerializer
    permission_classes = [IsAuthenticatedAndActive, IsTenantMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category_type', 'is_active', 'parent']
    search_fields = ['name', 'description']
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
                    tenant_id=tenant_id
                )
                category.parent = new_parent
            except KPICategory.DoesNotExist:
                return Response(
                    {'error': 'Invalid parent category.'},
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