# apps/reportplt/api/v1/serializers/report.py
from rest_framework import serializers
from django.utils import timezone
from apps.reportplt.models import Report
from apps.reportplt.constants import ReportType, ReportStatus, ReportCategory, ReportFormat
from apps.reportplt.services.security.report_rbac import ReportRBAC
from apps.reportplt.services.generation.report_generator import ReportGenerator
from .common import BaseModelSerializer, AuditTrailSerializer, DynamicFieldsModelSerializer

class ReportBaseSerializer(BaseModelSerializer):
    """
    Base serializer for Report model.
    """
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    data_source_display = serializers.CharField(source='get_data_source_display', read_only=True)
    is_accessible = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = [
            'id', 'name', 'description', 'report_type', 'report_type_display',
            'status', 'status_display', 'default_format', 'category', 'category_display',
            'data_source', 'data_source_display', 'owner', 'is_scheduled', 'is_system',
            'is_published', 'is_archived', 'is_public', 'needs_refresh',
            'include_executive_summary', 'include_charts', 'include_tables',
            'include_commentary', 'config', 'parameters', 'filters', 'sorting',
            'grouping', 'aggregation', 'allowed_roles', 'allowed_departments',
            'tags', 'last_generated_at', 'generation_duration', 'row_count',
            'cache_ttl', 'version', 'created_at', 'updated_at', 'created_by',
            'modified_by', 'is_deleted', 'tenant_id', 'is_accessible'
        ]
        read_only_fields = [
            'id', 'status', 'last_generated_at', 'generation_duration',
            'row_count', 'version', 'created_at', 'updated_at', 'created_by',
            'modified_by', 'is_deleted', 'tenant_id'
        ]
    
    def get_is_accessible(self, obj):
        request = self.context.get('request')
        if request and request.user:
            rbac = ReportRBAC(request.user)
            return rbac.can_view_report(obj)
        return False

class ReportListSerializer(ReportBaseSerializer):
    """
    List serializer for Report model - lightweight.
    """
    class Meta(ReportBaseSerializer.Meta):
        fields = [
            'id', 'name', 'report_type', 'report_type_display', 'status',
            'status_display', 'category', 'category_display', 'is_published',
            'is_archived', 'last_generated_at', 'owner', 'is_accessible'
        ]

class ReportDetailSerializer(ReportBaseSerializer):
    """
    Detailed serializer for Report model.
    """
    owner_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    modified_by_name = serializers.SerializerMethodField()
    execution_count = serializers.SerializerMethodField()
    schedule_count = serializers.SerializerMethodField()
    
    class Meta(ReportBaseSerializer.Meta):
        fields = ReportBaseSerializer.Meta.fields + [
            'owner_name', 'created_by_name', 'modified_by_name',
            'execution_count', 'schedule_count'
        ]
    
    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.get_full_name()
        return None
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name()
        return None
    
    def get_modified_by_name(self, obj):
        if obj.modified_by:
            return obj.modified_by.get_full_name()
        return None
    
    def get_execution_count(self, obj):
        return obj.executions.count()
    
    def get_schedule_count(self, obj):
        return obj.schedules.count()

class ReportCreateSerializer(ReportBaseSerializer):
    """
    Create serializer for Report model.
    """
    class Meta(ReportBaseSerializer.Meta):
        fields = [
            'id', 'name', 'description', 'report_type', 'default_format',
            'category', 'data_source', 'include_executive_summary',
            'include_charts', 'include_tables', 'include_commentary',
            'config', 'parameters', 'filters', 'sorting', 'grouping',
            'aggregation', 'allowed_roles', 'allowed_departments',
            'tags', 'cache_ttl', 'is_public', 'is_published'
        ]
    
    def validate(self, attrs):
        request = self.context.get('request')
        if request and request.user:
            rbac = ReportRBAC(request.user)
            if not rbac.can_create_report(attrs.get('report_type')):
                raise serializers.ValidationError("You do not have permission to create this report")
        return attrs
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['tenant_id'] = request.tenant_id if request else None
        validated_data['created_by'] = request.user if request else None
        validated_data['status'] = ReportStatus.DRAFT
        validated_data['version'] = 1
        return super().create(validated_data)

class ReportUpdateSerializer(ReportBaseSerializer):
    """
    Update serializer for Report model.
    """
    class Meta(ReportBaseSerializer.Meta):
        fields = [
            'name', 'description', 'default_format', 'category',
            'include_executive_summary', 'include_charts', 'include_tables',
            'include_commentary', 'config', 'parameters', 'filters',
            'sorting', 'grouping', 'aggregation', 'allowed_roles',
            'allowed_departments', 'tags', 'cache_ttl', 'is_public',
            'is_published', 'is_archived'
        ]
    
    def update(self, instance, validated_data):
        validated_data['modified_by'] = self.context.get('request').user if self.context.get('request') else None
        validated_data['version'] = instance.version + 1
        if 'config' in validated_data:
            validated_data['needs_refresh'] = True
        return super().update(instance, validated_data)

class ReportGenerateSerializer(serializers.Serializer):
    """
    Serializer for report generation.
    """
    report_id = serializers.CharField(required=False, help_text="Report UUID or prebuilt report_type identifier")
    params = serializers.DictField(required=False, default=dict)
    async_mode = serializers.BooleanField(required=False, default=False)
    format = serializers.ChoiceField(choices=ReportFormat.CHOICES, required=False)
    
    def validate(self, attrs):
        request = self.context.get('request')
        report = self.context.get('report')
        view = self.context.get('view')
        
        if not report and view and hasattr(view, 'get_object'):
            try:
                report = view.get_object()
            except Exception:
                pass
                
        report_id = attrs.get('report_id')
        if not report and report_id:
            try:
                report = Report.objects.filter(id=report_id).first()
            except Exception:
                pass
                
        if request and report:
            rbac = ReportRBAC(request.user)
            if not rbac.can_generate_report(report):
                raise serializers.ValidationError("You do not have permission to generate this report")
        return attrs

class ReportExportSerializer(serializers.Serializer):
    """
    Serializer for report export.
    """
    report_id = serializers.CharField(required=False, help_text="Report UUID or prebuilt report_type identifier")
    format = serializers.ChoiceField(choices=ReportFormat.CHOICES, required=True)
    params = serializers.DictField(required=False, default=dict)
    password = serializers.CharField(required=False, allow_blank=True)
    encrypt = serializers.BooleanField(required=False, default=False)
    
    def validate(self, attrs):
        request = self.context.get('request')
        report = self.context.get('report')
        view = self.context.get('view')
        
        if not report and view and hasattr(view, 'get_object'):
            try:
                report = view.get_object()
            except Exception:
                pass
                
        report_id = attrs.get('report_id')
        if not report and report_id:
            try:
                report = Report.objects.filter(id=report_id).first()
            except Exception:
                pass
                
        if request and report:
            rbac = ReportRBAC(request.user)
            if not rbac.can_export_report(report, attrs.get('format')):
                raise serializers.ValidationError("You do not have permission to export this report")
        return attrs

class ReportStatusSerializer(serializers.ModelSerializer):
    """
    Serializer for report status updates.
    """
    status = serializers.ChoiceField(choices=ReportStatus.CHOICES)
    
    class Meta:
        model = Report
        fields = ['status', 'needs_refresh']
    
    def update(self, instance, validated_data):
        if validated_data.get('status') == ReportStatus.ARCHIVED:
            instance.is_archived = True
        elif instance.is_archived and validated_data.get('status') == ReportStatus.DRAFT:
            instance.is_archived = False
        return super().update(instance, validated_data)

class ReportActionSerializer(serializers.Serializer):
    """
    Serializer for report actions.
    """
    action = serializers.ChoiceField(choices=[
        ('publish', 'Publish'),
        ('unpublish', 'Unpublish'),
        ('archive', 'Archive'),
        ('restore', 'Restore'),
        ('refresh', 'Refresh'),
    ])
    
    def validate(self, attrs):
        request = self.context.get('request')
        report = self.context.get('report')
        if request and report:
            rbac = ReportRBAC(request.user)
            if attrs.get('action') in ['publish', 'unpublish']:
                if not rbac.can_edit_report(report):
                    raise serializers.ValidationError("You do not have permission to publish/unpublish this report")
        return attrs