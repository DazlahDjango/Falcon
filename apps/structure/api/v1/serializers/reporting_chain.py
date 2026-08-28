from rest_framework import serializers
from django.utils.translation import gettext_lazy as _

class ReportingChainNodeSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    user_name = serializers.CharField(required=False, allow_null=True)
    user_email = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    role_in_chain = serializers.CharField(required=False, allow_null=True)
    position = serializers.CharField(required=False, allow_null=True)
    position_title = serializers.CharField(required=False, allow_null=True)
    position_code = serializers.CharField(required=False, allow_null=True)
    department_name = serializers.CharField(required=False, allow_null=True)
    division_name = serializers.CharField(required=False, allow_null=True)
    is_manager = serializers.BooleanField(default=False)
    is_executive = serializers.BooleanField(default=False)
    is_interim = serializers.BooleanField(default=False)
    interim_id = serializers.CharField(required=False, allow_null=True)
    effective_to = serializers.CharField(required=False, allow_null=True)
    relation_type = serializers.CharField(required=False, allow_null=True)
    reporting_weight = serializers.FloatField(required=False, default=1.0)
    depth = serializers.IntegerField(required=False, default=0)

class ReportingChainSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    managers = ReportingChainNodeSerializer(many=True)
    subordinates = ReportingChainNodeSerializer(many=True)
    direct_report_count = serializers.IntegerField()
    management_level = serializers.IntegerField()

class SpanOfControlSerializer(serializers.Serializer):
    manager_user_id = serializers.UUIDField()
    manager_name = serializers.CharField(required=False, allow_null=True)
    manager_email = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    manager_position = serializers.CharField(required=False, allow_null=True)
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