from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from ..permissions import IsTenantUser
from ..throttles.reviews_api_throttle import ReviewsAPIThrottle

class BaseReviewViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsTenantUser]
    throttle_classes = [ReviewsAPIThrottle]
    
    def get_queryset(self):
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
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"perform_create called for model: {serializer.Meta.model}")
        logger.error(f"Serializer data: {serializer.validated_data}")
        logger.error(f"Request user: {self.request.user}")
        logger.error(f"User has tenant: {hasattr(self.request.user, 'tenant')}")
        logger.error(f"User tenant: {self.request.user.tenant if hasattr(self.request.user, 'tenant') else None}")
        
        save_kwargs = {}
        # Add created_by if model has it
        if hasattr(serializer.Meta.model, 'created_by'):
            save_kwargs['created_by'] = self.request.user
            logger.error(f"Adding created_by: {self.request.user}")
        # Add tenant if model has it and user has tenant
        if hasattr(serializer.Meta.model, 'tenant') and hasattr(self.request.user, 'tenant'):
            save_kwargs['tenant'] = self.request.user.tenant
            logger.error(f"Adding tenant: {self.request.user.tenant}")
        
        try:
            instance = serializer.save(**save_kwargs)
            logger.error(f"Instance created successfully: {instance}")
            return instance
        except Exception as e:
            logger.exception(f"Error in serializer.save: {e}")
            raise
    
    def handle_exception(self, exc):
        """
        Handle exceptions with consistent response format.
        """
        import logging
        logger = logging.getLogger(__name__)
        logger.exception(f"Caught exception: {exc}")
        
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


class BaseReadOnlyReviewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Base ReadOnly ViewSet for models that only need GET access.
    """
    
    permission_classes = [IsAuthenticated, IsTenantUser]
    throttle_classes = [ReviewsAPIThrottle]
    
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
    throttle_classes = [ReviewsAPIThrottle]
    
    def get_queryset(self):
        """Filter queryset by tenant."""
        queryset = super().get_queryset()
        
        if hasattr(self.request.user, 'tenant'):
            if hasattr(queryset.model, 'tenant'):
                queryset = queryset.filter(tenant=self.request.user.tenant)
        
        return queryset
