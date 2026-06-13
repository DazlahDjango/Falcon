import logging
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.core.exceptions import ValidationError
from apps.accounts.models import Profile
from apps.accounts.services import ProfileService, AvatarService
from apps.accounts.api.v1.serializers import (
    ProfileSerializer,
    ProfileUpdateSerializer,
    ProfilDetailSerializer,
    ProfileListSerializer,
    SkillUpdateSerializer,
    CertificationUpdateSerializer
)
from apps.accounts.api.v1.permissions import CanAccessProfile, IsOwner
from .base import BaseModelViewset

logger = logging.getLogger(__name__)


class ProfileViewSet(BaseModelViewset):
    """
    Profile ViewSet for managing user profiles, skills, and certifications.
    
    Actions:
    - list: Get all profiles (admin only)
    - retrieve: Get specific profile
    - update: Update profile
    - avatar: Upload/delete avatar
    - skills: Manage skills
    - certifications: Manage certifications
    - my: Get/update current user's profile
    """
    
    queryset = Profile.objects.all()
    lookup_field = 'id'
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        action_serializers = {
            'list': ProfileListSerializer,
            'retrieve': ProfilDetailSerializer,
            'update': ProfileUpdateSerializer,
            'partial_update': ProfileUpdateSerializer,
        }
        return action_serializers.get(self.action, ProfileSerializer)
    
    def get_permissions(self):
        """Set permissions based on action"""
        write_actions = ['update', 'partial_update', 'destroy',
                         'upload_avatar', 'delete_avatar',
                         'add_skill', 'update_skill', 'remove_skill',
                         'add_certification', 'remove_certification']
        
        if self.action in write_actions:
            self.permission_classes = [IsAuthenticated, IsOwner]
        elif self.action == 'retrieve':
            self.permission_classes = [IsAuthenticated, CanAccessProfile]
        else:
            self.permission_classes = [IsAuthenticated]
        
        return super().get_permissions()
    
    def get_queryset(self):
        """Filter queryset by tenant"""
        qs = super().get_queryset()
        qs = qs.select_related('user')
        
        if not self.request.user.is_superuser:
            qs = qs.filter(tenant_id=self.request.user.tenant_id)
        
        return qs
    
    def get_object(self):
        """Override to handle missing profiles gracefully"""
        try:
            return super().get_object()
        except Http404:
            # If trying to access current user's profile, create it
            if self.kwargs.get('pk') == str(self.request.user.id):
                profile_service = ProfileService()
                return profile_service.get_profile(self.request.user)
            raise
    
    # ========== Avatar Management ==========
    
    @action(detail=True, methods=['post'], url_path='avatar')
    def upload_avatar(self, request, pk=None):
        """Upload avatar for user profile"""
        profile = self.get_object()
        avatar_file = request.FILES.get('avatar')
        
        if not avatar_file:
            return Response(
                {'error': 'Avatar file is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        avatar_service = AvatarService()
        success, message, url = avatar_service.upload_avatar(
            user=profile.user,
            file=avatar_file,
            request=request
        )
        
        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'message': message,
            'avatar_url': url
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], url_path='avatar')
    def delete_avatar(self, request, pk=None):
        """Delete user avatar"""
        profile = self.get_object()
        avatar_service = AvatarService()
        success, message = avatar_service.delete_avatar(
            user=profile.user,
            request=request
        )
        
        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {'message': message},
            status=status.HTTP_200_OK
        )
    
    # ========== Skill Management ==========
    
    @action(detail=True, methods=['post'], url_path='skills')
    def add_skill(self, request, pk=None):
        """Add a skill to user profile"""
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
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {'message': message},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['put'], url_path='skills/(?P<skill_name>[^/.]+)')
    def update_skill(self, request, pk=None, skill_name=None):
        """Update an existing skill"""
        profile = self.get_object()
        serializer = SkillUpdateSerializer(data=request.data, partial=True)
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
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {'message': message},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['delete'], url_path='skills/(?P<skill_name>[^/.]+)')
    def remove_skill(self, request, pk=None, skill_name=None):
        """Remove a skill from user profile"""
        profile = self.get_object()
        profile_service = ProfileService()
        success, message = profile_service.remove_skill(
            user=profile.user,
            skill_name=skill_name,
            request=request
        )
        
        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {'message': message},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'], url_path='skills-summary')
    def skills_summary(self, request, pk=None):
        """Get summary of user's skills"""
        profile = self.get_object()
        profile_service = ProfileService()
        skills = profile_service.get_skills_summary(profile.user)
        
        return Response({
            'skills': skills,
            'count': len(skills)
        }, status=status.HTTP_200_OK)
    
    # ========== Certification Management ==========
    
    @action(detail=True, methods=['post'], url_path='certifications')
    def add_certification(self, request, pk=None):
        """Add a certification to user profile"""
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
            credential_id=serializer.validated_data.get('credential_id', ''),
            request=request
        )
        
        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {'message': message},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['delete'], url_path='certifications/(?P<cert_name>[^/.]+)')
    def remove_certification(self, request, pk=None, cert_name=None):
        """Remove a certification from user profile"""
        profile = self.get_object()
        profile_service = ProfileService()
        success, message = profile_service.remove_certification(
            user=profile.user,
            cert_name=cert_name,
            request=request
        )
        
        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {'message': message},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'], url_path='certifications-summary')
    def certifications_summary(self, request, pk=None):
        """Get summary of user's certifications"""
        profile = self.get_object()
        profile_service = ProfileService()
        certifications = profile_service.get_certifications_summary(profile.user)
        
        return Response({
            'certifications': certifications,
            'count': len(certifications)
        }, status=status.HTTP_200_OK)
    
    # ========== Current User Profile Actions ==========
    
    @action(detail=False, methods=['get'], url_path='my')
    def my_profile(self, request):
        try:
            profile_service = ProfileService()
            profile = profile_service.get_profile(request.user)
            
            # If profile doesn't exist, create it
            if not profile:
                profile = Profile.objects.create(
                    user=request.user,
                    tenant_id=request.user.tenant_id,
                    employee_type='Full-time',
                    timezone='Africa/Nairobi'
                )
            
            serializer = ProfilDetailSerializer(profile, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error in my_profile: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Failed to load profile'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['patch'], url_path='my')
    def update_my_profile(self, request):
        """Update current user's profile"""
        profile_service = ProfileService()
        profile = profile_service.get_profile(request.user)
        
        serializer = ProfileUpdateSerializer(
            profile,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        success, message = profile_service.update_profile(
            user=request.user,
            data=serializer.validated_data,
            request=request
        )
        
        if not success:
            return Response(
                {'error': message},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_profile = profile_service.get_profile(request.user)
        response_serializer = ProfilDetailSerializer(
            updated_profile,
            context={'request': request}
        )
        
        return Response(
            response_serializer.data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='my/skills-summary')
    def my_skills_summary(self, request):
        """Get current user's skills summary"""
        profile_service = ProfileService()
        profile = profile_service.get_profile(request.user)
        skills = profile_service.get_skills_summary(profile.user)
        return Response({
            'skills': skills,
            'count': len(skills)
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='my/certifications-summary')
    def my_certifications_summary(self, request):
        """Get current user's certifications summary"""
        profile_service = ProfileService()
        profile = profile_service.get_profile(request.user)
        certifications = profile_service.get_certifications_summary(profile.user)
        return Response({
            'certifications': certifications,
            'count': len(certifications)
        }, status=status.HTTP_200_OK)