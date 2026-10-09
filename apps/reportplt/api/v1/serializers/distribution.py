from rest_framework import serializers
from apps.reportplt.models import DistributionList
from apps.accounts.models import User

class DistributionListSerializer(serializers.ModelSerializer):
    recipient_users = serializers.PrimaryKeyRelatedField(many=True, queryset=User.objects.all(), required=False, default=list)
    recipient_emails = serializers.JSONField(required=False, default=list)

    class Meta:
        model = DistributionList
        fields = ['id', 'tenant_id', 'name', 'description', 'recipient_emails', 'recipient_users', 'created_at']
        read_only_fields = ['id', 'tenant_id', 'created_at']
