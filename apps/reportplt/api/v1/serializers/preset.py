from rest_framework import serializers
from apps.reportplt.models import ReportPreset

class ReportPresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportPreset
        fields = ['id', 'tenant_id', 'template', 'name', 'layout_config', 'column_selection', 'sort_orders', 'created_at']
        read_only_fields = ['id', 'tenant_id', 'created_at']
