import logging
from django.core.mail import send_mail, EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from ..base_service import BaseReviewService
logger = logging.getLogger(__name__)

class NotificationService(BaseReviewService):
    @staticmethod
    def _send_email(user, subject, template_name, context, recipient_list=None):
        try:
            if recipient_list is None and user:
                recipient_list = [user.email]
            
            if not recipient_list:
                logger.warning(f"No recipient for email: {subject}")
                return
            
            # Render HTML content
            html_content = render_to_string(template_name, context)
            text_content = strip_tags(html_content)
            
            # Send email
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=recipient_list,
            )
            email.attach_alternative(html_content, "text/html")
            email.send()
            
            logger.info(f"Email sent to {recipient_list}: {subject}")
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
    
    @staticmethod
    def _send_notification(user, notification_type, title, message, link=None, email_template=None, email_context=None):
        """
        Internal method to send notification.
        For version 1: Only sends email. For version 2: Will also send in-app notifications.
        
        Args:
            user: User to notify
            notification_type: Type of notification (for future use)
            title: Notification title
            message: Notification message
            link: Optional URL link
            email_template: Optional email template path
            email_context: Optional context for email template
        """
        # For version 1, just send email if template provided
        if email_template and email_context and user and user.email:
            # Ensure email_context has all needed data
            if 'title' not in email_context:
                email_context['title'] = title
            if 'message' not in email_context:
                email_context['message'] = message
            if 'link' not in email_context:
                email_context['link'] = link
            
            NotificationService._send_email(
                user=user,
                subject=title,
                template_name=email_template,
                context=email_context
            )
        elif user and user.email:
            # Fallback to simple email if no template
            try:
                send_mail(
                    subject=title,
                    message=f"{message}\n\n{link if link else ''}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )
                logger.info(f"Simple email sent to {user.email}: {title}")
            except Exception as e:
                logger.error(f"Failed to send simple email: {e}")
        
        # Log for debugging
        if settings.DEBUG:
            print(f"[NOTIFICATION] To: {user.email if user else 'Unknown'}")
            print(f"  Type: {notification_type}")
            print(f"  Title: {title}")
            print(f"  Message: {message}")
            print(f"  Link: {link}")
            print("-" * 50)
    
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
        supervisor = NotificationService._get_manager(assessment.employee)
        if not supervisor:
            logger.warning(f"No manager found for employee {assessment.employee.id}")
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
    
    # ========== Promotion Notifications ==========
    
    @staticmethod
    def notify_promotion_created(promotion):
        """
        Notify HR that a promotion recommendation has been created.
        
        Args:
            promotion: PromotionRecommendation instance
        """
        # Find HR users (simplified - adjust based on your User model)
        hr_users = []
        if hasattr(promotion.tenant, 'users'):
            hr_users = promotion.tenant.users.filter(role__in=['hr', 'admin'])
        
        for hr in hr_users:
            NotificationService._send_notification(
                user=hr,
                notification_type='promotion_created',
                title="Promotion Recommendation Created",
                message=f"{promotion.employee.get_full_name()} has been recommended for promotion to {promotion.recommended_role}.",
                link=f"/reviews/promotions/{promotion.id}/",
                email_template='reviews/email/promotion_created.html',
                email_context={'promotion': promotion}
            )
    
    @staticmethod
    def notify_promotion_approved(promotion):
        """
        Notify employee that their promotion has been approved.
        
        Args:
            promotion: PromotionRecommendation instance
        """
        NotificationService._send_notification(
            user=promotion.employee,
            notification_type='promotion_approved',
            title="Promotion Approved! 🎉",
            message=f"Congratulations! Your promotion to {promotion.recommended_role} has been approved.",
            link=f"/reviews/promotions/{promotion.id}/",
            email_template='reviews/email/promotion_approved.html',
            email_context={'promotion': promotion}
        )
    
    @staticmethod
    def notify_promotion_rejected(promotion, reason):
        """
        Notify employee that their promotion was rejected.
        
        Args:
            promotion: PromotionRecommendation instance
            reason: Rejection reason
        """
        NotificationService._send_notification(
            user=promotion.employee,
            notification_type='promotion_rejected',
            title="Promotion Update",
            message=f"Your promotion recommendation has been reviewed. Please contact HR for details.",
            link=f"/reviews/promotions/{promotion.id}/",
            email_template='reviews/email/promotion_rejected.html',
            email_context={'promotion': promotion, 'reason': reason}
        )

    @staticmethod
    def notify_feedback_reminder(feedback_request):
        """
        Notify reviewer that a 360 feedback request is awaiting their input.
        """
        try:
            NotificationService._send_notification(
                user=feedback_request.reviewer,
                notification_type='feedback_reminder',
                title="Reminder: 360 Feedback Request",
                message=f"You have a pending 360-degree feedback request for {feedback_request.subject.get_full_name()}.",
                link=f"/reviews/feedback/{feedback_request.id}/",
                email_template='reviews/email/feedback_reminder.html',
                email_context={'feedback_request': feedback_request}
            )
        except Exception as e:
            logger.warning(f"Failed to send feedback reminder notification: {e}")

    @staticmethod
    def notify_calibration_invited(session, participant):
        try:
            NotificationService._send_notification(
                user=participant,
                notification_type='calibration_invited',
                title="Calibration Session Invitation",
                message=f"You are invited to the calibration session: {session.name}.",
                link=f"/reviews/calibration/sessions/{session.id}/",
                email_template='reviews/email/calibration_invited.html',
                email_context={'session': session}
            )
        except Exception as e:
            logger.warning(f"Failed to send calibration invitation notification: {e}")

    @staticmethod
    def notify_calibration_completed(session, participant):
        try:
            NotificationService._send_notification(
                user=participant,
                notification_type='calibration_completed',
                title="Calibration Session Completed",
                message=f"The calibration session {session.name} has concluded.",
                link=f"/reviews/calibration/sessions/{session.id}/",
                email_template='reviews/email/calibration_completed.html',
                email_context={'session': session}
            )
        except Exception as e:
            logger.warning(f"Failed to send calibration completed notification: {e}")

    @staticmethod
    def notify_promotion_approved(promotion):
        try:
            NotificationService._send_notification(
                user=promotion.employee,
                notification_type='promotion_approved',
                title="Promotion Approved",
                message=f"Congratulations! Your promotion to {promotion.proposed_title or 'a new role'} has been approved.",
                link=f"/reviews/promotions/{promotion.id}/",
                email_template='reviews/email/promotion_approved.html',
                email_context={'promotion': promotion}
            )
        except Exception as e:
            logger.warning(f"Failed to send promotion approved notification: {e}")

    @staticmethod
    def notify_promotion_rejected(promotion, reason=""):
        try:
            NotificationService._send_notification(
                user=promotion.recommended_by or promotion.employee,
                notification_type='promotion_rejected',
                title="Promotion Recommendation Update",
                message=f"The promotion recommendation for {promotion.employee.get_full_name()} was not approved. {reason}".strip(),
                link=f"/reviews/promotions/{promotion.id}/",
                email_template='reviews/email/promotion_rejected.html',
                email_context={'promotion': promotion, 'reason': reason}
            )
        except Exception as e:
            logger.warning(f"Failed to send promotion rejected notification: {e}")
    
    # ========== Helper Methods ==========
    
    @staticmethod
    def _get_manager(employee):
        """
        Get the manager for an employee.
        Try to get from position hierarchy first, then from user's manager field.
        
        Args:
            employee: User instance
        
        Returns:
            User or None if no manager found
        """
        # Try to get from position hierarchy
        try:
            from apps.structure.services import PositionService
            manager = PositionService.get_manager_for_employee(employee)
            if manager:
                return manager
        except ImportError:
            pass
        
        # Fallback: check if user has manager attribute
        if hasattr(employee, 'manager') and employee.manager:
            return employee.manager
        
        return None