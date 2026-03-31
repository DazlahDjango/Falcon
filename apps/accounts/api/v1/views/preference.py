from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import UserPreference, TenantPreference
from apps.accounts.services.profile.preferences import PreferenceService
from apps.accounts.api.v1.serializers import (
    UserPreferenceSerializer, UserPreferenceUpdateSerializer,
    TenantPreferenceSerializer, TenantPreferenceUpdateSerializer
)
from apps.accounts.api.v1.permissions import IsSuperAdmin, IsClientAdmin, IsOwner
from .base import BaseModelViewset

class UserPreferenceViewSet(BaseModelViewset):
    queryset = UserPreference.objects.all()
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserPreferenceUpdateSerializer
        return UserPreferenceSerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_superuser:
            qs = qs.filter(user=self.request.user)
        return qs
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsOwner]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='my')
    def my_preferences(self, request):
        preference_service = PreferenceService()
        preferences = preference_service.get_user_preferences(request.user)
        serializer = UserPreferenceSerializer(preferences, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['patch'], url_path='my')
    def update_my_preferences(self, request):
        serializer = UserPreferenceUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        preference_service = PreferenceService()
        success, message = preference_service.update_user_preferences(
            user=request.user,
            data=serializer.validated_data,
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        preferences = preference_service.get_user_preferences(request.user)
        response_serializer = UserPreferenceSerializer(preferences, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='notifications')
    def update_notifications(self, request):
        event_type = request.data.get('event_type')
        channels = request.data.get('channels', [])
        if not event_type:
            return Response({'error': 'event_type is required'}, status=status.HTTP_400_BAD_REQUEST) 
        preference_service = PreferenceService()
        success, message = preference_service.update_notification_settings(
            user=request.user,
            event_type=event_type,
            channels=channels,
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)

class TenantPreferenceViewSet(BaseModelViewset):
    queryset = TenantPreference.objects.all()
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return TenantPreferenceUpdateSerializer
        return TenantPreferenceSerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_superuser:
            qs = qs.filter(client_id=self.request.user.tenant_id)
        return qs
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update']:
            self.permission_classes = [IsAuthenticated, IsClientAdmin]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    @action(detail=False, methods=['get'], url_path='my-tenant')
    def my_tenant_preferences(self, request):
        preference_service = PreferenceService()
        preferences = preference_service.get_tenant_preferences(str(request.user.tenant_id))
        serializer = TenantPreferenceSerializer(preferences, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['patch'], url_path='my-tenant')
    def update_my_tenant_preferences(self, request):
        serializer = TenantPreferenceUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        preference_service = PreferenceService()
        success, message = preference_service.update_tenant_preferences(
            client_id=str(request.user.tenant_id),
            data=serializer.validated_data,
            user=request.user,
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        preferences = preference_service.get_tenant_preferences(str(request.user.tenant_id))
        response_serializer = TenantPreferenceSerializer(preferences, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['patch'], url_path='my-tenant/branding')
    def update_branding(self, request):
        logo_url = request.data.get('logo_url')
        favicon_url = request.data.get('favicon_url')
        primary_color = request.data.get('primary_color')
        secondary_color = request.data.get('secondary_color')
        preference_service = PreferenceService()
        success, message = preference_service.update_branding(
            client_id=str(request.user.tenant_id),
            logo_url=logo_url,
            favicon_url=favicon_url,
            primary_color=primary_color,
            secondary_color=secondary_color,
            user=request.user,
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)