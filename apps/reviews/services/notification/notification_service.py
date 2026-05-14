# apps/reviews/services/notification/notification_service.py
"""
Notification service for Reviews app
Sends notifications via the Notifications app
"""

from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from ..base_service import BaseReviewService


class NotificationService(BaseReviewService):
    """
    Handles all notifications for review events.
    Uses the Notifications app for in-app notifications and email.
    """
    
    @staticmethod
    def _send_notification(user, notification_type, title, message, link=None, email_template=None, email_context=None):
        """
        Internal method to send notification via Notifications app.
        
        Args:
            user: User to notify
            notification_type: Type of notification
            title: Notification title
            message: Notification message
            link: Optional URL link
            email_template: Optional email template path
            email_context: Optional context for email template
        """
        try:
            from apps.notifications.services.dispatcher import NotificationDispatcher
            
            NotificationDispatcher.send(
                user=user,
                type=notification_type,
                title=title,
                message=message,
                link=link,
                email_template=email_template,
                email_context=email_context
            )
        except ImportError:
            # Notifications app not ready - fallback to print
            print(f"NOTIFICATION to {user.email}: {title} - {message}")
    
    # ========== Cycle Notifications ==========
    
    @staticmethod
    def notify_cycle_started(cycle, participants):
        """
        Notify employees that a review cycle has started.
        
        Args:
            cycle: ReviewCycle instance
            participants: List of participating employees
        """
        for employee in participants:
            NotificationService._send_notification(
                user=employee,
                notification_type='cycle_started',
                title=f"{cycle.name} Review Cycle Started",
                message=f"The {cycle.name} review cycle has started. Please complete your self-assessment by {cycle.self_assessment_deadline}.",
                link=f"/reviews/self-assessment/{cycle.id}/",
                email_template='reviews/email/cycle_started.html',
                email_context={'cycle': cycle, 'employee': employee}
            )
    
    @staticmethod
    def notify_self_assessment_reminder(assessment):
        """
        Remind employee to complete self-assessment.
        
        Args:
            assessment: SelfAssessment instance
        """
        NotificationService._send_notification(
            user=assessment.employee,
            notification_type='self_assessment_reminder',
            title="Self Assessment Reminder",
            message=f"Please complete your self-assessment for {assessment.review_cycle.name} by {assessment.review_cycle.self_assessment_deadline}.",
            link=f"/reviews/self-assessment/{assessment.review_cycle.id}/",
            email_template='reviews/email/self_assessment_reminder.html',
            email_context={'assessment': assessment}
        )
    
    # ========== Supervisor Review Notifications ==========
    
    @staticmethod
    def notify_supervisor_review_ready(assessment):
        """
        Notify supervisor that self-assessment is ready for review.
        
        Args:
            assessment: SelfAssessment instance
        """
        supervisor = assessment.employee.manager
        if not supervisor:
            return
        
        NotificationService._send_notification(
            user=supervisor,
            notification_type='review_ready',
            title="Self Assessment Ready for Review",
            message=f"{assessment.employee.get_full_name()} has submitted their self-assessment for {assessment.review_cycle.name}. Please complete your review.",
            link=f"/reviews/supervisor-review/{assessment.review_cycle.id}/?employee={assessment.employee.id}",
            email_template='reviews/email/supervisor_review_ready.html',
            email_context={'assessment': assessment, 'supervisor': supervisor}
        )
    
    @staticmethod
    def notify_supervisor_review_reminder(review):
        """
        Remind supervisor to complete review.
        
        Args:
            review: SupervisorReview instance
        """
        NotificationService._send_notification(
            user=review.supervisor,
            notification_type='review_reminder',
            title="Review Reminder",
            message=f"Please complete your review for {review.employee.get_full_name()} by {review.review_cycle.supervisor_review_deadline}.",
            link=f"/reviews/supervisor-review/{review.review_cycle.id}/?employee={review.employee.id}",
            email_template='reviews/email/supervisor_review_reminder.html',
            email_context={'review': review}
        )
    
    @staticmethod
    def notify_review_completed(review):
        """
        Notify employee that their review is complete.
        
        Args:
            review: SupervisorReview instance
        """
        NotificationService._send_notification(
            user=review.employee,
            notification_type='review_completed',
            title="Your Review is Complete",
            message=f"Your manager has completed your review for {review.review_cycle.name}. You can view it now.",
            link=f"/reviews/summary/{review.review_cycle.id}/",
            email_template='reviews/email/review_completed.html',
            email_context={'review': review}
        )
    
    @staticmethod
    def notify_review_approved(review):
        """
        Notify employee that their review has been approved by HR.
        
        Args:
            review: SupervisorReview instance
        """
        NotificationService._send_notification(
            user=review.employee,
            notification_type='review_approved',
            title="Review Approved",
            message=f"Your {review.review_cycle.name} review has been approved by HR.",
            link=f"/reviews/summary/{review.review_cycle.id}/",
            email_template='reviews/email/review_approved.html',
            email_context={'review': review}
        )
    
    @staticmethod
    def notify_review_rejected(review, reason):
        """
        Notify employee that their review was rejected and needs revision.
        
        Args:
            review: SupervisorReview instance
            reason: Rejection reason
        """
        NotificationService._send_notification(
            user=review.employee,
            notification_type='review_rejected',
            title="Review Needs Revision",
            message=f"Your {review.review_cycle.name} review needs revision. Reason: {reason}",
            link=f"/reviews/self-assessment/{review.review_cycle.id}/",
            email_template='reviews/email/review_rejected.html',
            email_context={'review': review, 'reason': reason}
        )
    
    # ========== Final Rating Notifications ==========
    
    @staticmethod
    def notify_final_rating_complete(final_rating):
        """
        Notify employee of their final rating.
        
        Args:
            final_rating: FinalRating instance
        """
        NotificationService._send_notification(
            user=final_rating.employee,
            notification_type='final_rating_complete',
            title="Final Rating Available",
            message=f"Your final rating for {final_rating.review_cycle.name} is {final_rating.final_rating_label} ({final_rating.final_score}%).",
            link=f"/reviews/final-rating/{final_rating.review_cycle.id}/",
            email_template='reviews/email/final_rating_complete.html',
            email_context={'final_rating': final_rating}
        )
    
    # ========== PIP Notifications ==========
    
    @staticmethod
    def notify_pip_created(pip):
        """
        Notify employee and manager that a PIP has been created.
        
        Args:
            pip: PIP instance
        """
        # Notify employee
        NotificationService._send_notification(
            user=pip.employee,
            notification_type='pip_created',
            title="Performance Improvement Plan Created",
            message=f"A Performance Improvement Plan has been created for you. Please review it carefully.",
            link=f"/reviews/pip/{pip.id}/",
            email_template='reviews/email/pip_created.html',
            email_context={'pip': pip, 'is_employee': True}
        )
        
        # Notify owner (manager)
        NotificationService._send_notification(
            user=pip.owner,
            notification_type='pip_created_owner',
            title="PIP Created for Your Team Member",
            message=f"A PIP has been created for {pip.employee.get_full_name()}. Please review and schedule a meeting.",
            link=f"/reviews/pip/{pip.id}/",
            email_template='reviews/email/pip_created_owner.html',
            email_context={'pip': pip}
        )
    
    @staticmethod
    def notify_pip_reminder(pip, days_remaining):
        """
        Send PIP reminder to employee and manager.
        
        Args:
            pip: PIP instance
            days_remaining: Days until PIP end date
        """
        # Notify employee
        NotificationService._send_notification(
            user=pip.employee,
            notification_type='pip_reminder',
            title=f"PIP Deadline Approaching ({days_remaining} days left)",
            message=f"Your PIP for {pip.title} ends in {days_remaining} days. Please review your remaining actions.",
            link=f"/reviews/pip/{pip.id}/",
            email_template='reviews/email/pip_reminder.html',
            email_context={'pip': pip, 'days_remaining': days_remaining, 'is_employee': True}
        )
        
        # Notify owner
        NotificationService._send_notification(
            user=pip.owner,
            notification_type='pip_reminder_owner',
            title=f"PIP Deadline Approaching for {pip.employee.get_full_name()}",
            message=f"The PIP for {pip.employee.get_full_name()} ends in {days_remaining} days.",
            link=f"/reviews/pip/{pip.id}/",
            email_template='reviews/email/pip_reminder_owner.html',
            email_context={'pip': pip, 'days_remaining': days_remaining}
        )
    
    @staticmethod
    def notify_action_missed(action):
        """
        Notify manager that a PIP action was missed.
        
        Args:
            action: PIPAction instance
        """
        NotificationService._send_notification(
            user=action.pip.owner,
            notification_type='pip_action_missed',
            title="PIP Action Missed Deadline",
            message=f"Action '{action.title}' for {action.pip.employee.get_full_name()} is overdue.",
            link=f"/reviews/pip/{action.pip.id}/",
            email_template='reviews/email/pip_action_missed.html',
            email_context={'action': action}
        )
    
    @staticmethod
    def notify_pip_escalated(pip):
        """
        Notify HR that a PIP has been escalated.
        
        Args:
            pip: PIP instance
        """
        # Find HR users (simplified - adjust based on your HR identification)
        hr_users = []
        
        for user in pip.tenant.users.filter(role__in=['hr', 'admin']):
            hr_users.append(user)
        
        for hr in hr_users:
            NotificationService._send_notification(
                user=hr,
                notification_type='pip_escalated',
                title="PIP Escalation Required",
                message=f"PIP for {pip.employee.get_full_name()} has shown no progress for 30 days. Requires HR review.",
                link=f"/reviews/pip/{pip.id}/",
                email_template='reviews/email/pip_escalated.html',
                email_context={'pip': pip}
            )
    
    @staticmethod
    def notify_pip_completed(pip):
        """
        Notify employee and manager when PIP is completed.
        
        Args:
            pip: PIP instance
        """
        outcome_text = "successfully completed" if pip.outcome == 'successful' else "was not successfully completed"
        
        # Notify employee
        NotificationService._send_notification(
            user=pip.employee,
            notification_type='pip_completed',
            title=f"PIP {outcome_text}",
            message=f"Your Performance Improvement Plan has {outcome_text}.",
            link=f"/reviews/pip/{pip.id}/",
            email_template='reviews/email/pip_completed.html',
            email_context={'pip': pip, 'outcome_text': outcome_text}
        )
        
        # Notify owner
        NotificationService._send_notification(
            user=pip.owner,
            notification_type='pip_completed_owner',
            title=f"PIP {outcome_text} for {pip.employee.get_full_name()}",
            message=f"The PIP for {pip.employee.get_full_name()} has {outcome_text}.",
            link=f"/reviews/pip/{pip.id}/",
            email_template='reviews/email/pip_completed_owner.html',
            email_context={'pip': pip, 'outcome_text': outcome_text}
        )
    
    # ========== Calibration Notifications ==========
    
    @staticmethod
    def notify_calibration_invited(session, participant):
        """
        Notify manager that they are invited to a calibration session.
        
        Args:
            session: CalibrationSession instance
            participant: User being invited
        """
        NotificationService._send_notification(
            user=participant,
            notification_type='calibration_invited',
            title="Calibration Session Invitation",
            message=f"You have been invited to a calibration session for {session.review_cycle.name} on {session.scheduled_date}.",
            link=f"/reviews/calibration/{session.id}/",
            email_template='reviews/email/calibration_invited.html',
            email_context={'session': session, 'participant': participant}
        )
    
    @staticmethod
    def notify_calibration_completed(session, participant):
        """
        Notify participant that calibration session is complete.
        
        Args:
            session: CalibrationSession instance
            participant: User being notified
        """
        NotificationService._send_notification(
            user=participant,
            notification_type='calibration_completed',
            title="Calibration Session Completed",
            message=f"The calibration session for {session.review_cycle.name} has been completed.",
            link=f"/reviews/calibration/{session.id}/summary/",
            email_template='reviews/email/calibration_completed.html',
            email_context={'session': session}
        )
    
    # ========== Feedback Notifications ==========
    
    @staticmethod
    def notify_feedback_requested(request):
        """
        Notify reviewer that feedback has been requested.
        
        Args:
            request: FeedbackRequest instance
        """
        NotificationService._send_notification(
            user=request.reviewer,
            notification_type='feedback_requested',
            title="Feedback Requested",
            message=f"Please provide feedback for {request.subject.get_full_name()} for {request.review_cycle.name}.",
            link=f"/reviews/feedback/{request.id}/",
            email_template='reviews/email/feedback_requested.html',
            email_context={'request': request}
        )
    
    @staticmethod
    def notify_feedback_reminder(request):
        """
        Remind reviewer about pending feedback request.
        
        Args:
            request: FeedbackRequest instance
        """
        NotificationService._send_notification(
            user=request.reviewer,
            notification_type='feedback_reminder',
            title="Feedback Reminder",
            message=f"Reminder: Please provide feedback for {request.subject.get_full_name()} by {request.due_date}.",
            link=f"/reviews/feedback/{request.id}/",
            email_template='reviews/email/feedback_reminder.html',
            email_context={'request': request}
        )