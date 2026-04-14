from rest_framework import serializers

class KPIScoreCardSerializer(serializers.Serializer):
    kpi_id = serializers.UUIDField()
    kpi_name = serializers.CharField()
    score = serializers.FloatField()
    status = serializers.CharField()
    status_display = serializers.CharField()
    actual_value = serializers.FloatField()
    target_value = serializers.FloatField()
    unit = serializers.CharField()
    trend = serializers.DictField(required=False)

class TeamMemberSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()
    score = serializers.FloatField()
    status = serializers.CharField()
    kpi_count = serializers.IntegerField()

class IndividualDashboardSerializer(serializers.Serializer):
    user_id = serializers.UUIDField()
    period = serializers.CharField()
    overall_score = serializers.FloatField()
    kpi_count = serializers.IntegerField()
    kpis = KPIScoreCardSerializer(many=True)
    recent_activity = serializers.ListField()
    achievements = serializers.ListField(required=False)

class ManagerDashboardSerializer(serializers.Serializer):
    manager_id = serializers.UUIDField()
    period = serializers.CharField()
    manager_score = serializers.FloatField()
    manager_status = serializers.CharField()
    team_size = serializers.IntegerField()
    team_avg_score = serializers.FloatField()
    status_distribution = serializers.DictField()
    pending_validations = serializers.IntegerField()
    missing_submissions = serializers.IntegerField()
    team_members = TeamMemberSerializer(many=True)
    recent_team_activity = serializers.ListField(required=False)

class DepartmentRankingSerializer(serializers.Serializer):
    department_id = serializers.UUIDField()
    department = serializers.CharField()
    score = serializers.FloatField()
    rank = serializers.IntegerField()

class ExecutiveDashboardSerializer(serializers.Serializer):
    tenant_id = serializers.UUIDField()
    period = serializers.CharField()
    overall_health = serializers.FloatField()
    red_kpi_count = serializers.IntegerField()
    red_kpi_percentage = serializers.FloatField()
    validation_compliance = serializers.FloatField()
    department_rankings = DepartmentRankingSerializer(many=True)
    trend_data = serializers.ListField()
    risk_indicators = serializers.DictField(required=False)

class DepartmentComplianceSerializer(serializers.Serializer):
    department = serializers.CharField()
    total_members = serializers.IntegerField()
    submitted = serializers.IntegerField()
    compliance_rate = serializers.FloatField()

class RedAlertSerializer(serializers.Serializer):
    kpi = serializers.CharField()
    user = serializers.EmailField()
    consecutive_months = serializers.IntegerField()
    score = serializers.FloatField()

class ChampionDashboardSerializer(serializers.Serializer):
    champion_id = serializers.UUIDField()
    period = serializers.CharField()
    department_compliance = DepartmentComplianceSerializer(many=True)
    organization_submission_rate = serializers.FloatField()
    pending_escalations = serializers.IntegerField()
    unvalidated_entries = serializers.IntegerField()
    red_kpi_alerts = RedAlertSerializer(many=True)