from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.models import Permission
from apps.accounts.api.v1.serializers import PermissionSerializer, PermissionListSerializer, PermissionDetailSerializer
from apps.accounts.api.v1.permissions import IsSuperAdmin, IsClientAdmin
from apps.accounts.constants import PREDEFINED_PERMISSIONS_DATA, PermissionCategories
from apps.accounts.services import PermissionService
from .base import BaseModelViewset


class PermissionViewSet(BaseModelViewset):
    queryset = Permission.objects.filter(is_active=True, is_deleted=False)
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'level', 'is_active']
    search_fields = ['name', 'codename']
    ordering_fields = ['name', 'category', 'level']
    ordering = ['category', 'name']

    def get_serializer_class(self):
        if self.action == 'list':
            return PermissionListSerializer
        elif self.action == 'retrieve':
            return PermissionDetailSerializer
        return PermissionSerializer
    
    def get_queryset(self):
        qs = Permission.objects.filter(is_active=True, is_deleted=False)
        if not qs.exists():
            from django.contrib.contenttypes.models import ContentType
            try:
                content_type = ContentType.objects.get_for_model(Permission)
                for p in PREDEFINED_PERMISSIONS_DATA:
                    Permission.objects.get_or_create(
                        codename=p['codename'],
                        defaults={
                            'name': str(p['name']),
                            'category': p.get('category', 'admin'),
                            'level': p.get('level', 'tenant'),
                            'content_type': content_type,
                            'is_active': True
                        }
                    )
                qs = Permission.objects.filter(is_active=True, is_deleted=False)
            except Exception:
                pass
        return qs
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            self.permission_classes = [IsAuthenticated, IsClientAdmin]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='registry')
    def registry(self, request):
        """Returns the permission registry with metadata, filtered by caller privilege."""
        category = request.query_params.get('category')
        level = request.query_params.get('level')
        include_global = request.query_params.get('include_global', 'false').lower() == 'true'
        
        is_super = request.user.is_superuser or getattr(request.user, 'role', None) == 'super_admin'
        
        from apps.accounts.constants import TENANT_ASSIGNABLE_CATEGORIES, PermissionLevels
        
        data = list(PREDEFINED_PERMISSIONS_DATA)
        if not is_super and not include_global:
            data = [p for p in data if p.get('category') in TENANT_ASSIGNABLE_CATEGORIES and p.get('level') != PermissionLevels.GLOBAL]
            
        if category:
            data = [p for p in data if p.get('category') == category]
        if level:
            data = [p for p in data if p.get('level') == level]
            
        categories_list = PermissionCategories.CHOICES if is_super else [
            c for c in PermissionCategories.CHOICES if c[0] in TENANT_ASSIGNABLE_CATEGORIES
        ]
            
        return Response({
            'count': len(data),
            'categories': categories_list,
            'permissions': data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-category/(?P<category>[^/.]+)')
    def by_category(self, request, category=None):
        permissions = self.get_queryset().filter(category=category)
        if not permissions.exists():
            # Return matching predefined permissions from registry
            matched = [p for p in PREDEFINED_PERMISSIONS_DATA if p.get('category') == category]
            return Response(matched, status=status.HTTP_200_OK)
        serializer = PermissionListSerializer(permissions, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='by-level/(?P<level>[^/.]+)')
    def by_level(self, request, level=None):
        permissions = self.get_queryset().filter(level=level)
        if not permissions.exists():
            matched = [p for p in PREDEFINED_PERMISSIONS_DATA if p.get('level') == level]
            return Response(matched, status=status.HTTP_200_OK)
        serializer = PermissionListSerializer(permissions, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)