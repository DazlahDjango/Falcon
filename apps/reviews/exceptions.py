
# apps/reviews/exceptions.py
"""
Custom exceptions for Reviews app
Specific error types for better error handling and debugging
"""

# ========== Base Review Exceptions ==========
class ReviewException(Exception):
    """Base exception for all Reviews app errors"""
    pass

class ReviewValidationError(ReviewException):
    """Raised when validation fails for a review model"""
    pass

class ReviewNotFoundError(ReviewException):
    """Raised when a review object is not found"""
    pass


class ReviewPermissionDenied(ReviewException):
    """Raised when a user doesn't have permission for an action"""
    pass


# ========== Cycle Exceptions ==========

class CycleNotFoundError(ReviewNotFoundError):
    """Raised when a review cycle is not found"""
    pass


class CycleNotActiveError(ReviewException):
    """Raised when attempting to access an inactive cycle"""
    pass


class CycleAlreadyClosedError(ReviewException):
    """Raised when trying to modify a closed cycle"""
    pass


class CycleDateError(ReviewException):
    """Raised when cycle dates are invalid"""
    pass


class CycleWeightError(ReviewException):
    """Raised when cycle weights don't sum to 100%"""
    pass


# ========== Self Assessment Exceptions ==========

class SelfAssessmentNotFoundError(ReviewNotFoundError):
    """Raised when self assessment is not found"""
    pass


class SelfAssessmentAlreadySubmittedError(ReviewException):
    """Raised when trying to modify an already submitted self assessment"""
    pass


class SelfAssessmentDeadlinePassedError(ReviewException):
    """Raised when trying to submit after deadline"""
    pass


class SelfAssessmentNotAllowedError(ReviewException):
    """Raised when employee is not allowed to submit self assessment"""
    pass


# ========== Supervisor Review Exceptions ==========

class SupervisorReviewNotFoundError(ReviewNotFoundError):
    """Raised when supervisor review is not found"""
    pass


class SupervisorReviewAlreadySubmittedError(ReviewException):
    """Raised when trying to modify an already submitted review"""
    pass


class SupervisorNotAssignedError(ReviewException):
    """Raised when employee has no supervisor assigned"""
    pass


class CannotReviewSelfError(ReviewException):
    """Raised when a supervisor tries to review themselves"""
    pass


class KPIOverrideNotAllowedError(ReviewException):
    """Raised when KPI override is attempted without permission"""
    pass


# ========== Final Rating Exceptions ==========

class FinalRatingNotFoundError(ReviewNotFoundError):
    """Raised when final rating is not found"""
    pass


class FinalRatingAlreadyLockedError(ReviewException):
    """Raised when trying to modify a locked final rating"""
    pass


class FinalRatingNotCalibratedError(ReviewException):
    """Raised when trying to approve a non-calibrated rating"""
    pass


class CalibrationRequiredError(ReviewException):
    """Raised when calibration is required but not performed"""
    pass


# ========== Competency Exceptions ==========

class CompetencyNotFoundError(ReviewNotFoundError):
    """Raised when competency is not found"""
    pass


class CompetencyWeightError(ReviewException):
    """Raised when competency weights don't sum correctly"""
    pass


class CompetencyRatingError(ReviewException):
    """Raised when competency rating is invalid"""
    pass


class CompetencyAlreadyRatedError(ReviewException):
    """Raised when trying to rate a competency twice"""
    pass


# ========== Rating Scale Exceptions ==========

class RatingScaleNotFoundError(ReviewNotFoundError):
    """Raised when rating scale is not found"""
    pass


class RatingScaleInvalidError(ReviewException):
    """Raised when rating scale configuration is invalid"""
    pass


class RatingScaleInactiveError(ReviewException):
    """Raised when trying to use an inactive rating scale"""
    pass


class ScoreOutOfRangeError(ReviewException):
    """Raised when score is outside allowed range"""
    pass


# ========== Coefficient Exceptions ==========

class CoefficientNotFoundError(ReviewNotFoundError):
    """Raised when coefficient is not found"""
    pass


class CoefficientInvalidError(ReviewException):
    """Raised when coefficient value is invalid"""
    pass


class CoefficientExpiredError(ReviewException):
    """Raised when coefficient has expired"""
    pass


# ========== PIP Exceptions ==========

class PIPNotFoundError(ReviewNotFoundError):
    """Raised when PIP is not found"""
    pass


class PIPAlreadyActiveError(ReviewException):
    """Raised when trying to create PIP for employee with active PIP"""
    pass


class PIPActionNotFoundError(ReviewNotFoundError):
    """Raised when PIP action is not found"""
    pass


class PIPActionOverdueError(ReviewException):
    """Raised when PIP action is overdue and cannot be modified"""
    pass


class PIPActionAlreadyCompletedError(ReviewException):
    """Raised when trying to modify a completed PIP action"""
    pass


class PIPEscalationError(ReviewException):
    """Raised when PIP needs escalation but escalation fails"""
    pass


class PIPReviewNotFoundError(ReviewNotFoundError):
    """Raised when PIP review is not found"""
    pass


# ========== Feedback Exceptions ==========

class FeedbackRequestNotFoundError(ReviewNotFoundError):
    """Raised when feedback request is not found"""
    pass


class FeedbackAlreadySubmittedError(ReviewException):
    """Raised when feedback has already been submitted"""
    pass


class FeedbackRequestExpiredError(ReviewException):
    """Raised when feedback request deadline has passed"""
    pass


class FeedbackNotAnonymousError(ReviewException):
    """Raised when anonymous feedback is required but not provided"""
    pass


class InsufficientFeedbackError(ReviewException):
    """Raised when not enough feedback responses for summary"""
    pass


# ========== Calibration Exceptions ==========

class CalibrationSessionNotFoundError(ReviewNotFoundError):
    """Raised when calibration session is not found"""
    pass


class CalibrationSessionAlreadyCompletedError(ReviewException):
    """Raised when trying to modify a completed calibration session"""
    pass


class CalibrationNotParticipantError(ReviewException):
    """Raised when user is not a participant in calibration session"""
    pass


class CalibrationRatingNotFoundError(ReviewNotFoundError):
    """Raised when calibration rating is not found"""
    pass


class CalibrationAdjustmentInvalidError(ReviewException):
    """Raised when calibration adjustment is outside allowed range"""
    pass


# ========== Permission Exceptions ==========

class ReviewAccessDenied(ReviewPermissionDenied):
    """Raised when user cannot access a review object"""
    pass


class ManagerAccessRequired(ReviewPermissionDenied):
    """Raised when action requires manager role"""
    pass


class HRAccessRequired(ReviewPermissionDenied):
    """Raised when action requires HR role"""
    pass


class AdminAccessRequired(ReviewPermissionDenied):
    """Raised when action requires admin role"""
    pass


class TenantMismatchError(ReviewException):
    """Raised when trying to access data from another tenant"""
    pass


# ========== Promotion Exceptions ==========

class PromotionNotFoundError(ReviewNotFoundError):
    """Raised when promotion recommendation is not found"""
    pass


class PromotionAlreadyProcessedError(ReviewException):
    """Raised when trying to modify an already processed promotion"""
    pass


# ========== Template Exceptions ==========

class ReviewTemplateNotFoundError(ReviewNotFoundError):
    """Raised when review template is not found"""
    pass


class ReviewTemplateInvalidError(ReviewException):
    """Raised when review template configuration is invalid"""
    pass


# ========== Workflow Exceptions ==========

class WorkflowStateError(ReviewException):
    """Raised when workflow transition is invalid"""
    pass


class DeadlineMissedError(ReviewException):
    """Raised when action is attempted after deadline"""
    pass


class ApprovalRequiredError(ReviewException):
    """Raised when action requires approval"""
    pass


class DuplicateSubmissionError(ReviewException):
    """Raised when trying to submit duplicate content"""
    pass


# ========== Comment Exceptions ==========

class CommentNotFoundError(ReviewNotFoundError):
    """Raised when comment is not found"""
    pass


class CommentEditNotAllowedError(ReviewException):
    """Raised when trying to edit a comment without permission"""
    pass


class CommentVisibilityError(ReviewException):
    """Raised when trying to view a comment without proper visibility"""
    pass


# ========== Integration Exceptions ==========

class KPIAppIntegrationError(ReviewException):
    """Raised when unable to fetch data from KPI app"""
    pass


class MissionAppIntegrationError(ReviewException):
    """Raised when unable to fetch data from Mission app"""
    pass


class TasksAppIntegrationError(ReviewException):
    """Raised when unable to fetch data from Tasks app"""
    pass


class AccountsAppIntegrationError(ReviewException):
    """Raised when unable to fetch data from Accounts app"""
    pass


class StructureAppIntegrationError(ReviewException):
    """Raised when unable to fetch data from Structure app"""
    pass