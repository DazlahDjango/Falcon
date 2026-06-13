# history.py
from rest_framework import serializers
from ....models import KPIHistory, ActualHistory, TargetHistory


class KPIHistorySerializer(serializers.ModelSerializer):
    performed_by_email = serializers.EmailField(source='performed_by.email', read_only=True, default=None)
    kpi_name = serializers.CharField(source='kpi.name', read_only=True)

    class Meta:
        model = KPIHistory
        fields = [
            'id', 'kpi', 'kpi_name', 'action', 'snapshot', 'changes',
            'reason', 'performed_by', 'performed_by_email', 'performed_at'
        ]
        read_only_fields = ['id', 'performed_at']


class ActualHistorySerializer(serializers.ModelSerializer):
    performed_by_email = serializers.EmailField(source='performed_by.email', read_only=True, default=None)
    kpi_name = serializers.CharField(source='actual.kpi.name', read_only=True)
    user_name = serializers.CharField(source='actual.user.email', read_only=True)

    class Meta:
        model = ActualHistory
        fields = [
            'id', 'actual', 'kpi_name', 'user_name', 'action', 'old_value', 'new_value',
            'reason', 'performed_by', 'performed_by_email', 'performed_at'
        ]
        read_only_fields = ['id', 'performed_at']


class TargetHistorySerializer(serializers.ModelSerializer):
    performed_by_email = serializers.EmailField(source='performed_by.email', read_only=True, default=None)
    kpi_name = serializers.CharField(source='annual_target.kpi.name', read_only=True)
    user_name = serializers.CharField(source='annual_target.user.email', read_only=True)

    class Meta:
        model = TargetHistory
        fields = [
            'id', 'annual_target', 'kpi_name', 'user_name', 'action', 'old_value',
            'new_value', 'notes', 'performed_by', 'performed_by_email', 'performed_at'
        ]
        read_only_fields = ['id', 'performed_at']