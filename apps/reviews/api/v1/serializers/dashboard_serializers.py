# apps/reviews/api/v1/serializers/dashboard_serializers.py
from rest_framework import serializers


class StaffEmployeeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    email = serializers.EmailField()
    department = serializers.CharField(allow_null=True, required=False)
    position = serializers.CharField(allow_null=True, required=False)


class StaffReviewCycleSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    cycle_type = serializers.CharField()
    cycle_type_display = serializers.CharField(required=False)
    status = serializers.CharField()
    start_date = serializers.CharField(allow_null=True)
    end_date = serializers.CharField(allow_null=True)
    self_assessment_deadline = serializers.CharField(allow_null=True)
    supervisor_review_deadline = serializers.CharField(allow_null=True)
    final_approval_deadline = serializers.CharField(allow_null=True)
    kpi_weight = serializers.FloatField(required=False, default=0.0)
    competency_weight = serializers.FloatField(required=False, default=0.0)
    require_self_assessment = serializers.BooleanField(required=False, default=True)
    require_360_feedback = serializers.BooleanField(required=False, default=False)


class StaffSelfAssessmentStatusSerializer(serializers.Serializer):
    id = serializers.UUIDField(allow_null=True, required=False)
    status = serializers.CharField()
    submitted = serializers.BooleanField()
    submitted_at = serializers.CharField(allow_null=True, required=False)
    deadline = serializers.CharField(allow_null=True, required=False)
    is_overdue = serializers.BooleanField(required=False, default=False)
    can_edit = serializers.BooleanField(required=False, default=False)
    competency_ratings_count = serializers.IntegerField(required=False, default=0)


class StaffSupervisorReviewStatusSerializer(serializers.Serializer):
    id = serializers.UUIDField(allow_null=True, required=False)
    status = serializers.CharField()
    submitted = serializers.BooleanField()
    submitted_at = serializers.CharField(allow_null=True, required=False)
    supervisor = serializers.CharField(allow_null=True, required=False)
    supervisor_id = serializers.UUIDField(allow_null=True, required=False)
    deadline = serializers.CharField(allow_null=True, required=False)
    recommendation = serializers.CharField(allow_null=True, required=False)


class StaffFinalRatingStatusSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    score = serializers.FloatField(allow_null=True, required=False)
    label = serializers.CharField(allow_null=True, required=False)
    color = serializers.CharField(allow_null=True, required=False)
    status = serializers.CharField()
    kpi_score = serializers.FloatField(allow_null=True, required=False)
    competency_score = serializers.FloatField(allow_null=True, required=False)
    is_published = serializers.BooleanField(required=False, default=False)


class StaffPendingFeedbackSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    reviewer = serializers.CharField()
    reviewer_type = serializers.CharField()
    is_anonymous = serializers.BooleanField(required=False, default=True)
    due_date = serializers.CharField(allow_null=True, required=False)


class StaffFeedbackTaskSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    subject_id = serializers.UUIDField(allow_null=True, required=False)
    subject_name = serializers.CharField()
    reviewer_type = serializers.CharField()
    due_date = serializers.CharField(allow_null=True, required=False)
    cycle_name = serializers.CharField(allow_null=True, required=False)
    is_overdue = serializers.BooleanField(required=False, default=False)


class StaffPIPSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    title = serializers.CharField()
    severity = serializers.CharField()
    status = serializers.CharField()
    start_date = serializers.CharField(allow_null=True, required=False)
    end_date = serializers.CharField(allow_null=True, required=False)
    progress = serializers.FloatField()
    total_actions = serializers.IntegerField(required=False, default=0)
    completed_actions = serializers.IntegerField(required=False, default=0)
    days_remaining = serializers.IntegerField(required=False, default=0)


class StaffDeadlineSerializer(serializers.Serializer):
    type = serializers.CharField()
    title = serializers.CharField(required=False)
    date = serializers.CharField(allow_null=True, required=False)
    days_left = serializers.IntegerField()


class StaffDashboardSerializer(serializers.Serializer):
    employee = StaffEmployeeSerializer()
    review_cycle = StaffReviewCycleSerializer(allow_null=True, required=False)
    self_assessment = StaffSelfAssessmentStatusSerializer()
    supervisor_review = StaffSupervisorReviewStatusSerializer()
    final_rating = StaffFinalRatingStatusSerializer(allow_null=True, required=False)
    pending_feedback_requests = StaffPendingFeedbackSerializer(many=True)
    feedback_tasks_to_write = StaffFeedbackTaskSerializer(many=True)
    active_pip = StaffPIPSerializer(allow_null=True, required=False)
    upcoming_deadlines = StaffDeadlineSerializer(many=True)
