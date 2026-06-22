from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from apps.reviews.models import ReviewComment
from .base_serializers import BaseTenantSerializer

class ReviewCommentSerializer(BaseTenantSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)
    comment_type_display = serializers.CharField(source='get_comment_type_display', read_only=True)
    visibility_display = serializers.CharField(source='get_visibility_display', read_only=True)
    parent_comment_id = serializers.UUIDField(source='parent_comment.id', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    replies_count = serializers.SerializerMethodField()
    def get_replies_count(self, obj):
        return obj.replies.filter(is_deleted=False).count()
    class Meta:
        model = ReviewComment
        fields = [
            'id', 'content_type', 'object_id', 'comment_type', 'comment_type_display',
            'comment', 'author', 'author_name', 'author_email',
            'visibility', 'visibility_display', 'parent_comment', 'parent_comment_id',
            'edited_at', 'edit_history', 'is_resolved', 'resolved_at',
            'resolved_by', 'resolved_by_name', 'replies_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'edited_at', 'resolved_at']

class ReviewCommentCreateSerializer(ReviewCommentSerializer):
    class Meta(ReviewCommentSerializer.Meta):
        read_only_fields = ['id', 'created_at', 'updated_at', 'author', 'edited_at', 'resolved_at']

class ReviewCommentResolveSerializer(serializers.Serializer):
    resolve = serializers.BooleanField(required=True)
    def validate(self, data):
        if not data.get('resolve'):
            raise serializers.ValidationError("Must confirm to resolve")
        return data