from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q
from ..serializers import KPIListSerializer, AnnualTargetSerializer, ScoreSerializer, MonthlyActualSerializer
from ....models import KPI, AnnualTarget, Score, MonthlyActual
from ..permissions import IsAuthenticatedAndActive, IsManager

User = get_user_model()

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticatedAndActive]
    
    def get_queryset(self):
        queryset = User.objects.filter(is_active=True, is_deleted=False)
        
        # Tenant isolation
        tenant_id = getattr(self.request, 'current_tenant_id', None)
        if not tenant_id and hasattr(self.request.user, 'tenant_id'):
            tenant_id = str(self.request.user.tenant_id)
        
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        
        # Role-based filtering
        user = self.request.user
        role = getattr(user, 'role', '')
        
        # Superusers and admins see all
        if user.is_superuser or role in ['super_admin', 'client_admin', 'executive']:
            return queryset
        
        # Managers see themselves + direct reports
        if user.get_direct_reports().exists() or role in ['manager', 'team_lead']:
            direct_report_ids = user.get_direct_reports().values_list('id', flat=True)
            return queryset.filter(Q(id=user.id) | Q(id__in=direct_report_ids))
        
        # Regular users only see themselves
        return queryset.filter(id=user.id)
    
    def retrieve(self, request, *args, **kwargs):
        """Allow users to view their own profile, managers to view team members."""
        user = self.get_object()
        requesting_user = request.user
        
        # Check if user has permission to view this specific user
        if user.id != requesting_user.id:
            role = getattr(requesting_user, 'role', '')
            is_manager = requesting_user.get_direct_reports().filter(id=user.id).exists()
            
            if not (requesting_user.is_superuser or 
                    role in ['super_admin', 'client_admin', 'executive'] or
                    is_manager):
                return Response(
                    {'error': 'You do not have permission to view this user'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        return super().retrieve(request, *args, **kwargs)


class UserKPIsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = KPIListSerializer
    permission_classes = [IsAuthenticatedAndActive]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        requesting_user = self.request.user
        
        # Permission check
        if str(user_id) != str(requesting_user.id):
            role = getattr(requesting_user, 'role', '')
            is_manager = requesting_user.get_direct_reports().filter(id=user_id).exists()
            
            if not (requesting_user.is_superuser or 
                    role in ['super_admin', 'client_admin', 'executive'] or
                    is_manager):
                return KPI.objects.none()
        
        return KPI.objects.filter(owner_id=user_id, is_active=True)


class UserTargetsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AnnualTargetSerializer
    permission_classes = [IsAuthenticatedAndActive]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        requesting_user = self.request.user
        
        if str(user_id) != str(requesting_user.id):
            role = getattr(requesting_user, 'role', '')
            is_manager = requesting_user.get_direct_reports().filter(id=user_id).exists()
            
            if not (requesting_user.is_superuser or 
                    role in ['super_admin', 'client_admin', 'executive'] or
                    is_manager):
                return AnnualTarget.objects.none()
        
        return AnnualTarget.objects.filter(user_id=user_id).select_related('kpi')


class UserScoresViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ScoreSerializer
    permission_classes = [IsAuthenticatedAndActive]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        requesting_user = self.request.user
        
        if str(user_id) != str(requesting_user.id):
            role = getattr(requesting_user, 'role', '')
            is_manager = requesting_user.get_direct_reports().filter(id=user_id).exists()
            
            if not (requesting_user.is_superuser or 
                    role in ['super_admin', 'client_admin', 'executive'] or
                    is_manager):
                return Score.objects.none()
        
        return Score.objects.filter(user_id=user_id).select_related('kpi')


class UserActualsViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MonthlyActualSerializer
    permission_classes = [IsAuthenticatedAndActive]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_pk')
        requesting_user = self.request.user
        
        if str(user_id) != str(requesting_user.id):
            role = getattr(requesting_user, 'role', '')
            is_manager = requesting_user.get_direct_reports().filter(id=user_id).exists()
            
            if not (requesting_user.is_superuser or 
                    role in ['super_admin', 'client_admin', 'executive'] or
                    is_manager):
                return MonthlyActual.objects.none()
        
        return MonthlyActual.objects.filter(user_id=user_id).select_related('kpi')