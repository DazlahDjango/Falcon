from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
import logging

logger = logging.getLogger(__name__)


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(viewsets.ViewSet):
    """
    ViewSet for user review/system notifications.
    Supports list, retrieve, mark_read, mark_all_read, unread_count, destroy.
    """
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination

    def _get_notification_model(self):
        try:
            from notifications.models import Notification
            return Notification
        except ImportError:
            return None

    def _serialize_notification(self, n):
        created_at = getattr(n, 'timestamp', None) or getattr(n, 'created_at', None)
        data = getattr(n, 'data', {}) or {}
        if not isinstance(data, dict):
            data = {}

        return {
            'id': n.id,
            'title': getattr(n, 'verb', '') or '',
            'message': getattr(n, 'description', '') or '',
            'notification_type': data.get('notification_type') or getattr(n, 'verb', ''),
            'link': data.get('link'),
            'created_at': created_at.isoformat() if created_at else None,
            'is_read': not getattr(n, 'unread', False),
            'level': getattr(n, 'level', 'info'),
            'data': data,
        }

    def list(self, request):
        NotificationModel = self._get_notification_model()
        if not NotificationModel:
            return Response({'count': 0, 'results': [], 'next': None, 'previous': None})

        try:
            field_names = {field.name for field in NotificationModel._meta.fields}
            ordering = '-timestamp' if 'timestamp' in field_names else '-id'

            queryset = NotificationModel.objects.filter(recipient=request.user)

            # Filter by unread if requested
            unread_filter = request.query_params.get('unread')
            if unread_filter is not None:
                is_unread = unread_filter.lower() in ('true', '1')
                queryset = queryset.filter(unread=is_unread)

            queryset = queryset.order_by(ordering)

            paginator = self.pagination_class()
            page = paginator.paginate_queryset(queryset, request)
            if page is not None:
                data = [self._serialize_notification(n) for n in page]
                return paginator.get_paginated_response(data)

            data = [self._serialize_notification(n) for n in queryset]
            return Response({'count': len(data), 'results': data, 'next': None, 'previous': None})
        except Exception as e:
            logger.warning(f"Error listing notifications: {e}")
            return Response({'count': 0, 'results': [], 'next': None, 'previous': None})

    def retrieve(self, request, pk=None):
        NotificationModel = self._get_notification_model()
        if not NotificationModel:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            notification = NotificationModel.objects.get(id=pk, recipient=request.user)
            return Response(self._serialize_notification(notification))
        except NotificationModel.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving notification {pk}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        NotificationModel = self._get_notification_model()
        if not NotificationModel:
            return Response({'count': 0})

        try:
            count = NotificationModel.objects.filter(recipient=request.user, unread=True).count()
            return Response({'count': count})
        except Exception as e:
            logger.warning(f"Error fetching unread count: {e}")
            return Response({'count': 0})

    @action(detail=True, methods=['post'], url_path='mark-read')
    def mark_read(self, request, pk=None):
        NotificationModel = self._get_notification_model()
        if not NotificationModel:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            notification = NotificationModel.objects.get(id=pk, recipient=request.user)
            notification.unread = False
            notification.save(update_fields=['unread'])
            return Response(self._serialize_notification(notification))
        except NotificationModel.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error marking notification {pk} as read: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        NotificationModel = self._get_notification_model()
        if not NotificationModel:
            return Response({'status': 'ok', 'updated': 0})

        try:
            updated = NotificationModel.objects.filter(recipient=request.user, unread=True).update(unread=False)
            return Response({'status': 'ok', 'updated': updated})
        except Exception as e:
            logger.error(f"Error marking all notifications as read: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        NotificationModel = self._get_notification_model()
        if not NotificationModel:
            return Response(status=status.HTTP_204_NO_CONTENT)

        try:
            NotificationModel.objects.filter(id=pk, recipient=request.user).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting notification {pk}: {e}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
