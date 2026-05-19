# apps/reviews/api/v1/urls.py
"""
API v1 URL configuration for Reviews app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse

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
    ReportViewSet,
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


# ========== URL PATTERNS ==========
urlpatterns = [
    # Main router URLs
    path('', include(router.urls)),
    
    # Nested router URLs
    path('', include(cycles_router.urls)),
    path('', include(pips_router.urls)),
    path('', include(calibration_router.urls)),
]


# ========== API ROOT VIEW ==========
@api_view(['GET'])
def api_root(request, format=None):
    """
    API Root endpoint that lists all available endpoints.
    """
    return Response({
        'name': 'Performance Reviews API',
        'version': '1.0.0',
        'description': 'REST API for performance reviews, PIPs, calibration, and 360 feedback',
        'base_url': '/api/v1/reviews/',
        'endpoints': {
            'rating_scales': {
                'list': reverse('rating-scale-list', request=request, format=format),
                'create': reverse('rating-scale-list', request=request, format=format),
                'detail': '/api/v1/reviews/rating-scales/{id}/',
                'set_default': '/api/v1/reviews/rating-scales/{id}/set-default/',
                'convert_score': reverse('rating-scale-convert-score', request=request, format=format),
                'default': reverse('rating-scale-default', request=request, format=format),
            },
            'competencies': {
                'list': reverse('competency-list', request=request, format=format),
                'create': reverse('competency-list', request=request, format=format),
                'detail': '/api/v1/reviews/competencies/{id}/',
                'active': reverse('competency-active', request=request, format=format),
                'required': reverse('competency-required', request=request, format=format),
                'categories': reverse('competency-category-list', request=request, format=format),
            },
            'review_cycles': {
                'list': reverse('cycle-list', request=request, format=format),
                'create': reverse('cycle-list', request=request, format=format),
                'detail': '/api/v1/reviews/cycles/{id}/',
                'activate': '/api/v1/reviews/cycles/{id}/activate/',
                'close': '/api/v1/reviews/cycles/{id}/close/',
                'progress': '/api/v1/reviews/cycles/{id}/progress/',
                'active': reverse('cycle-active', request=request, format=format),
                'upcoming': reverse('cycle-upcoming', request=request, format=format),
                'my_cycles': reverse('cycle-my-cycles', request=request, format=format),
            },
            'self_assessments': {
                'list': reverse('self-assessment-list', request=request, format=format),
                'create': reverse('self-assessment-list', request=request, format=format),
                'detail': '/api/v1/reviews/self-assessments/{id}/',
                'submit': '/api/v1/reviews/self-assessments/{id}/submit/',
                'my': reverse('self-assessment-my', request=request, format=format),
                'team': reverse('self-assessment-team', request=request, format=format),
                'pending': reverse('self-assessment-pending', request=request, format=format),
            },
            'supervisor_reviews': {
                'list': reverse('supervisor-review-list', request=request, format=format),
                'create': reverse('supervisor-review-list', request=request, format=format),
                'detail': '/api/v1/reviews/supervisor-reviews/{id}/',
                'submit': '/api/v1/reviews/supervisor-reviews/{id}/submit/',
                'approve': '/api/v1/reviews/supervisor-reviews/{id}/approve/',
                'reject': '/api/v1/reviews/supervisor-reviews/{id}/reject/',
                'my_queue': reverse('supervisor-review-my-queue', request=request, format=format),
            },
            'final_ratings': {
                'list': reverse('final-rating-list', request=request, format=format),
                'detail': '/api/v1/reviews/final-ratings/{id}/',
                'approve': '/api/v1/reviews/final-ratings/{id}/approve/',
                'lock': '/api/v1/reviews/final-ratings/{id}/lock/',
                'calibrate': '/api/v1/reviews/final-ratings/{id}/calibrate/',
                'my': reverse('final-rating-my', request=request, format=format),
                'team': reverse('final-rating-team', request=request, format=format),
                'distribution': reverse('final-rating-distribution', request=request, format=format),
                'export': reverse('final-rating-export', request=request, format=format),
            },
            'pips': {
                'list': reverse('pip-list', request=request, format=format),
                'create': reverse('pip-list', request=request, format=format),
                'detail': '/api/v1/reviews/pips/{id}/',
                'approve': '/api/v1/reviews/pips/{id}/approve/',
                'extend': '/api/v1/reviews/pips/{id}/extend/',
                'complete': '/api/v1/reviews/pips/{id}/complete/',
                'progress': '/api/v1/reviews/pips/{id}/progress/',
                'my': reverse('pip-my', request=request, format=format),
                'team': reverse('pip-team', request=request, format=format),
                'active': reverse('pip-active', request=request, format=format),
                'overdue': reverse('pip-overdue', request=request, format=format),
                'report': reverse('pip-report', request=request, format=format),
                'generate_from_rating': '/api/v1/reviews/pips/generate-from-rating/{rating_id}/',
            },
            'pip_actions': {
                'list': reverse('pip-action-list', request=request, format=format),
                'create': reverse('pip-action-list', request=request, format=format),
                'detail': '/api/v1/reviews/pip-actions/{id}/',
                'complete': '/api/v1/reviews/pip-actions/{id}/complete/',
                'verify': '/api/v1/reviews/pip-actions/{id}/verify/',
            },
            'feedback': {
                'requests': reverse('feedback-request-list', request=request, format=format),
                'responses': reverse('feedback-response-list', request=request, format=format),
                'summaries': reverse('feedback-summary-list', request=request, format=format),
                'pending': reverse('feedback-request-pending', request=request, format=format),
                'my_summary': reverse('feedback-summary-my', request=request, format=format),
            },
            'calibration': {
                'sessions': reverse('calibration-session-list', request=request, format=format),
                'create': reverse('calibration-session-list', request=request, format=format),
                'detail': '/api/v1/reviews/calibration-sessions/{id}/',
                'start': '/api/v1/reviews/calibration-sessions/{id}/start/',
                'complete': '/api/v1/reviews/calibration-sessions/{id}/complete/',
                'adjust_rating': '/api/v1/reviews/calibration-sessions/{id}/adjust-rating/',
                'add_comment': '/api/v1/reviews/calibration-sessions/{id}/add-comment/',
                'report': '/api/v1/reviews/calibration-sessions/{id}/report/',
                'my': reverse('calibration-session-my', request=request, format=format),
                'outlier_report': reverse('calibration-session-outlier-report', request=request, format=format),
            },
            'reports': {
                'employee_summary': reverse('report-employee-summary', request=request, format=format),
                'team_summary': reverse('report-team-summary', request=request, format=format),
                'cycle_summary': reverse('report-cycle-summary', request=request, format=format),
                'pip_summary': reverse('report-pip-summary', request=request, format=format),
                'calibration_summary': reverse('report-calibration-summary', request=request, format=format),
                'rating_distribution': reverse('report-rating-distribution', request=request, format=format),
                'export': reverse('report-export', request=request, format=format),
            },
        },
        'nested_endpoints': {
            'cycle_self_assessments': '/api/v1/reviews/cycles/{cycle_id}/self-assessments/',
            'cycle_supervisor_reviews': '/api/v1/reviews/cycles/{cycle_id}/supervisor-reviews/',
            'cycle_final_ratings': '/api/v1/reviews/cycles/{cycle_id}/final-ratings/',
            'cycle_pips': '/api/v1/reviews/cycles/{cycle_id}/pips/',
            'pip_actions': '/api/v1/reviews/pips/{pip_id}/actions/',
            'pip_reviews': '/api/v1/reviews/pips/{pip_id}/reviews/',
            'session_ratings': '/api/v1/reviews/calibration-sessions/{session_id}/ratings/',
        },
    })

# Add API root to urlpatterns
urlpatterns = [
    path('', api_root, name='api-root'),
] + urlpatterns