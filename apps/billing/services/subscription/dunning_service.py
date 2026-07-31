import logging
from django.utils import timezone
from apps.billing.models import Subscription, Transaction
from apps.billing.constants import SubscriptionStatus

logger = logging.getLogger(__name__)

class DunningService:
    """
    Automated Subscription Dunning Workflow.
    Manages payment failure escalation through 3 distinct stages:
      - Day 1: Soft warning notification
      - Day 3: Hard retry alert
      - Day 7: Transition to past_due / account suspension alert
    """

    def process_past_due_dunning(self):
        now = timezone.now()
        past_due_subs = Subscription.objects.filter(
            status__in=[SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE]
        ).select_related('organization')

        processed_count = 0
        for sub in past_due_subs:
            # Find latest transaction for this subscription
            latest_tx = Transaction.objects.filter(
                organization=sub.organization
            ).order_by('-created_at').first()

            if not latest_tx or latest_tx.status != 'failed':
                continue

            days_failed = (now - latest_tx.created_at).days

            if days_failed >= 7 and sub.status != SubscriptionStatus.PAST_DUE:
                logger.warning(f"Subscription for organization {sub.organization.name} exceeded 7-day dunning window. Marking past_due.")
                sub.status = SubscriptionStatus.PAST_DUE
                sub.save(update_fields=['status'])
                self._send_dunning_notification(sub, stage=3)
                processed_count += 1
            elif days_failed >= 3:
                self._send_dunning_notification(sub, stage=2)
                processed_count += 1
            elif days_failed >= 1:
                self._send_dunning_notification(sub, stage=1)
                processed_count += 1

        return processed_count

    def _send_dunning_notification(self, subscription, stage: int):
        from apps.billing.tasks import send_billing_notification_task
        stage_messages = {
            1: "Notice: Payment attempt failed. Please update your payment details.",
            2: "Urgent: Payment past due. Retrying payment in 24 hours.",
            3: "Final Notice: Your subscription has been set to past-due status."
        }
        msg = stage_messages.get(stage, "Payment failed notification.")
        logger.info(f"Dunning stage {stage} triggered for org {subscription.organization_id}")
        send_billing_notification_task.delay(str(subscription.organization_id), msg)
