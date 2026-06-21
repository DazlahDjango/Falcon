import os
import django

# Setup Django Settings Module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')

# Import settings and override LOGGING to prevent WinError 32 log rollover lock errors on Windows
from django.conf import settings
settings.LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

django.setup()

from apps.reviews.api.v1.views.base_views import BaseReviewViewSet
from apps.reviews.api.v1.views.self_assessment_views import SelfAssessmentViewSet
from apps.reviews.api.v1.views.supervisor_review_views import SupervisorReviewViewSet
from apps.reviews.api.v1.views.feedback_views import FeedbackResponseViewSet
from apps.reviews.api.v1.views.calibration_views import CalibrationSessionViewSet
from apps.reviews.api.v1.views.cycle_views import ReviewCycleViewSet

from apps.reviews.api.v1.serializers.cycle_serializers import ReviewCycleCreateUpdateSerializer

def check_throttles():
    print("Checking throttle configurations on reviews ViewSets...")
    
    # 1. BaseReviewViewSet should only have ReviewsAPIThrottle
    base_throttles = [c.__name__ for c in BaseReviewViewSet.throttle_classes]
    print(f"BaseReviewViewSet throttles: {base_throttles}")
    assert base_throttles == ['ReviewsAPIThrottle'], f"Unexpected base throttles: {base_throttles}"
    
    # 2. ReviewCycleViewSet should inherit only ReviewsAPIThrottle
    cycle_throttles = [c.__name__ for c in ReviewCycleViewSet.throttle_classes]
    print(f"ReviewCycleViewSet throttles: {cycle_throttles}")
    assert cycle_throttles == ['ReviewsAPIThrottle'], f"Unexpected cycle throttles: {cycle_throttles}"
    
    # 3. SelfAssessmentViewSet should have ReviewsAPIThrottle and ReviewSubmissionThrottle
    self_throttles = [c.__name__ for c in SelfAssessmentViewSet.throttle_classes]
    print(f"SelfAssessmentViewSet throttles: {self_throttles}")
    assert 'ReviewsAPIThrottle' in self_throttles, "Missing ReviewsAPIThrottle on SelfAssessmentViewSet"
    assert 'ReviewSubmissionThrottle' in self_throttles, "Missing ReviewSubmissionThrottle on SelfAssessmentViewSet"
    
    # 4. SupervisorReviewViewSet should have ReviewsAPIThrottle and ReviewSubmissionThrottle
    super_throttles = [c.__name__ for c in SupervisorReviewViewSet.throttle_classes]
    print(f"SupervisorReviewViewSet throttles: {super_throttles}")
    assert 'ReviewsAPIThrottle' in super_throttles, "Missing ReviewsAPIThrottle on SupervisorReviewViewSet"
    assert 'ReviewSubmissionThrottle' in super_throttles, "Missing ReviewSubmissionThrottle on SupervisorReviewViewSet"
    
    # 5. FeedbackResponseViewSet should have ReviewsAPIThrottle and FeedbackSubmissionThrottle
    feedback_throttles = [c.__name__ for c in FeedbackResponseViewSet.throttle_classes]
    print(f"FeedbackResponseViewSet throttles: {feedback_throttles}")
    assert 'ReviewsAPIThrottle' in feedback_throttles, "Missing ReviewsAPIThrottle on FeedbackResponseViewSet"
    assert 'FeedbackSubmissionThrottle' in feedback_throttles, "Missing FeedbackSubmissionThrottle on FeedbackResponseViewSet"
    
    # 6. CalibrationSessionViewSet should have ReviewsAPIThrottle and CalibrationActionThrottle
    calib_throttles = [c.__name__ for c in CalibrationSessionViewSet.throttle_classes]
    print(f"CalibrationSessionViewSet throttles: {calib_throttles}")
    assert 'ReviewsAPIThrottle' in calib_throttles, "Missing ReviewsAPIThrottle on CalibrationSessionViewSet"
    assert 'CalibrationActionThrottle' in calib_throttles, "Missing CalibrationActionThrottle on CalibrationSessionViewSet"
    
    print("All viewsets are configured correctly!")

def check_serializer():
    print("Verifying ReviewCycleCreateUpdateSerializer instantiation...")
    # Instantiate the serializer; this checks if the meta and fields declarations are valid
    serializer = ReviewCycleCreateUpdateSerializer()
    fields = list(serializer.fields.keys())
    print(f"ReviewCycleCreateUpdateSerializer fields: {fields}")
    assert 'competencies' in fields, "competencies field not found in serializer fields!"
    print("ReviewCycleCreateUpdateSerializer verified successfully!")

if __name__ == "__main__":
    check_throttles()
    check_serializer()
