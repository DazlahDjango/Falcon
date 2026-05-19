# apps/reviews/api/v1/views/base_views.py
"""
Base view classes for Reviews API
"""

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError

from ..permissions import IsTenantUser
from ...v1.throttles import ReviewSubmissionThrottle


class BaseReviewViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet for all review models with common functionality.
    """
    
    permission_classes = [IsAuthenticated, IsTenantUser]
    throttle_classes = [ReviewSubmissionThrottle]
    
    def get_queryset(self):
        """
        Filter queryset by tenant automatically.
        """
        queryset = super().get_queryset()
        
        # Filter by tenant
        if hasattr(self.request.user, 'tenant'):
            if hasattr(queryset.model, 'tenant'):
                queryset = queryset.filter(tenant=self.request.user.tenant)
            elif hasattr(queryset.model, 'employee') and hasattr(queryset.model.employee, 'tenant'):
                queryset = queryset.filter(employee__tenant=self.request.user.tenant)
        
        return queryset
    
    def get_serializer_context(self):
        """
        Add request to serializer context.
        """
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context
    
    def perform_create(self, serializer):
        """
        Set created_by or tenant automatically.
        """
        if hasattr(serializer, 'created_by'):
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()
    
    def handle_exception(self, exc):
        """
        Handle exceptions with consistent response format.
        """
        if isinstance(exc, PermissionDenied):
            return Response(
                {'error': 'Permission denied', 'detail': str(exc)},
                status=status.HTTP_403_FORBIDDEN
            )
        elif isinstance(exc, NotFound):
            return Response(
                {'error': 'Not found', 'detail': str(exc)},
                status=status.HTTP_404_NOT_FOUND
            )
        elif isinstance(exc, ValidationError):
            return Response(
                {'error': 'Validation error', 'detail': exc.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().handle_exception(exc)


class BaseReviewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Base ReadOnly ViewSet for models that only need GET access.
    """
    
    permission_classes = [IsAuthenticated, IsTenantUser]
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        queryset = super().get_queryset()
        
        if hasattr(self.request.user, 'tenant'):
            if hasattr(queryset.model, 'tenant'):
                queryset = queryset.filter(tenant=self.request.user.tenant)
        
        return queryset


class BaseActionViewSet(viewsets.GenericViewSet):
    """
    Base ViewSet for action-only endpoints (no standard CRUD).
    """
    
    permission_classes = [IsAuthenticated, IsTenantUser]
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        queryset = super().get_queryset()
        
        if hasattr(self.request.user, 'tenant'):
            if hasattr(queryset.model, 'tenant'):
                queryset = queryset.filter(tenant=self.request.user.tenant)
        
        return queryset
