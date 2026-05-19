from rest_framework import serializers
from apps.configs.models import BackupQuota

class BackupQuotaSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    app_name = serializers.CharField(source='app.name', read_only=True)
    total_storage_gb = serializers.SerializerMethodField()
    used_storage_gb = serializers.SerializerMethodField()
    usage_percent = serializers.SerializerMethodField()
    class Meta:
        model = BackupQuota
        fields = ['id', 'tenant', 'tenant_name', 'app', 'app_name', 'total_backup_storage_bytes', 'total_storage_gb', 'used_backup_storage_bytes', 'used_storage_gb', 'usage_percent', 'max_backup_count', 'max_restore_per_day', 'backup_retention_days_override', 'warning_threshold_percent', 'alert_sent_at', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'used_backup_storage_bytes', 'alert_sent_at']
    def get_total_storage_gb(self, obj):
        return round(obj.total_backup_storage_bytes / (1024**3), 2)
    def get_used_storage_gb(self, obj):
        return round(obj.used_backup_storage_bytes / (1024**3), 2)
    def get_usage_percent(self, obj):
        if obj.total_backup_storage_bytes > 0:
            return round((obj.used_backup_storage_bytes / obj.total_backup_storage_bytes) * 100, 2)
        return 0

class BackupQuotaUpdateSerializer(serializers.Serializer):
    total_backup_storage_bytes = serializers.IntegerField(min_value=1073741824, max_value=1099511627776, required=False)
    max_backup_count = serializers.IntegerField(min_value=10, max_value=10000, required=False)
    max_restore_per_day = serializers.IntegerField(min_value=1, max_value=1000, required=False)
    warning_threshold_percent = serializers.IntegerField(min_value=50, max_value=100, required=False)