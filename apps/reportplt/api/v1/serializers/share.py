# apps/reportplt/api/v1/serializers/share.py
from rest_framework import serializers
from apps.reportplt.models import ReportShare
from apps.reportplt.constants import ShareType, SharePermission
from .common import BaseModelSerializer

class ShareBaseSerializer(BaseModelSerializer):
    """
    Base serializer for ReportShare model.
    """
    share_type_display = serializers.CharField(source='get_share_type_display', read_only=True)
    permission_display = serializers.CharField(source='get_permission_display', read_only=True)
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportShare
        fields = [
            'id', 'report', 'shared_by', 'shared_with', 'share_type',
            'share_type_display', 'permission', 'permission_display',
            'share_link', 'share_token', 'is_active', 'expires_at',
            'last_accessed_at', 'access_count', 'password',
            'password_protected', 'message', 'include_attachments',
            'notify_recipient', 'created_at', 'updated_at',
            'created_by', 'modified_by', 'tenant_id', 'is_deleted',
            'is_valid'
        ]
        read_only_fields = [
            'id', 'share_link', 'share_token', 'last_accessed_at',
            'access_count', 'created_at', 'updated_at', 'tenant_id',
            'is_deleted'
        ]
    
    def get_is_valid(self, obj):
        return obj.is_valid()

class ShareListSerializer(ShareBaseSerializer):
    """
    List serializer for ReportShare.
    """
    report_name = serializers.SerializerMethodField()
    shared_by_name = serializers.SerializerMethodField()
    shared_with_name = serializers.SerializerMethodField()
    
    class Meta(ShareBaseSerializer.Meta):
        fields = [
            'id', 'report', 'report_name', 'shared_by', 'shared_by_name',
            'shared_with', 'shared_with_name', 'share_type',
            'share_type_display', 'permission', 'permission_display',
            'is_active', 'expires_at', 'access_count', 'is_valid'
        ]
    
    def get_report_name(self, obj):
        if obj.report:
            return obj.report.name
        return None
    
    def get_shared_by_name(self, obj):
        if obj.shared_by:
            return obj.shared_by.get_full_name()
        return None
    
    def get_shared_with_name(self, obj):
        if obj.shared_with:
            return obj.shared_with.get_full_name()
        return None

class ShareDetailSerializer(ShareBaseSerializer):
    """
    Detailed serializer for ReportShare.
    """
    report_name = serializers.SerializerMethodField()
    shared_by_name = serializers.SerializerMethodField()
    shared_with_name = serializers.SerializerMethodField()
    
    class Meta(ShareBaseSerializer.Meta):
        fields = ShareBaseSerializer.Meta.fields + [
            'report_name', 'shared_by_name', 'shared_with_name'
        ]
    
    def get_report_name(self, obj):
        if obj.report:
            return obj.report.name
        return None
    
    def get_shared_by_name(self, obj):
        if obj.shared_by:
            return obj.shared_by.get_full_name()
        return None
    
    def get_shared_with_name(self, obj):
        if obj.shared_with:
            return obj.shared_with.get_full_name()
        return None

class ShareCreateSerializer(ShareBaseSerializer):
    """
    Create serializer for ReportShare.
    """
    class Meta(ShareBaseSerializer.Meta):
        fields = [
            'report', 'shared_with', 'share_type', 'permission',
            'expires_at', 'password', 'password_protected',
            'message', 'include_attachments', 'notify_recipient'
        ]
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['tenant_id'] = request.tenant_id if request else None
        validated_data['created_by'] = request.user if request else None
        validated_data['shared_by'] = request.user if request else None
        share = super().create(validated_data)
        share.generate_share_link()
        return share

class ShareUpdateSerializer(ShareBaseSerializer):
    """
    Update serializer for ReportShare.
    """
    class Meta(ShareBaseSerializer.Meta):
        fields = [
            'permission', 'expires_at', 'is_active', 'password',
            'password_protected', 'message', 'include_attachments'
        ]

class ShareAccessSerializer(serializers.Serializer):
    """
    Serializer for accessing shared reports.
    """
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=False, allow_blank=True)