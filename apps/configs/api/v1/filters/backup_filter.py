from django_filters import rest_framework as filters
from apps.configs.models import BackupJob, BackupArtifact, BackupPolicy

class BackupJobFilter(filters.FilterSet):
    app_name = filters.CharFilter(field_name='app__name', lookup_expr='exact')
    backup_type = filters.ChoiceFilter(choices=BackupJob.BACKUP_TYPE_CHOICES)
    status = filters.ChoiceFilter(choices=BackupJob.STATUS_CHOICES)
    triggered_by_role = filters.CharFilter(field_name='triggered_by_role')
    started_after = filters.DateTimeFilter(field_name='started_at', lookup_expr='gte')
    started_before = filters.DateTimeFilter(field_name='started_at', lookup_expr='lte')
    completed_after = filters.DateTimeFilter(field_name='completed_at', lookup_expr='gte')
    completed_before = filters.DateTimeFilter(field_name='completed_at', lookup_expr='lte')
    min_size_bytes = filters.NumberFilter(field_name='size_bytes', lookup_expr='gte')
    max_size_bytes = filters.NumberFilter(field_name='size_bytes', lookup_expr='lte')
    has_error = filters.BooleanFilter(method='filter_has_error')
    def filter_has_error(self, queryset, name, value):
        if value:
            return queryset.exclude(error_message='')
        return queryset.filter(error_message='')
    class Meta:
        model = BackupJob
        fields = ['app_name', 'backup_type', 'status', 'triggered_by_role', 'triggered_by']

class BackupArtifactFilter(filters.FilterSet):
    storage_location = filters.ChoiceFilter(choices=BackupArtifact.STORAGE_LOCATION_CHOICES)
    status = filters.ChoiceFilter(choices=BackupArtifact.STATUS_CHOICES)
    verified_after = filters.DateTimeFilter(field_name='verified_at', lookup_expr='gte')
    verified_before = filters.DateTimeFilter(field_name='verified_at', lookup_expr='lte')
    restored_after = filters.DateTimeFilter(field_name='restored_at', lookup_expr='gte')
    restored_before = filters.DateTimeFilter(field_name='restored_at', lookup_expr='lte')
    is_verified = filters.BooleanFilter(method='filter_is_verified')
    def filter_is_verified(self, queryset, name, value):
        if value:
            return queryset.filter(status='verified')
        return queryset.exclude(status='verified')
    class Meta:
        model = BackupArtifact
        fields = ['storage_location', 'status']

class BackupPolicyFilter(filters.FilterSet):
    app_name = filters.CharFilter(field_name='app__name', lookup_expr='exact')
    backup_type = filters.ChoiceFilter(choices=BackupPolicy.BACKUP_TYPE_CHOICES)
    status = filters.ChoiceFilter(choices=BackupPolicy.BACKUP_STATUS_CHOICES)
    encryption_enabled = filters.BooleanFilter(field_name='encryption_enabled')
    compression_enabled = filters.BooleanFilter(field_name='compression_enabled')
    class Meta:
        model = BackupPolicy
        fields = ['app_name', 'backup_type', 'status', 'encryption_enabled', 'compression_enabled']