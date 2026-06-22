from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from .views.health_views import ReviewsHealthView, ReviewsDashboardMetricsView
from .views.reference_data_views import ReviewsReferenceDataView
from .views.system_settings_views import ReviewsSystemSettingsView, ReviewsSystemSettingsResetView
from .views.dashboard_views import StaffDashboardView, SupervisorDashboardView, ExecutiveDashboardView, AdminDashboardView
from .views import (
    RatingScaleViewSet,
    CompetencyCategoryViewSet,
    CompetencyViewSet,
    CompetencyRatingViewSet,
    ReviewCycleViewSet,
    SelfAssessmentViewSet,
    SupervisorReviewViewSet,
    FinalRatingViewSet,
    PIPViewSet,
    PIPActionViewSet,
    PIPReviewViewSet,
    FeedbackRequestViewSet,
    FeedbackResponseViewSet,
    FeedbackSummaryViewSet,
    CalibrationSessionViewSet,
    CalibrationRatingViewSet,
    CalibrationCommentViewSet,
    ReportViewSet,
    CoefficientViewSet,
    ReviewCommentViewSet,
    PromotionRecommendationViewSet,
    ReviewTemplateViewSet,
)

# ========== MAIN ROUTER ==========
router = DefaultRouter()
router.trailing_slash = '/?'

# Register main view sets
router.register(r'rating-scales', RatingScaleViewSet, basename='rating-scale')
router.register(r'competency-categories', CompetencyCategoryViewSet, basename='competency-category')
router.register(r'competencies', CompetencyViewSet, basename='competency')
router.register(r'competency-ratings', CompetencyRatingViewSet, basename='competency-rating')
router.register(r'cycles', ReviewCycleViewSet, basename='cycle')
router.register(r'self-assessments', SelfAssessmentViewSet, basename='self-assessment')
router.register(r'supervisor-reviews', SupervisorReviewViewSet, basename='supervisor-review')
router.register(r'final-ratings', FinalRatingViewSet, basename='final-rating')
router.register(r'pips', PIPViewSet, basename='pip')
router.register(r'pip-actions', PIPActionViewSet, basename='pip-action')
router.register(r'pip-reviews', PIPReviewViewSet, basename='pip-review')
router.register(r'feedback-requests', FeedbackRequestViewSet, basename='feedback-request')
router.register(r'feedback-responses', FeedbackResponseViewSet, basename='feedback-response')
router.register(r'feedback-summaries', FeedbackSummaryViewSet, basename='feedback-summary')
router.register(r'calibration-sessions', CalibrationSessionViewSet, basename='calibration-session')
router.register(r'calibration-ratings', CalibrationRatingViewSet, basename='calibration-rating')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'coefficients', CoefficientViewSet, basename='coefficient')
router.register(r'comments', ReviewCommentViewSet, basename='comment')
router.register(r'promotions', PromotionRecommendationViewSet, basename='promotion')
router.register(r'templates', ReviewTemplateViewSet, basename='template')

# ========== NESTED ROUTERS ==========

# Cycles nested resources
cycles_router = NestedDefaultRouter(router, r'cycles', lookup='cycle')
cycles_router.register(r'self-assessments', SelfAssessmentViewSet, basename='cycle-self-assessments')
cycles_router.register(r'supervisor-reviews', SupervisorReviewViewSet, basename='cycle-supervisor-reviews')
cycles_router.register(r'final-ratings', FinalRatingViewSet, basename='cycle-final-ratings')
cycles_router.register(r'pips', PIPViewSet, basename='cycle-pips')
cycles_router.register(r'feedback-requests', FeedbackRequestViewSet, basename='cycle-feedback-requests')
cycles_router.register(r'calibration-sessions', CalibrationSessionViewSet, basename='cycle-calibration-sessions')

# PIPs nested resources
pips_router = NestedDefaultRouter(router, r'pips', lookup='pip')
pips_router.register(r'actions', PIPActionViewSet, basename='pip-actions')
pips_router.register(r'reviews', PIPReviewViewSet, basename='pip-reviews')

# Calibration sessions nested resources
calibration_router = NestedDefaultRouter(router, r'calibration-sessions', lookup='session')
calibration_router.register(r'ratings', CalibrationRatingViewSet, basename='session-ratings')
calibration_router.register(r'comments', CalibrationCommentViewSet, basename='session-comments')

# ========== API ROOT VIEW ==========
@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'name': 'Performance Reviews API',
        'version': '1.0.0',
        'description': 'REST API for performance reviews, PIPs, calibration, 360 feedback, and promotions',
        'base_url': '/api/v1/reviews/',
        'endpoints': {
            'rating_scales': {
                'list': reverse('rating-scale-list', request=request, format=format),
                'create': reverse('rating-scale-list', request=request, format=format),
                'detail': '/api/v1/reviews/rating-scales/{id}/',
                'set_default': '/api/v1/reviews/rating-scales/{id}/set-default/',
                'activate': '/api/v1/reviews/rating-scales/{id}/activate/',
                'deactivate': '/api/v1/reviews/rating-scales/{id}/deactivate/',
                'convert': reverse('rating-scale-convert', request=request, format=format),
                'default': reverse('rating-scale-default', request=request, format=format),
                'active_scales': reverse('rating-scale-active-scales', request=request, format=format),
            },
            'competencies': {
                'categories': reverse('competency-category-list', request=request, format=format),
                'list': reverse('competency-list', request=request, format=format),
                'create': reverse('competency-list', request=request, format=format),
                'detail': '/api/v1/reviews/competencies/{id}/',
                'activate': '/api/v1/reviews/competencies/{id}/activate/',
                'deactivate': '/api/v1/reviews/competencies/{id}/deactivate/',
                'active': reverse('competency-active', request=request, format=format),
                'required': reverse('competency-required', request=request, format=format),
                'by_type': '/api/v1/reviews/competencies/by-type/{comp_type}/',
                'usage_stats': '/api/v1/reviews/competencies/{id}/usage_stats/',
            },
            'competency_ratings': {
                'list': reverse('competency-rating-list', request=request, format=format),
                'by_assessment': '/api/v1/reviews/competency-ratings/by-assessment/{assessment_id}/',
                'by_review': '/api/v1/reviews/competency-ratings/by-review/{review_id}/',
                'bulk_create': reverse('competency-rating-bulk-create', request=request, format=format),
            },
            'review_cycles': {
                'list': reverse('cycle-list', request=request, format=format),
                'create': reverse('cycle-list', request=request, format=format),
                'detail': '/api/v1/reviews/cycles/{id}/',
                'activate': '/api/v1/reviews/cycles/{id}/activate/',
                'freeze': '/api/v1/reviews/cycles/{id}/freeze/',
                'complete': '/api/v1/reviews/cycles/{id}/complete/',
                'force_complete': '/api/v1/reviews/cycles/{id}/force-complete/',
                'archive': '/api/v1/reviews/cycles/{id}/archive/',
                'unarchive': '/api/v1/reviews/cycles/{id}/unarchive/',
                'extend': '/api/v1/reviews/cycles/{id}/extend/',
                'progress': '/api/v1/reviews/cycles/{id}/progress/',
                'active': reverse('cycle-active', request=request, format=format),
                'upcoming': reverse('cycle-upcoming', request=request, format=format),
                'completed': reverse('cycle-completed', request=request, format=format),
                'archived': reverse('cycle-archived', request=request, format=format),
                'my_cycles': reverse('cycle-my-cycles', request=request, format=format),
                'by_year': '/api/v1/reviews/cycles/by-year/{year}/',
                'date_range': reverse('cycle-date-range', request=request, format=format),
                'participants': '/api/v1/reviews/cycles/{id}/participants/',
                'summary': '/api/v1/reviews/cycles/{id}/summary/',
            },
            'self_assessments': {
                'list': reverse('self-assessment-list', request=request, format=format),
                'create': reverse('self-assessment-list', request=request, format=format),
                'detail': '/api/v1/reviews/self-assessments/{id}/',
                'submit': '/api/v1/reviews/self-assessments/{id}/submit/',
                'save_draft': '/api/v1/reviews/self-assessments/{id}/save-draft/',
                'reset_to_draft': '/api/v1/reviews/self-assessments/{id}/reset-to-draft/',
                'my': reverse('self-assessment-my', request=request, format=format),
                'team': reverse('self-assessment-team', request=request, format=format),
                'pending': reverse('self-assessment-pending', request=request, format=format),
                'submitted': reverse('self-assessment-submitted', request=request, format=format),
                'stats': reverse('self-assessment-stats', request=request, format=format),
                'soft_delete': '/api/v1/reviews/self-assessments/{id}/soft-delete/',
                'restore': '/api/v1/reviews/self-assessments/{id}/restore/',
            },
            'supervisor_reviews': {
                'list': reverse('supervisor-review-list', request=request, format=format),
                'create': reverse('supervisor-review-list', request=request, format=format),
                'detail': '/api/v1/reviews/supervisor-reviews/{id}/',
                'submit': '/api/v1/reviews/supervisor-reviews/{id}/submit/',
                'save_draft': '/api/v1/reviews/supervisor-reviews/{id}/save-draft/',
                'approve': '/api/v1/reviews/supervisor-reviews/{id}/approve/',
                'reject': '/api/v1/reviews/supervisor-reviews/{id}/reject/',
                'request_changes': '/api/v1/reviews/supervisor-reviews/{id}/request-changes/',
                'reset_to_draft': '/api/v1/reviews/supervisor-reviews/{id}/reset-to-draft/',
                'my_queue': reverse('supervisor-review-my-queue', request=request, format=format),
                'compare': '/api/v1/reviews/supervisor-reviews/{id}/compare/',
                'stats': reverse('supervisor-review-stats', request=request, format=format),
                'pending_approvals': reverse('supervisor-review-pending-approvals', request=request, format=format),
            },
            'final_ratings': {
                'list': reverse('final-rating-list', request=request, format=format),
                'detail': '/api/v1/reviews/final-ratings/{id}/',
                'approve': '/api/v1/reviews/final-ratings/{id}/approve/',
                'lock': '/api/v1/reviews/final-ratings/{id}/lock/',
                'force_lock': '/api/v1/reviews/final-ratings/{id}/force-lock/',
                'calibrate': '/api/v1/reviews/final-ratings/{id}/calibrate/',
                'recalibrate': '/api/v1/reviews/final-ratings/{id}/recalibrate/',
                'recalculate': '/api/v1/reviews/final-ratings/{id}/recalculate/',
                'generate_pip': '/api/v1/reviews/final-ratings/{id}/generate-pip/',
                'generate_promotion': '/api/v1/reviews/final-ratings/{id}/generate-promotion/',
                'my': reverse('final-rating-my', request=request, format=format),
                'team': reverse('final-rating-team', request=request, format=format),
                'distribution': reverse('final-rating-distribution', request=request, format=format),
                'stats': reverse('final-rating-stats', request=request, format=format),
                'export': reverse('final-rating-export', request=request, format=format),
            },
            'pips': {
                'list': reverse('pip-list', request=request, format=format),
                'create': reverse('pip-list', request=request, format=format),
                'detail': '/api/v1/reviews/pips/{id}/',
                'approve': '/api/v1/reviews/pips/{id}/approve/',
                'start': '/api/v1/reviews/pips/{id}/start/',
                'extend': '/api/v1/reviews/pips/{id}/extend/',
                'complete': '/api/v1/reviews/pips/{id}/complete/',
                'cancel': '/api/v1/reviews/pips/{id}/cancel/',
                'progress': '/api/v1/reviews/pips/{id}/progress/',
                'add_action': '/api/v1/reviews/pips/{id}/add-action/',
                'add_review': '/api/v1/reviews/pips/{id}/add-review/',
                'my': reverse('pip-my', request=request, format=format),
                'managing': reverse('pip-managing', request=request, format=format),
                'team': reverse('pip-team', request=request, format=format),
                'active': reverse('pip-active', request=request, format=format),
                'overdue': reverse('pip-overdue', request=request, format=format),
                'report': reverse('pip-report', request=request, format=format),
                'full_report': '/api/v1/reviews/pips/{id}/full-report/',
                'trends': reverse('pip-trends', request=request, format=format),
                'generate_from_rating': '/api/v1/reviews/pips/generate-from-rating/{rating_id}/',
            },
            'pip_actions': {
                'list': reverse('pip-action-list', request=request, format=format),
                'create': reverse('pip-action-list', request=request, format=format),
                'detail': '/api/v1/reviews/pip-actions/{id}/',
                'complete': '/api/v1/reviews/pip-actions/{id}/complete/',
                'verify': '/api/v1/reviews/pip-actions/{id}/verify/',
                'reopen': '/api/v1/reviews/pip-actions/{id}/reopen/',
            },
            'pip_reviews': {
                'list': reverse('pip-review-list', request=request, format=format),
                'create': reverse('pip-review-list', request=request, format=format),
                'detail': '/api/v1/reviews/pip-reviews/{id}/',
            },
            'feedback': {
                'requests': reverse('feedback-request-list', request=request, format=format),
                'responses': reverse('feedback-response-list', request=request, format=format),
                'summaries': reverse('feedback-summary-list', request=request, format=format),
                'pending_requests': reverse('feedback-request-pending', request=request, format=format),
                'overdue_requests': reverse('feedback-request-overdue', request=request, format=format),
                'my_summary': reverse('feedback-summary-my', request=request, format=format),
                'share_summary': '/api/v1/reviews/feedback-summaries/{id}/share/',
                'regenerate_summary': '/api/v1/reviews/feedback-summaries/{id}/regenerate/',
                'bulk_create_requests': reverse('feedback-request-bulk-create', request=request, format=format),
            },
            'calibration': {
                'sessions': reverse('calibration-session-list', request=request, format=format),
                'create': reverse('calibration-session-list', request=request, format=format),
                'detail': '/api/v1/reviews/calibration-sessions/{id}/',
                'start': '/api/v1/reviews/calibration-sessions/{id}/start/',
                'complete': '/api/v1/reviews/calibration-sessions/{id}/complete/',
                'cancel': '/api/v1/reviews/calibration-sessions/{id}/cancel/',
                'add_rating': '/api/v1/reviews/calibration-sessions/{id}/add-rating/',
                'add_comment': '/api/v1/reviews/calibration-sessions/{id}/add-comment/',
                'report': '/api/v1/reviews/calibration-sessions/{id}/report/',
                'my': reverse('calibration-session-my', request=request, format=format),
                'outliers': reverse('calibration-session-outliers', request=request, format=format),
                'recommendations': reverse('calibration-session-calibration-recommendations', request=request, format=format),
            },
            'coefficients': {
                'list': reverse('coefficient-list', request=request, format=format),
                'create': reverse('coefficient-list', request=request, format=format),
                'detail': '/api/v1/reviews/coefficients/{id}/',
                'activate': '/api/v1/reviews/coefficients/{id}/activate/',
                'deactivate': '/api/v1/reviews/coefficients/{id}/deactivate/',
                'active': reverse('coefficient-active', request=request, format=format),
                'by_department': '/api/v1/reviews/coefficients/by-department/{dept_id}/',
                'by_position': '/api/v1/reviews/coefficients/by-position/{position_id}/',
                'by_user': '/api/v1/reviews/coefficients/by-user/{user_id}/',
                'apply': reverse('coefficient-apply', request=request, format=format),
            },
            'comments': {
                'list': reverse('comment-list', request=request, format=format),
                'create': reverse('comment-list', request=request, format=format),
                'detail': '/api/v1/reviews/comments/{id}/',
                'resolve': '/api/v1/reviews/comments/{id}/resolve/',
                'unresolve': '/api/v1/reviews/comments/{id}/unresolve/',
                'edit': '/api/v1/reviews/comments/{id}/edit/',
                'for_object': reverse('comment-for-object', request=request, format=format),
                'replies': '/api/v1/reviews/comments/replies/{parent_id}/',
            },
            'promotions': {
                'list': reverse('promotion-list', request=request, format=format),
                'create': reverse('promotion-list', request=request, format=format),
                'detail': '/api/v1/reviews/promotions/{id}/',
                'approve': '/api/v1/reviews/promotions/{id}/approve/',
                'reject': '/api/v1/reviews/promotions/{id}/reject/',
                'complete': '/api/v1/reviews/promotions/{id}/complete/',
                'hold': '/api/v1/reviews/promotions/{id}/hold/',
                'pending': reverse('promotion-pending', request=request, format=format),
                'approved': reverse('promotion-approved', request=request, format=format),
                'completed': reverse('promotion-completed', request=request, format=format),
                'stats': reverse('promotion-stats', request=request, format=format),
                'generate_from_rating': '/api/v1/reviews/promotions/generate-from-rating/{rating_id}/',
            },
            'templates': {
                'list': reverse('template-list', request=request, format=format),
                'create': reverse('template-list', request=request, format=format),
                'detail': '/api/v1/reviews/templates/{id}/',
                'set_default': '/api/v1/reviews/templates/{id}/set-default/',
                'activate': '/api/v1/reviews/templates/{id}/activate/',
                'deactivate': '/api/v1/reviews/templates/{id}/deactivate/',
                'duplicate': '/api/v1/reviews/templates/{id}/duplicate/',
                'default': reverse('template-default', request=request, format=format),
                'active': reverse('template-active', request=request, format=format),
            },
            'dashboards': {
                'staff': reverse('staff-dashboard', request=request, format=format),
                'supervisor': reverse('supervisor-dashboard', request=request, format=format),
                'executive': reverse('executive-dashboard', request=request, format=format),
                'admin': reverse('admin-dashboard', request=request, format=format),
                'metrics': reverse('reviews-dashboard-metrics', request=request, format=format),
            },
            'reports': {
                'employee_summary': reverse('report-employee-summary', request=request, format=format),
                'team_summary': reverse('report-team-summary', request=request, format=format),
                'cycle_stats': reverse('report-cycle-stats', request=request, format=format),
                'pip_summary': reverse('report-pip-summary', request=request, format=format),
                'calibration_summary': reverse('report-calibration-summary', request=request, format=format),
                'rating_distribution': reverse('report-rating-distribution', request=request, format=format),
                'export': reverse('report-export', request=request, format=format),
            },
            'system': {
                'health': reverse('reviews-health', request=request, format=format),
                'reference_data': reverse('reviews-reference-data', request=request, format=format),
                'settings': reverse('reviews-system-settings', request=request, format=format),
                'settings_reset': reverse('reviews-system-settings-reset', request=request, format=format),
            },
        },
        'nested_endpoints': {
            'cycle_self_assessments': '/api/v1/reviews/cycles/{cycle_id}/self-assessments/',
            'cycle_supervisor_reviews': '/api/v1/reviews/cycles/{cycle_id}/supervisor-reviews/',
            'cycle_final_ratings': '/api/v1/reviews/cycles/{cycle_id}/final-ratings/',
            'cycle_pips': '/api/v1/reviews/cycles/{cycle_id}/pips/',
            'cycle_feedback_requests': '/api/v1/reviews/cycles/{cycle_id}/feedback-requests/',
            'cycle_calibration_sessions': '/api/v1/reviews/cycles/{cycle_id}/calibration-sessions/',
            'pip_actions': '/api/v1/reviews/pips/{pip_id}/actions/',
            'pip_reviews': '/api/v1/reviews/pips/{pip_id}/reviews/',
            'session_ratings': '/api/v1/reviews/calibration-sessions/{session_id}/ratings/',
            'session_comments': '/api/v1/reviews/calibration-sessions/{session_id}/comments/',
        },
    })

# ========== URL PATTERNS ==========
urlpatterns = [
    path('health/', ReviewsHealthView.as_view(), name='reviews-health'),
    path('dashboard/metrics/', ReviewsDashboardMetricsView.as_view(), name='reviews-dashboard-metrics'),
    path('dashboard/staff/', StaffDashboardView.as_view(), name='staff-dashboard'),
    path('dashboard/supervisor/', SupervisorDashboardView.as_view(), name='supervisor-dashboard'),
    path('dashboard/executive/', ExecutiveDashboardView.as_view(), name='executive-dashboard'),
    path('dashboard/admin/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('reference-data/', ReviewsReferenceDataView.as_view(), name='reviews-reference-data'),
    path('system-settings/', ReviewsSystemSettingsView.as_view(), name='reviews-system-settings'),
    path('system-settings/reset/', ReviewsSystemSettingsResetView.as_view(), name='reviews-system-settings-reset'),
    path('', include(router.urls)),
    path('', include(cycles_router.urls)),
    path('', include(pips_router.urls)),
    path('', include(calibration_router.urls)),
    path('', api_root, name='api-root'),
]