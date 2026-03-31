from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.accounts.models import Profile
from apps.accounts.services import ProfileService, AvatarService
from apps.accounts.api.v1.serializers import (
    ProfileSerializer, ProfileUpdateSerializer, ProfilDetailSerializer, ProfileListSerializer,
    SkillUpdateSerializer, CertificationUpdateSerializer
)
from apps.accounts.api.v1.permissions import CanAccessProfile, IsOwner
from .base import BaseModelViewset

class ProfileViewSet(BaseModelViewset):
    queryset = Profile.objects.all()
    def get_serializer_class(self):
        if self.action == 'list':
            return ProfileListSerializer
        elif self.action == 'retrieve':
            return ProfilDetailSerializer
        elif self.action in ['update', 'partial_update']:
            return ProfileUpdateSerializer
        return ProfileSerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [IsAuthenticated, IsOwner]
        elif self.action in ['retrieve']:
            self.permission_classes = [IsAuthenticated, CanAccessProfile]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'], url_path='avatar')
    def upload_avatar(self,request, pk=None):
        profile = self.get_object()
        avatar_file = request.FILES.get('avatar')
        if not avatar_file:
            return Response({'error': 'Avatar file is required'}, status=status.HTTP_400_BAD_REQUEST)
        avatar_service = AvatarService()
        success, message, url = avatar_service.upload_avatar(
            user=profile.user,
            file=avatar_file,
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message, 'avatar_url': url}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], url_path='avatar')
    def delete_avatar(self,request, pk=None):
        profile = self.get_object()
        avatar_service = AvatarService()
        success, message = avatar_service.delete_avatar(user=profile.user, request=request)
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='skills')
    def add_skill(self,request, pk=None):
        profile = self.get_object()
        serializer = SkillUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile_service = ProfileService()
        success, message = profile_service.add_skill(
            user=profile.user,
            skill_name=serializer.validated_data['name'],
            level=serializer.validated_data['level'],
            years_experience=serializer.validated_data.get('years_experience', 0),
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['put'], url_path='skills/(?P<skill_id>[^/.]+)')
    def update_skill(self, request, pk=None, skill_name=None):
        profile = self.get_object()
        serializer = SkillUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile_service = ProfileService()
        success, message = profile_service.update_skill(
            user=profile.user,
            skill_name=skill_name,
            level=serializer.validated_data.get('level'),
            years_experience=serializer.validated_data.get('years_experience'),
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], url_path='skills/(?P<skill_id>[^/.]+)')
    def remove_skill(self, request, pk=None, skill_name=None):
        profile = self.get_object()
        profile_service = ProfileService()
        success, message = profile_service.remove_skill(
            user=profile.user,
            skill_name=skill_name,
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='certifications')
    def add_certification(self, request, pk=None):
        profile = self.get_object()
        serializer = CertificationUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile_service = ProfileService()
        success, message = profile_service.add_certification(
            user=profile.user,
            name=serializer.validated_data['name'],
            issuer=serializer.validated_data['issuer'],
            issued_date=serializer.validated_data['issued_date'],
            expiry_date=serializer.validated_data.get('expiry_date'),
            credential_id=serializer.validated_data.get('credential_id'),
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='skills-summary')
    def skills_summary(self, request, pk=None):
        profile = self.get_object()
        profile_service = ProfileService()
        skills = profile_service.get_skills_summary(profile.user)
        return Response({'skills': skills}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='certifications-summary')
    def certifications_summary(self, request, pk=None):
        profile = self.get_object()
        profile_service = ProfileService()
        certifications = profile_service.get_certifications_summary(profile.user)
        return Response({'certifications': certifications}, status=status.HTTP_200_OK)