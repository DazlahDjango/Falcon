from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import UserSession
from apps.accounts.services import SessionService
from apps.accounts.api.v1.serializers import UserSessionSerializer, UserSessionListSerializer, UserSessionDetailSerializer
from apps.accounts.api.v1.filters import SessionFilter
from apps.accounts.api.v1.permissions import IsSuperAdmin, IsClientAdmin
from .base import BaseReadOnlyViewset

class SessionViewSet(BaseReadOnlyViewset):
    """
    Session ViewSet for viewing user sessions.
    """
    queryset = UserSession.objects.all()
    filterset_class = SessionFilter
    search_fields = ['ip_address', 'user_agent']
    ordering_fields = ['login_time', 'last_activity', 'expires_at']
    ordering = ['-login_time']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserSessionListSerializer
        elif self.action == 'retrieve':
            return UserSessionDetailSerializer
        return UserSessionSerializer
    
    def get_queryset(self):
        qs = super().get_queryset()
        if not self.request.user.is_superuser and self.request.user.role != 'client_admin':
            qs = qs.filter(user=self.request.user)
        return qs
    
    @action(detail=False, methods=['post'], url_path='terminate-all')
    def terminate_all(self, request):
        session_service = SessionService()
        count = session_service.terminate_all_sessions(
            user=request.user,
            except_session_id=getattr(request, 'current_session_id', None)
        )
        return Response({'message': f'{count} sessions terminated'}, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='current')
    def current_session(self, request):
        session_id = getattr(request, 'current_session_id', None)
        if not session_id:
            return Response({'error': 'No active session found'}, status=status.HTTP_404_NOT_FOUND)
        session_service = SessionService()
        session_info = session_service.get_session_info(session_id)
        if not session_info:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(session_info, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='active')
    def active_sessions(self, request):
        session_service = SessionService()
        sessions = session_service.get_active_sessions(request.user)
        serializer = UserSessionListSerializer(sessions, many=True, context={'request': request})
        return Response({
            'count': len(sessions),
            'sessions': serializer.data
        }, status=status.HTTP_200_OK)