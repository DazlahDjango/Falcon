# apps/reviews/admin.py
"""
Django Admin configuration for Reviews app
"""

from django.contrib import admin
from django.db import models as django_models
from django.forms import Textarea, TextInput

from .models import (
    RatingScale,
    Competency,
    CompetencyCategory,
    CompetencyRating,
    Coefficient,
    ReviewTemplate,
    ReviewCycle,
    CycleCompetency,
    SelfAssessment,
    SupervisorReview,
    FinalRating,
    PIP,
    PIPAction,
    PIPReview,
    FeedbackRequest,
    FeedbackResponse,
    FeedbackSummary,
    CalibrationSession,
    CalibrationAgendaItem,
    CalibrationRating,
    CalibrationComment,
    ReviewComment,
    PromotionRecommendation,
)


# ========== Inline Admin Classes ==========

class CycleCompetencyInline(admin.TabularInline):
    """Inline for competencies within a review cycle"""
    model = CycleCompetency
    extra = 1
    fields = ['competency', 'weight', 'display_order']
    autocomplete_fields = ['competency']


class PIPActionInline(admin.TabularInline):
    """Inline for PIP actions"""
    model = PIPAction
    extra = 1
    fields = ['title', 'priority', 'due_date', 'status']
    readonly_fields = ['completed_at']


class PIPReviewInline(admin.TabularInline):
    """Inline for PIP reviews"""
    model = PIPReview
    extra = 0
    fields = ['review_date', 'rating', 'summary']
    readonly_fields = ['review_date']


class CalibrationAgendaItemInline(admin.TabularInline):
    """Inline for calibration agenda items"""
    model = CalibrationAgendaItem
    extra = 1
    fields = ['title', 'duration_minutes', 'order', 'status']


class CalibrationRatingInline(admin.TabularInline):
    """Inline for calibration rating adjustments"""
    model = CalibrationRating
    extra = 0
    fields = ['final_rating', 'before_score', 'after_score', 'adjustment_reason']
    readonly_fields = ['adjusted_at']


class CalibrationCommentInline(admin.TabularInline):
    """Inline for calibration comments"""
    model = CalibrationComment
    extra = 0
    fields = ['author', 'comment']
    readonly_fields = ['created_at']





# ========== ModelAdmin Classes ==========

@admin.register(RatingScale)
class RatingScaleAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant', 'is_default', 'is_active', 'created_at']
    list_filter = ['tenant_id', 'is_default', 'is_active']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'tenant_id')
        }),
        ('Scale Configuration', {
            'fields': ('levels', 'min_value', 'max_value')
        }),
        ('Settings', {
            'fields': ('allow_decimal', 'reverse_scoring', 'scoring_type')
        }),
        ('Status', {
            'fields': ('is_active', 'is_default')
        }),
        ('Audit', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CompetencyCategory)
class CompetencyCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant_id', 'order', 'is_active']
    list_filter = ['tenant_id', 'is_active']
    search_fields = ['name', 'description']


@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant_id', 'category', 'competency_type', 'default_weight', 'is_active']
    list_filter = ['tenant_id', 'competency_type', 'category', 'is_active']
    search_fields = ['name', 'description']
    autocomplete_fields = ['category', 'rating_scale']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'tenant_id')
        }),
        ('Categorization', {
            'fields': ('category', 'competency_type')
        }),
        ('Weighting', {
            'fields': ('default_weight', 'rating_scale')
        }),
        ('Behavior Indicators', {
            'fields': ('excellent_behavior', 'needs_improvement_behavior'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active', 'is_required', 'display_order')
        }),
    )


@admin.register(CompetencyRating)
class CompetencyRatingAdmin(admin.ModelAdmin):
    list_display = ['competency', 'raw_score', 'normalized_score', 'traffic_light', 'created_at']
    list_filter = ['traffic_light', 'content_type']
    search_fields = ['competency__name', 'comment']
    readonly_fields = ['normalized_score', 'traffic_light', 'created_at', 'updated_at']


@admin.register(Coefficient)
class CoefficientAdmin(admin.ModelAdmin):
    list_display = ['coefficient_type', 'value', 'tenant_id', 'valid_from', 'valid_to', 'is_active']
    list_filter = ['coefficient_type', 'tenant_id', 'is_active']
    search_fields = ['reason']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ReviewTemplate)
class ReviewTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant_id', 'is_default', 'is_active', 'version']
    list_filter = ['tenant_id', 'is_default', 'is_active']
    search_fields = ['name', 'description']


@admin.register(ReviewCycle)
class ReviewCycleAdmin(admin.ModelAdmin):
    list_display = ['name', 'tenant_id', 'cycle_type', 'start_date', 'end_date', 'status']
    list_filter = ['tenant_id', 'cycle_type', 'status']
    search_fields = ['name', 'description']
    inlines = [CycleCompetencyInline]
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'tenant', 'cycle_type')
        }),
        ('Dates', {
            'fields': ('start_date', 'self_assessment_deadline', 'supervisor_review_deadline',
                       'calibration_date', 'final_approval_deadline', 'end_date')
        }),
        ('Weights', {
            'fields': ('kpi_weight', 'competency_weight', 'mission_weight', 'task_weight')
        }),
        ('Rating Configuration', {
            'fields': ('rating_scale',)
        }),
        ('Scope', {
            'fields': ('include_all_departments', 'included_departments', 'included_positions')
        }),
        ('Features', {
            'fields': ('require_self_assessment', 'allow_self_assessment_edit', 
                       'require_360_feedback', 'enable_calibration')
        }),
        ('Status', {
            'fields': ('status',)
        }),
    )


@admin.register(SelfAssessment)
class SelfAssessmentAdmin(admin.ModelAdmin):
    list_display = ['employee', 'review_cycle', 'status', 'submitted_at', 'created_at']
    list_filter = ['review_cycle', 'status']
    search_fields = ['employee__email', 'employee__name', 'overall_comment']
    readonly_fields = ['created_at', 'updated_at', 'submitted_at']
    raw_id_fields = ['employee']


@admin.register(SupervisorReview)
class SupervisorReviewAdmin(admin.ModelAdmin):
    list_display = ['employee', 'supervisor', 'review_cycle', 'recommendation', 'status']
    list_filter = ['review_cycle', 'recommendation', 'status', 'promotion_readiness']
    search_fields = ['employee__email', 'supervisor__email', 'overall_comment']
    readonly_fields = ['created_at', 'updated_at', 'submitted_at']
    raw_id_fields = ['employee', 'supervisor', 'self_assessment']


@admin.register(FinalRating)
class FinalRatingAdmin(admin.ModelAdmin):
    list_display = ['employee', 'review_cycle', 'final_score', 'final_rating_label', 'status']
    list_filter = ['review_cycle', 'status', 'promotion_recommended', 'pip_recommended']
    search_fields = ['employee__email', 'final_rating_label']
    readonly_fields = ['created_at', 'updated_at', 'approved_at']
    raw_id_fields = ['employee', 'supervisor_review', 'calibration_session']


@admin.register(PIP)
class PIPAdmin(admin.ModelAdmin):
    list_display = ['title', 'employee', 'severity', 'start_date', 'end_date', 'status']
    list_filter = ['severity', 'status', 'outcome']
    search_fields = ['title', 'employee__email', 'description']
    inlines = [PIPActionInline, PIPReviewInline]
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    raw_id_fields = ['employee', 'owner', 'review_cycle', 'final_rating']
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'tenant_id', 'employee', 'owner')
        }),
        ('Severity & Timeline', {
            'fields': ('severity', 'start_date', 'end_date', 'extended_to_date', 'extension_reason')
        }),
        ('Goals & Consequences', {
            'fields': ('improvement_areas', 'success_criteria', 'success_metrics',
                       'consequences_if_failed', 'consequences_if_successful')
        }),
        ('Sign-off', {
            'fields': ('employee_acknowledged_at', 'employee_acknowledged_by',
                       'employee_comments', 'manager_signed_at', 'hr_signed_at')
        }),
        ('Outcome', {
            'fields': ('outcome', 'outcome_notes', 'completed_at')
        }),
        ('Links', {
            'fields': ('review_cycle', 'final_rating')
        }),
    )


@admin.register(PIPAction)
class PIPActionAdmin(admin.ModelAdmin):
    list_display = ['title', 'pip', 'priority', 'due_date', 'status']
    list_filter = ['priority', 'status', 'requires_evidence']
    search_fields = ['title', 'description']
    readonly_fields = ['completed_at', 'evidence_verified_at']
    raw_id_fields = ['pip', 'evidence_verified_by']


@admin.register(PIPReview)
class PIPReviewAdmin(admin.ModelAdmin):
    list_display = ['pip', 'review_date', 'rating', 'employee_attended']
    list_filter = ['rating', 'employee_attended']
    search_fields = ['summary']
    raw_id_fields = ['pip', 'reviewer', 'employee']


@admin.register(FeedbackRequest)
class FeedbackRequestAdmin(admin.ModelAdmin):
    list_display = ['subject', 'reviewer', 'review_cycle', 'reviewer_type', 'status']
    list_filter = ['review_cycle', 'reviewer_type', 'is_anonymous', 'is_required', 'status']
    search_fields = ['subject__email', 'reviewer__email']
    readonly_fields = ['requested_at', 'reminder_sent_at', 'completed_at']
    raw_id_fields = ['subject', 'reviewer', 'requested_by']


@admin.register(FeedbackResponse)
class FeedbackResponseAdmin(admin.ModelAdmin):
    list_display = ['feedback_request', 'overall_rating', 'submitted_at']
    list_filter = ['is_anonymous']
    search_fields = ['strengths', 'areas_for_improvement']
    readonly_fields = ['submitted_at']
    raw_id_fields = ['feedback_request']


@admin.register(FeedbackSummary)
class FeedbackSummaryAdmin(admin.ModelAdmin):
    list_display = ['subject', 'review_cycle', 'total_responses', 'overall_avg_rating']
    list_filter = ['review_cycle']
    search_fields = ['subject__email']
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['subject', 'shared_by']


@admin.register(CalibrationSession)
class CalibrationSessionAdmin(admin.ModelAdmin):
    list_display = ['name', 'review_cycle', 'scheduled_date', 'session_type', 'status']
    list_filter = ['review_cycle', 'session_type', 'status', 'outcome']
    search_fields = ['name', 'notes', 'decisions']
    inlines = [CalibrationAgendaItemInline, CalibrationRatingInline, CalibrationCommentInline]
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['facilitator', 'participants', 'departments_included']


@admin.register(CalibrationAgendaItem)
class CalibrationAgendaItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'calibration_session', 'duration_minutes', 'status']
    list_filter = ['status']
    search_fields = ['title', 'description']


@admin.register(CalibrationRating)
class CalibrationRatingAdmin(admin.ModelAdmin):
    list_display = ['final_rating', 'before_score', 'after_score', 'adjusted_at']
    list_filter = ['calibration_session']
    search_fields = ['adjustment_reason']
    readonly_fields = ['adjusted_at']
    raw_id_fields = ['final_rating', 'adjusted_by', 'agreed_by']


@admin.register(CalibrationComment)
class CalibrationCommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'calibration_session', 'created_at']
    list_filter = ['calibration_session']
    search_fields = ['comment']
    readonly_fields = ['created_at']
    raw_id_fields = ['author', 'parent_comment']


@admin.register(ReviewComment)
class ReviewCommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'comment_type', 'visibility', 'created_at', 'is_resolved']
    list_filter = ['comment_type', 'visibility', 'is_resolved']
    search_fields = ['comment']
    readonly_fields = ['created_at', 'edited_at', 'resolved_at']
    raw_id_fields = ['author', 'parent_comment', 'resolved_by']


@admin.register(PromotionRecommendation)
class PromotionRecommendationAdmin(admin.ModelAdmin):
    list_display = ['employee', 'recommended_role', 'priority', 'status', 'recommended_date']
    list_filter = ['priority', 'status', 'review_cycle']
    search_fields = ['employee__email', 'justification']
    readonly_fields = ['recommended_date', 'approved_at']
    raw_id_fields = ['employee', 'review_cycle', 'final_rating', 'recommended_by', 'approved_by']
    fieldsets = (
        ('Basic Information', {
            'fields': ('tenant', 'employee', 'review_cycle', 'final_rating')
        }),
        ('Recommendation', {
            'fields': ('current_role', 'current_level', 'recommended_role', 
                       'recommended_level', 'priority', 'justification')
        }),
        ('Compensation', {
            'fields': ('current_salary', 'proposed_salary', 'salary_increase_percentage')
        }),
        ('Timeline', {
            'fields': ('recommended_date', 'target_promotion_date', 'actual_promotion_date')
        }),
        ('Status', {
            'fields': ('status', 'status_notes', 'approved_by', 'approved_at', 'rejection_reason')
        }),
        ('Notes', {
            'fields': ('hr_notes', 'supporting_evidence')
        }),
    )