from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType
from apps.reviews.models import ReviewComment
from apps.reviews.api.v1.serializers import ReviewCommentSerializer, ReviewCommentCreateSerializer, ReviewCommentResolveSerializer
from .base_views import BaseReviewViewSet
from apps.accounts.constants import UserRoles

class ReviewCommentViewSet(BaseReviewViewSet):
    queryset = ReviewComment.objects.all()
    def get_serializer_class(self):
        return ReviewCommentCreateSerializer if self.action == 'create' else ReviewCommentSerializer
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'resolve']:
            self.permission_classes = [lambda: self.request.user.role in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN] or self.request.user.id == self.get_object().author_id]
        return super().get_permissions()
    def perform_create(self, serializer):
        serializer.save(author=self.request.user, tenant_id=self.request.user.tenant_id)
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        comment = self.get_object()
        if comment.is_resolved:
            return Response({'error': 'Comment already resolved'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ReviewCommentResolveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment.is_resolved = True
        comment.resolved_at = timezone.now()
        comment.resolved_by = request.user
        comment.save()
        return Response(self.get_serializer(comment).data)
    @action(detail=True, methods=['post'])
    def unresolve(self, request, pk=None):
        comment = self.get_object()
        if not comment.is_resolved:
            return Response({'error': 'Comment not resolved'}, status=status.HTTP_400_BAD_REQUEST)
        comment.is_resolved = False
        comment.resolved_at = None
        comment.resolved_by = None
        comment.save()
        return Response(self.get_serializer(comment).data)
    @action(detail=True, methods=['post'])
    def edit(self, request, pk=None):
        comment = self.get_object()
        if comment.author_id != request.user.id and request.user.role not in [UserRoles.SUPER_ADMIN, UserRoles.CLIENT_ADMIN]:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        new_comment = request.data.get('comment')
        if not new_comment:
            return Response({'error': 'Comment required'}, status=status.HTTP_400_BAD_REQUEST)
        edit_history = comment.edit_history or []
        edit_history.append({'old_comment': comment.comment, 'edited_at': timezone.now().isoformat(), 'edited_by': str(request.user.id)})
        comment.comment = new_comment
        comment.edited_at = timezone.now()
        comment.edit_history = edit_history
        comment.save()
        return Response(self.get_serializer(comment).data)
    @action(detail=False, methods=['get'], url_path='for-object')
    def for_object(self, request):
        content_type_id = request.query_params.get('content_type')
        object_id = request.query_params.get('object_id')
        if not content_type_id or not object_id:
            return Response({'error': 'content_type and object_id required'}, status=status.HTTP_400_BAD_REQUEST)
        comments = self.get_queryset().filter(content_type_id=content_type_id, object_id=object_id, parent_comment__isnull=True)
        return Response(self.get_serializer(comments, many=True).data)
    @action(detail=False, methods=['get'], url_path='replies/(?P<parent_id>[^/.]+)')
    def replies(self, request, parent_id=None):
        comments = self.get_queryset().filter(parent_comment_id=parent_id)
        return Response(self.get_serializer(comments, many=True).data)