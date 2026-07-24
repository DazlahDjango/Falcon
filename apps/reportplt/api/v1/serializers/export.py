# apps/reportplt/api/v1/serializers/export.py
from rest_framework import serializers
from apps.reportplt.models import ReportExport
from apps.reportplt.constants import ReportFormat
from .common import BaseModelSerializer

class ExportBaseSerializer(BaseModelSerializer):
    """
    Base serializer for ReportExport model.
    """
    format_display = serializers.CharField(source='get_format_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_ready = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ReportExport
        fields = [
            'id', 'report', 'execution', 'format', 'format_display',
            'status', 'status_display', 'exported_by', 'file_path',
            'file_name', 'file_size', 'size_display', 'file_hash',
            'mime_type', 'page_count', 'is_compressed', 'is_encrypted',
            'password_protected', 'has_watermark', 'watermark_text',
            'delivered_via', 'delivered_at', 'download_count',
            'last_downloaded_at', 'expires_at', 'export_config',
            'department', 'team', 'created_at', 'updated_at',
            'created_by', 'modified_by', 'tenant_id', 'is_deleted',
            'is_ready', 'is_expired'
        ]
        read_only_fields = [
            'id', 'status', 'file_path', 'file_name', 'file_size',
            'file_hash', 'mime_type', 'page_count', 'delivered_at',
            'download_count', 'last_downloaded_at', 'created_at',
            'updated_at', 'tenant_id', 'is_deleted'
        ]
    
    def get_is_ready(self, obj):
        return obj.is_ready()
    
    def get_is_expired(self, obj):
        return obj.is_expired()
    
    def get_size_display(self, obj):
        if obj.file_size:
            if obj.file_size < 1024:
                return f"{obj.file_size}B"
            elif obj.file_size < 1024 * 1024:
                return f"{obj.file_size / 1024:.2f}KB"
            elif obj.file_size < 1024 * 1024 * 1024:
                return f"{obj.file_size / (1024 * 1024):.2f}MB"
            else:
                return f"{obj.file_size / (1024 * 1024 * 1024):.2f}GB"
        return None

class ExportListSerializer(ExportBaseSerializer):
    """
    List serializer for ReportExport.
    """
    report_name = serializers.SerializerMethodField()
    exported_by_name = serializers.SerializerMethodField()
    
    class Meta(ExportBaseSerializer.Meta):
        fields = [
            'id', 'report', 'report_name', 'format', 'format_display',
            'status', 'status_display', 'file_name', 'size_display',
            'exported_by_name', 'created_at', 'is_ready', 'is_expired'
        ]
    
    def get_report_name(self, obj):
        if obj.report:
            return obj.report.name
        return None
    
    def get_exported_by_name(self, obj):
        if obj.exported_by:
            return obj.exported_by.get_full_name()
        return None

class ExportDetailSerializer(ExportBaseSerializer):
    """
    Detailed serializer for ReportExport.
    """
    report_name = serializers.SerializerMethodField()
    exported_by_name = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()
    
    class Meta(ExportBaseSerializer.Meta):
        fields = ExportBaseSerializer.Meta.fields + [
            'report_name', 'exported_by_name', 'download_url'
        ]
    
    def get_report_name(self, obj):
        if obj.report:
            return obj.report.name
        return None
    
    def get_exported_by_name(self, obj):
        if obj.exported_by:
            return obj.exported_by.get_full_name()
        return None
    
    def get_download_url(self, obj):
        request = self.context.get('request')
        if request and obj.is_ready() and not obj.is_expired():
            return request.build_absolute_uri(f"/api/v1/exports/{obj.id}/download/")
        return None

class ExportCreateSerializer(serializers.Serializer):
    """
    Create serializer for ReportExport.
    """
    report_id = serializers.UUIDField(required=True)
    format = serializers.ChoiceField(choices=ReportFormat.CHOICES, required=True)
    params = serializers.DictField(required=False, default=dict)
    password = serializers.CharField(required=False, allow_blank=True)
    encrypt = serializers.BooleanField(required=False, default=False)
    watermark = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        request = self.context.get('request')
        if request:
            from apps.reportplt.models import Report
            from apps.reportplt.services.security.report_rbac import ReportRBAC
            try:
                report = Report.objects.get(id=attrs.get('report_id'))
                rbac = ReportRBAC(request.user)
                if not rbac.can_export_report(report, attrs.get('format')):
                    raise serializers.ValidationError("You do not have permission to export this report")
            except Report.DoesNotExist:
                raise serializers.ValidationError({"report_id": "Report not found"})
        return attrs

class ExportDownloadSerializer(serializers.Serializer):
    """
    Serializer for export download.
    """
    token = serializers.CharField(required=True)
    
    def validate_token(self, value):
        from apps.reportplt.services.security.export_security import ExportSecurity
        security = ExportSecurity()
        export_id, user_id, valid = security.verify_download_token(value)
        if not valid:
            raise serializers.ValidationError("Invalid or expired download token")
        return value