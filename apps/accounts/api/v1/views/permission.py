from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.models import Permission
from apps.accounts.api.v1.serializers import PermissionSerializer, PermissionListSerializer, PermissionDetailSerializer
from apps.accounts.api.v1.permissions import IsSuperAdmin, IsClientAdmin
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
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            self.permission_classes = [IsAuthenticated, IsClientAdmin]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='by-category/(?P<category>[^/.]+)')
    def by_category(self, request, category=None):
        permissions = self.get_queryset().filter(category=category)
        serializer = PermissionListSerializer(permissions, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='by-level/(?P<level>[^/.]+)')
    def by_level(self,request, level=None):
        permissions = self.get_queryset().filter(level=level)
        serializer = PermissionListSerializer(permissions, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)