import logging
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from django.utils import timezone 
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.models import User
from apps.accounts.managers import UserManager
from apps.accounts.services import (
    PasswordService, InvitationService, RBACService, 
    AuthenticationService, SessionService, AuditService
)
from apps.accounts.api.v1.throttles import AnonRateThrottle
from apps.accounts.api.v1.serializers import (
    UserSerializer, UserCreationSerializer, UserUpdateSerializer, 
    UserListSerializer, UserMinimalSerializer, UserDetailSerializer, 
    UserProfileSerializer, PasswordChangeSerializer, InvitationSerializer
)
from apps.accounts.api.v1.serializers.registration import InvitationAcceptSerializer
from apps.accounts.api.v1.filters import UserFilter
from apps.accounts.api.v1.permissions import (
    IsSuperAdmin, IsClientAdmin, IsExecutive, IsSupervisor,
    CanAccessUser, CanManageUser, CanAssignRole, AllowAny
)
from .base import BaseModelViewset

logger = logging.getLogger(__name__)


class UserViewSet(BaseModelViewset):
    queryset = User.objects.all()
    filterset_class = UserFilter
    search_fields = ['email', 'username', 'first_name', 'last_name', 'employee_id']
    ordering_fields = ['email', 'created_at', 'last_login', 'first_name', 'last_name', 'role']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        action_serializers = {
            'create': UserCreationSerializer,
            'update': UserUpdateSerializer,
            'partial_update': UserUpdateSerializer,
            'list': UserListSerializer,
            'retrieve': UserDetailSerializer,
            'profile': UserProfileSerializer,
        }
        return action_serializers.get(self.action, UserSerializer)
    
    def get_permissions(self):
        admin_actions = ['create', 'update', 'partial_update', 'destroy', 'invite']
        read_actions = ['list', 'retrieve']
        if self.action in admin_actions:
            self.permission_classes = [IsAuthenticated, CanManageUser]
        elif self.action in read_actions:
            self.permission_classes = [IsAuthenticated, CanAccessUser]
        elif self.action == 'assign_role':
            self.permission_classes = [IsAuthenticated, CanAssignRole]
        else:
            self.permission_classes = [IsAuthenticated]
        return super().get_permissions()
    
    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.select_related('manager')
        if not self.request.user.is_superuser:
            qs = qs.filter(tenant_id=self.request.user.tenant_id)
        return qs
    
    @action(detail=True, methods=['post'], url_path='change-password')
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        password_service = PasswordService()
        success, message = password_service.change_password(
            user=user,
            old_password=serializer.validated_data['old_password'],
            new_password=serializer.validated_data['new_password'],
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='assign-role')
    def assign_role(self, request, pk=None):
        user = self.get_object()
        role = request.data.get('role')
        if not role:
            return Response(
                {'error': 'Role is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        rbac_service = RBACService()
        success, message = rbac_service.assign_role(
            user=user,
            role_code=role,
            assigned_by=request.user,
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        user = self.get_object()
        if user.is_active:
            return Response(
                {'message': 'User is already active'},
                status=status.HTTP_200_OK
            )
        user.is_active = True
        user.save(update_fields=['is_active'])
        AuditService().log(
            user=request.user,
            action='user.activated',
            action_type='update',
            request=request,
            severity='info',
            metadata={'target_user_id': str(user.id), 'target_email': user.email}
        )
        return Response({'message': 'User activated successfully'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        user = self.get_object()
        if not user.is_active:
            return Response(
                {'message': 'User is already deactivated'},
                status=status.HTTP_200_OK
            )
        user.is_active = False
        user.save(update_fields=['is_active'])
        session_service = SessionService()
        terminated = session_service.terminate_all_sessions(user)
        AuditService().log(
            user=request.user,
            action='user.deactivated',
            action_type='update',
            request=request,
            severity='warning',
            metadata={
                'target_user_id': str(user.id),
                'target_email': user.email,
                'sessions_terminated': terminated,
            }
        )
        try:
            from apps.accounts.services.realtime import AccountsEventBroadcaster
            AccountsEventBroadcaster.user_deactivated(
                user_id=str(user.id),
                tenant_id=str(user.tenant_id),
                email=user.email,
                deactivated_by_id=str(request.user.id),
                sessions_terminated=terminated,
            )
        except ImportError:
            pass
        return Response({
            'message': 'User deactivated successfully',
            'sessions_terminated': terminated,
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], url_path='unlock')
    def unlock(self, request, pk=None):
        user = self.get_object()
        if not user.is_locked():
            return Response(
                {'message': 'User account is not locked'},
                status=status.HTTP_200_OK
            )
        user.reset_login_attempts()
        AuditService().log(
            user=request.user,
            action='user.unlocked',
            action_type='update',
            request=request,
            severity='info',
            metadata={'target_user_id': str(user.id), 'target_email': user.email}
        )
        return Response({'message': 'User unlocked successfully'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='team')
    def team(self, request, pk=None):
        user = self.get_object()
        team = user.get_team_members()
        serializer = UserListSerializer(team, many=True, context={'request': request})
        return Response({
            'manager': UserMinimalSerializer(user).data,
            'team_count': len(team),
            'team': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='reporting-chain')
    def reporting_chain(self, request, pk=None):
        user = self.get_object()
        chain = UserManager().get_reporting_chain(user.id)
        return Response({
            'reporting_chain': chain
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        user = request.user
        return Response({
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'username': user.username,
            'role': user.role,
            'is_superuser': user.is_superuser,
            'is_verified': user.is_verified,
            'is_active': user.is_active,
            'tenant_id': str(user.tenant_id),
            'date_joined': user.date_joined.isoformat() if user.date_joined else None,
            'last_login': user.last_login.isoformat() if user.last_login else None,
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], url_path='invite')
    def invite(self, request):
        serializer = InvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invitation_service = InvitationService()
        success, message = invitation_service.send_invitation(
            email=serializer.validated_data['email'],
            role=serializer.validated_data.get('role', 'staff'),
            tenant_id=str(request.user.tenant_id),
            invited_by=request.user,
            department_id=serializer.validated_data.get('department_id'),
            message=serializer.validated_data.get('message', ''),
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.id == request.user.id:
            return Response(
                {'error': 'You cannot delete your own account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.is_active = False
        instance.is_deleted = True
        instance.deleted_at = timezone.now()  # ✅ Now timezone is imported
        instance.save(update_fields=['is_active', 'is_deleted', 'deleted_at'])
        SessionService().terminate_all_sessions(instance)
        AuditService().log(
            user=request.user,
            action='user.deleted',
            action_type='delete',
            request=request,
            severity='warning',
            metadata={'target_user_id': str(instance.id), 'target_email': instance.email}
        )
        return Response(
            {'message': 'User deleted successfully'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=False, methods=['get'], url_path='me/team')
    def my_team(self, request):
        """Get current user's team members"""
        user = request.user
        team = user.get_team_members()
        serializer = UserListSerializer(team, many=True, context={'request': request})
        return Response({
            'manager': UserMinimalSerializer(user).data,
            'team_count': len(team),
            'team': serializer.data
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='me/reporting-chain')
    def my_reporting_chain(self, request):
        """Get current user's reporting chain"""
        user = request.user
        chain = UserManager().get_reporting_chain(user.id)
        return Response({
            'reporting_chain': chain
        }, status=status.HTTP_200_OK)

# Rest of the file remains the same...
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserDetailSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request):
        serializer = UserUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id=None):
        if user_id:
            user = get_object_or_404(
                User,
                id=user_id,
                tenant_id=request.user.tenant_id
            )
        else:
            user = request.user
        serializer = UserProfileSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        password_service = PasswordService()
        success, message = password_service.change_password(
            user=request.user,
            old_password=serializer.validated_data['old_password'],
            new_password=serializer.validated_data['new_password'],
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)

class UserInvitationsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        invitation_service = InvitationService()
        invitations = invitation_service.get_pending_invitations(str(request.user.tenant_id))
        return Response({'invitations': invitations}, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = InvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invitation_service = InvitationService()
        success, message = invitation_service.send_invitation(
            email=serializer.validated_data['email'],
            role=serializer.validated_data.get('role', 'staff'),
            tenant_id=str(request.user.tenant_id),
            invited_by=request.user,
            department_id=serializer.validated_data.get('department_id'),
            message=serializer.validated_data.get('message', ''),
            request=request
        )
        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': message}, status=status.HTTP_200_OK)


class InvitationAcceptView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]
    def post(self, request):
        serializer = InvitationAcceptSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invitation_service = InvitationService()
        user, error = invitation_service.accept_invitation(
            token=serializer.validated_data['token'],
            password=serializer.validated_data['password'],
            first_name=serializer.validated_data.get('first_name', ''),
            last_name=serializer.validated_data.get('last_name', ''),
            request=request
        )
        if error:
            return Response({'error': error}, status=status.HTTP_400_BAD_REQUEST)
        auth_service = AuthenticationService()
        ip_address = self._get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        _, tokens, _ = auth_service._complete_authentication(
            user=user,
            ip_address=ip_address,
            user_agent=user_agent,
            request=request
        )
        return Response({
            'message': 'Invitation accepted successfully',
            'tokens': tokens,
            'user': UserMinimalSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    def _get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '')