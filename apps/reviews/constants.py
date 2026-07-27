# apps/reviews/constants.py
"""
Constants for Reviews App
Centralized definitions for choices, thresholds, and default values
"""

from django.db import models


# ========== Review Status Constants ==========

class ReviewStatus:
    """Common status values for review workflows"""
    DRAFT = 'draft'
    ACTIVE = 'active'
    PENDING = 'pending'
    SUBMITTED = 'submitted'
    IN_REVIEW = 'in_review'
    UNDER_REVIEW = 'under_review'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    CALIBRATING = 'calibrating'
    CALIBRATED = 'calibrated'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'
    ARCHIVED = 'archived'
    LOCKED = 'locked'
    APPEALED = 'appealed'
    REVISED = 'revised'

    CHOICES = [
        (DRAFT, 'Draft'),
        (ACTIVE, 'Active'),
        (PENDING, 'Pending'),
        (SUBMITTED, 'Submitted'),
        (IN_REVIEW, 'In Review'),
        (UNDER_REVIEW, 'Under Review'),
        (APPROVED, 'Approved'),
        (REJECTED, 'Rejected'),
        (CALIBRATING, 'Calibrating'),
        (CALIBRATED, 'Calibrated'),
        (COMPLETED, 'Completed'),
        (FAILED, 'Failed'),
        (CANCELLED, 'Cancelled'),
        (ARCHIVED, 'Archived'),
        (LOCKED, 'Locked'),
        (APPEALED, 'Appealed'),
        (REVISED, 'Revised'),
    ]


# ========== Cycle Type Constants ==========

class CycleType:
    """Types of review cycles"""
    MID_YEAR = 'mid_year'
    END_YEAR = 'end_year'
    QUARTERLY = 'quarterly'
    PROBATION = 'probation'
    SPECIAL = 'special'
    PIP = 'pip'

    CHOICES = [
        (MID_YEAR, 'Mid-Year Review'),
        (END_YEAR, 'End-Year Review'),
        (QUARTERLY, 'Quarterly Review'),
        (PROBATION, 'Probation Review'),
        (SPECIAL, 'Special Review'),
        (PIP, 'PIP Review'),
    ]


# ========== Competency Type Constants ==========

class CompetencyType:
    """Types of competencies"""
    LEADERSHIP = 'leadership'
    MANAGEMENT = 'management'
    TECHNICAL = 'technical'
    SOFT_SKILL = 'soft_skill'
    CULTURAL = 'cultural'
    STRATEGIC = 'strategic'
    OPERATIONAL = 'operational'
    CUSTOMER = 'customer'
    INNOVATION = 'innovation'
    TEAMWORK = 'teamwork'

    CHOICES = [
        (LEADERSHIP, 'Leadership'),
        (MANAGEMENT, 'Management'),
        (TECHNICAL, 'Technical Skills'),
        (SOFT_SKILL, 'Soft Skills'),
        (CULTURAL, 'Cultural Fit'),
        (STRATEGIC, 'Strategic Thinking'),
        (OPERATIONAL, 'Operational Excellence'),
        (CUSTOMER, 'Customer Focus'),
        (INNOVATION, 'Innovation'),
        (TEAMWORK, 'Teamwork & Collaboration'),
    ]


# ========== Coefficient Type Constants ==========

class CoefficientType:
    """Types of coefficients that can be applied"""
    DEPARTMENT = 'department'
    POSITION = 'position'
    INDIVIDUAL = 'individual'

    CHOICES = [
        (DEPARTMENT, 'Department Level'),
        (POSITION, 'Position Level'),
        (INDIVIDUAL, 'Individual Level'),
    ]


# ========== PIP Constants ==========

class PIPSeverity:
    """Severity levels for Performance Improvement Plans"""
    MINOR = 'minor'
    MODERATE = 'moderate'
    SEVERE = 'severe'
    CRITICAL = 'critical'

    CHOICES = [
        (MINOR, 'Minor - Coaching Required'),
        (MODERATE, 'Moderate - Formal PIP'),
        (SEVERE, 'Severe - Final Warning'),
        (CRITICAL, 'Critical - Possible Termination'),
    ]


class PIPOutcome:
    """Possible outcomes of a PIP"""
    SUCCESSFUL = 'successful'
    EXTENDED = 'extended'
    FAILED = 'failed'
    TERMINATED = 'terminated'
    RESIGNED = 'resigned'

    CHOICES = [
        (SUCCESSFUL, 'Successful - Plan Completed'),
        (EXTENDED, 'Extended - More Time Needed'),
        (FAILED, 'Failed - Escalation Required'),
        (TERMINATED, 'Terminated - Employment Ended'),
        (RESIGNED, 'Resigned - Employee Resigned'),
    ]


class PIPActionStatus:
    """Status of individual PIP actions"""
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    MISSED = 'missed'
    WAIVED = 'waived'

    CHOICES = [
        (PENDING, 'Pending'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (MISSED, 'Missed Deadline'),
        (WAIVED, 'Waived'),
    ]


class PIPActionPriority:
    """Priority levels for PIP actions"""
    HIGH = 'high'
    MEDIUM = 'medium'
    LOW = 'low'

    CHOICES = [
        (HIGH, 'High - Must Complete'),
        (MEDIUM, 'Medium - Important'),
        (LOW, 'Low - Nice to Have'),
    ]


class PIPReviewRating:
    """Rating for PIP progress reviews"""
    NO_PROGRESS = 'no_progress'
    MINIMAL = 'minimal'
    SATISFACTORY = 'satisfactory'
    GOOD = 'good'
    EXCELLENT = 'excellent'

    CHOICES = [
        (NO_PROGRESS, 'No Progress - Critical'),
        (MINIMAL, 'Minimal Progress - Concern'),
        (SATISFACTORY, 'Satisfactory Progress - On Track'),
        (GOOD, 'Good Progress - Ahead'),
        (EXCELLENT, 'Excellent - Exceeding'),
    ]


# ========== Feedback Constants ==========

class ReviewerType:
    """Types of reviewers for 360 feedback"""
    MANAGER = 'manager'
    PEER = 'peer'
    SUBORDINATE = 'subordinate'
    CROSS_DEPT = 'cross_dept'
    EXTERNAL = 'external'
    SELF = 'self'

    CHOICES = [
        (MANAGER, 'Direct Manager'),
        (PEER, 'Peer (Same Level)'),
        (SUBORDINATE, 'Subordinate'),
        (CROSS_DEPT, 'Cross-Department'),
        (EXTERNAL, 'External (Client/Partner)'),
        (SELF, 'Self Assessment'),
    ]


class CommentType:
    """Types of comments in review system"""
    GENERAL = 'general'
    QUESTION = 'question'
    CLARIFICATION = 'clarification'
    FEEDBACK = 'feedback'
    APPROVAL = 'approval'
    DISPUTE = 'dispute'
    RESOLUTION = 'resolution'

    CHOICES = [
        (GENERAL, 'General Comment'),
        (QUESTION, 'Question'),
        (CLARIFICATION, 'Request for Clarification'),
        (FEEDBACK, 'Feedback'),
        (APPROVAL, 'Approval Note'),
        (DISPUTE, 'Dispute'),
        (RESOLUTION, 'Resolution'),
    ]


class CommentVisibility:
    """Visibility levels for comments"""
    PUBLIC = 'public'
    MANAGER_ONLY = 'manager'
    HR_ONLY = 'hr'
    PRIVATE = 'private'

    CHOICES = [
        (PUBLIC, 'Visible to All'),
        (MANAGER_ONLY, 'Manager Only'),
        (HR_ONLY, 'HR Only'),
        (PRIVATE, 'Private (Only Author)'),
    ]


# ========== Calibration Constants ==========

class CalibrationSessionType:
    """Types of calibration sessions"""
    INITIAL = 'initial'
    MID_CYCLE = 'mid_cycle'
    FINAL = 'final'
    AD_HOC = 'adhoc'

    CHOICES = [
        (INITIAL, 'Initial Calibration'),
        (MID_CYCLE, 'Mid-Cycle Review'),
        (FINAL, 'Final Calibration'),
        (AD_HOC, 'Ad-Hoc Session'),
    ]


class CalibrationOutcome:
    """Outcomes of calibration sessions"""
    PENDING = 'pending'
    COMPLETED = 'completed'
    PARTIAL = 'partial'
    CANCELLED = 'cancelled'

    CHOICES = [
        (PENDING, 'Pending'),
        (COMPLETED, 'Completed'),
        (PARTIAL, 'Partially Completed'),
        (CANCELLED, 'Cancelled'),
    ]


class CalibrationAgendaStatus:
    """Status of calibration agenda items"""
    PENDING = 'pending'
    IN_PROGRESS = 'in_progress'
    COMPLETED = 'completed'
    SKIPPED = 'skipped'

    CHOICES = [
        (PENDING, 'Pending'),
        (IN_PROGRESS, 'In Progress'),
        (COMPLETED, 'Completed'),
        (SKIPPED, 'Skipped'),
    ]


# ========== Final Rating Constants ==========

class FinalRatingStatus:
    """Status of final ratings"""
    PENDING = 'pending'
    CALIBRATED = 'calibrated'
    APPROVED = 'approved'
    LOCKED = 'locked'
    APPEALED = 'appealed'
    REVISED = 'revised'

    CHOICES = [
        (PENDING, 'Pending Calibration'),
        (CALIBRATED, 'Calibrated'),
        (APPROVED, 'Approved'),
        (LOCKED, 'Locked (Final)'),
        (APPEALED, 'Appealed'),
        (REVISED, 'Revised'),
    ]


class ActionOutcome:
    """Final action outcomes based on rating"""
    PROMOTE = 'promote'
    BONUS = 'bonus'
    PIP = 'pip'
    DEMOTE = 'demote'
    TERMINATE = 'terminate'
    NO_ACTION = 'no_action'

    CHOICES = [
        (PROMOTE, 'Promote'),
        (BONUS, 'Bonus Awarded'),
        (PIP, 'Place on PIP'),
        (DEMOTE, 'Demote'),
        (TERMINATE, 'Terminate'),
        (NO_ACTION, 'No Action'),
    ]


# ========== Supervisor Review Constants ==========

class Recommendation:
    """Manager recommendations for employee"""
    PROMOTE = 'promote'
    RETAIN = 'retain'
    PIP = 'pip'
    DEMOTE = 'demote'
    TERMINATE = 'terminate'
    NOT_RECOMMENDED = 'not_recommended'

    CHOICES = [
        (PROMOTE, 'Promote'),
        (RETAIN, 'Retain in Current Role'),
        (PIP, 'Place on Performance Improvement Plan'),
        (DEMOTE, 'Demote'),
        (TERMINATE, 'Terminate'),
        (NOT_RECOMMENDED, 'Not Recommended'),
    ]


class BonusRecommendation:
    """Bonus recommendations"""
    EXCEPTIONAL = 'exceptional'
    STANDARD = 'standard'
    REDUCED = 'reduced'
    NONE = 'none'

    CHOICES = [
        (EXCEPTIONAL, 'Exceptional Bonus'),
        (STANDARD, 'Standard Bonus'),
        (REDUCED, 'Reduced Bonus'),
        (NONE, 'No Bonus'),
    ]


class ScoringType:
    """Types of scoring systems"""
    RAW = 'raw'
    PERCENTAGE = 'percentage'
    NORMALIZED = 'normalized'

    CHOICES = [
        (RAW, 'Raw Score'),
        (PERCENTAGE, 'Percentage'),
        (NORMALIZED, 'Normalized (0-100)'),
    ]


# ========== Promotion Recommendation Constants ==========

class PromotionStatus:
    """Status of promotion recommendations"""
    PENDING = 'pending'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    ON_HOLD = 'on_hold'
    COMPLETED = 'completed'

    CHOICES = [
        (PENDING, 'Pending Review'),
        (APPROVED, 'Approved'),
        (REJECTED, 'Rejected'),
        (ON_HOLD, 'On Hold'),
        (COMPLETED, 'Promotion Completed'),
    ]


class PromotionPriority:
    """Priority levels for promotions"""
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    URGENT = 'urgent'

    CHOICES = [
        (LOW, 'Low'),
        (MEDIUM, 'Medium'),
        (HIGH, 'High'),
        (URGENT, 'Urgent'),
    ]


# ========== Threshold Constants ==========

class ScoreThresholds:
    """Default score thresholds for traffic lights"""
    GREEN_MIN = 80      # 80% and above = Green
    YELLOW_MIN = 60     # 60-79% = Yellow
    RED_MAX = 59        # Below 60% = Red


class CalibrationAdjustmentLimits:
    """Limits for calibration score adjustments"""
    MIN_ADJUSTMENT = -20
    MAX_ADJUSTMENT = 20


class PIPReminderDays:
    """Days before PIP deadlines for reminders"""
    FIRST_REMINDER = 14   # 2 weeks before
    SECOND_REMINDER = 7   # 1 week before
    FINAL_REMINDER = 3    # 3 days before
    OVERDUE_ALERT = 1     # 1 day after


class ReviewReminderDays:
    """Days before review deadlines for reminders"""
    SELF_ASSESSMENT_REMINDER = 7
    SUPERVISOR_REVIEW_REMINDER = 7
    CALIBRATION_REMINDER = 3


# ========== Default Values ==========

class DefaultWeights:
    """Default weight percentages for score components"""
    KPI_WEIGHT = 70
    COMPETENCY_WEIGHT = 30
    MISSION_WEIGHT = 0
    TASK_WEIGHT = 0
    FEEDBACK_WEIGHT = 0


class DefaultRatingScale:
    """Default rating scale values"""
    MIN_VALUE = 1
    MAX_VALUE = 5
    DEFAULT_ALLOW_DECIMAL = False
    DEFAULT_REVERSE_SCORING = False


class DefaultPIPValues:
    """Default PIP values"""
    DEFAULT_DURATION_DAYS = 90
    DEFAULT_DAYS_BEFORE_ESCALATION = 30
    DEFAULT_REVIEW_FREQUENCY_DAYS = 30


# ========== Model Reference Constants ==========

class ReviewModels:
    """List of review models that can have comments/ratings"""
    SELF_ASSESSMENT = 'selfassessment'
    SUPERVISOR_REVIEW = 'supervisorreview'
    FINAL_RATING = 'finalrating'
    PIP = 'pip'
    PIP_ACTION = 'pipaction'
    CALIBRATION_RATING = 'calibrationrating'
    FEEDBACK_REQUEST = 'feedbackrequest'

    CHOICES = [
        (SELF_ASSESSMENT, 'Self Assessment'),
        (SUPERVISOR_REVIEW, 'Supervisor Review'),
        (FINAL_RATING, 'Final Rating'),
        (PIP, 'Performance Improvement Plan'),
        (PIP_ACTION, 'PIP Action'),
        (CALIBRATION_RATING, 'Calibration Rating'),
        (FEEDBACK_REQUEST, 'Feedback Request'),
    ]


# ========== Analytics & Risk Constants ==========

class RiskLevel:
    """Risk levels for predictive flight risk"""
    HIGH = 'high'
    MEDIUM = 'medium'
    LOW = 'low'
    
    CHOICES = [
        (HIGH, 'High Risk'),
        (MEDIUM, 'Medium Risk'),
        (LOW, 'Low Risk'),
    ]


class InsightType:
    """Types of generated performance insights"""
    WARNING = 'warning'
    POSITIVE = 'positive'
    NEGATIVE = 'negative'
    INFO = 'info'
    
    CHOICES = [
        (WARNING, 'Warning'),
        (POSITIVE, 'Positive'),
        (NEGATIVE, 'Negative'),
        (INFO, 'Information'),
    ]


class AnalyticsPeriod:
    """Metric aggregation periods"""
    DAILY = 'daily'
    WEEKLY = 'weekly'
    MONTHLY = 'monthly'
    QUARTERLY = 'quarterly'
    YEARLY = 'yearly'


class AnalyticsCacheKeys:
    """Cache key patterns for pre-calculated analytics"""
    COMPANY_METRICS = 'reviews:analytics:company:{tenant_id}'
    DEPARTMENT_METRICS = 'reviews:analytics:department:{tenant_id}:{dept_id}'
    MANAGER_METRICS = 'reviews:analytics:manager:{tenant_id}:{manager_id}'


class AnalyticsThresholds:
    """Default threshold percentages and timeframes for analytics"""
    RATING_INFLATION = 15.0       # Inflation trigger above company average %
    RATING_DEFLATION = 15.0       # Deflation trigger below company average %
    FLIGHT_RISK_YEARS = 2.0       # Years without promotion/review trigger

    