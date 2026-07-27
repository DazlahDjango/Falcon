from rest_framework import serializers
from apps.reportplt.models import DistributionList

class DistributionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DistributionList
        fields = ['id', 'tenant_id', 'name', 'description', 'recipient_emails', 'recipient_users', 'is_active', 'created_at']
        read_only_fields = ['id', 'tenant_id', 'created_at']
