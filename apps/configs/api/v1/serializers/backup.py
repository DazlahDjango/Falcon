from rest_framework import serializers
from apps.configs.models import BackupPolicy, BackupJob, BackupJobDetail, BackupArtifact
from apps.configs.constants import BackupType, BackupStatus

class BackupPolicySerializer(serializers.ModelSerializer):
    app_name = serializers.CharField(source='app.name', read_only=True)
    class Meta:
        model = BackupPolicy
        fields = ['id', 'app', 'app_name', 'backup_type', 'status', 'schedule_cron', 'schedule_weekdays_only', 'retention_days', 'retention_full_weeks', 'retention_monthly', 'compression_enabled', 'compression_algorithm', 'encryption_enabled', 'encryption_algorithm', 'storage_class', 'incremental_chain_length', 'parallel_backup_workers', 'backup_timeout_minutes', 'pre_backup_hook', 'post_backup_hook', 'metadata', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class BackupJobSerializer(serializers.ModelSerializer):
    app_name = serializers.CharField(source='app.name', read_only=True)
    app_display_name = serializers.CharField(source='app.display_name', read_only=True)
    size_display = serializers.SerializerMethodField()
    duration_display = serializers.SerializerMethodField()
    class Meta:
        model = BackupJob
        fields = ['id', 'app', 'app_name', 'app_display_name', 'backup_type', 'status', 'triggered_by', 'triggered_by_role', 'started_at', 'completed_at', 'duration_seconds', 'duration_display', 'size_bytes', 'size_display', 'original_size_bytes', 'compression_ratio', 'checksum', 'parent_job', 'sequence_number', 'error_message', 'error_code', 'retry_count', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at', 'started_at', 'completed_at', 'duration_seconds', 'size_bytes', 'checksum']
    def get_size_display(self, obj):
        if obj.size_bytes:
            for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                if obj.size_bytes < 1024.0:
                    return f"{obj.size_bytes:.2f} {unit}"
                obj.size_bytes /= 1024.0
        return "N/A"
    def get_duration_display(self, obj):
        if obj.duration_seconds:
            minutes = obj.duration_seconds // 60
            seconds = obj.duration_seconds % 60
            return f"{minutes}m {seconds}s"
        return "N/A"

class BackupJobDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupJobDetail
        fields = ['id', 'backup_job', 'detail_type', 'name', 'rows_processed', 'size_bytes', 'status', 'error_message', 'completed_at']
        read_only_fields = ['id']

class BackupArtifactSerializer(serializers.ModelSerializer):
    backup_job_info = BackupJobSerializer(source='backup_job', read_only=True)
    class Meta:
        model = BackupArtifact
        fields = ['id', 'backup_job', 'backup_job_info', 'storage_location', 'storage_path', 'encrypted_key_id', 'iv_initialization_vector', 'status', 'verified_at', 'verification_checksum', 'download_url_expires_at', 'restored_at', 'restore_count', 'archived_at', 'archive_tier', 'created_at']
        read_only_fields = ['id', 'created_at', 'verified_at', 'restored_at', 'restore_count']

class BackupTriggerSerializer(serializers.Serializer):
    app_name = serializers.CharField(max_length=100)
    backup_type = serializers.ChoiceField(choices=BackupType.CHOICES)
    def validate_app_name(self, value):
        from apps.configs.models import RegisteredApp
        if not RegisteredApp.objects.filter(name=value, is_registered=True).exists():
            raise serializers.ValidationError(f"App {value} not registered or inactive")
        return value

class BackupRestoreSerializer(serializers.Serializer):
    backup_job_id = serializers.UUIDField()
    target_app_only = serializers.BooleanField(default=False)
    def validate_backup_job_id(self, value):
        from apps.configs.models import BackupJob
        job = BackupJob.objects.filter(id=value, status=BackupStatus.COMPLETED).first()
        if not job:
            raise serializers.ValidationError(f"Backup job {value} not found or not completed")
        return value