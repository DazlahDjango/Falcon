# apps/reviews/services/notification/__init__.py
"""
Notification services package for Reviews app
Sends notifications via the Notifications app
"""

from .notification_service import NotificationService

__all__ = [
    'NotificationService',
]