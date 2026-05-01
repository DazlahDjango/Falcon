from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

class ReportingChainNodeSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    role_in_chain = serializers.CharField()
    position_title = serializers.CharField(allow_null=True)
    position_code = serializers.CharField(allow_null=True)
    department_name = serializers.CharField(allow_null=True)
    is_manager = serializers.BooleanField()
    is_executive = serializers.BooleanField()
    relation_type = serializers.CharField(required=False)
    reporting_weight = serializers.FloatField(required=False)
    depth = serializers.IntegerField(required=False)

class ReportingChainSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    managers = ReportingChainNodeSerializer(many=True)
    subordinates = ReportingChainNodeSerializer(many=True)
    direct_report_count = serializers.IntegerField()
    management_level = serializers.IntegerField()

class SpanOfControlSerializer(serializers.Serializer):
    manager_user_id = serializers.UUIDField()
    direct_reports = serializers.IntegerField()
    indirect_reports = serializers.IntegerField()
    total_reports = serializers.IntegerField()
    is_healthy = serializers.BooleanField()
    warning = serializers.BooleanField()

class OrganizationSpanReportSerializer(serializers.Serializer):
    managers = SpanOfControlSerializer(many=True)
    average_direct = serializers.FloatField()
    average_indirect = serializers.FloatField()
    average_total = serializers.FloatField()
    distribution = serializers.DictField()
    managers_with_warning = SpanOfControlSerializer(many=True)