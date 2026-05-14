# apps/reviews/routing.py
"""
WebSocket routing configuration for Reviews app
"""

from django.urls import re_path, path
from .consumers import (
    ReviewStatusConsumer,
    CalibrationConsumer,
    NotificationConsumer,
)

# Reviews app WebSocket URL patterns
websocket_urlpatterns = [
    # Real-time review status for a specific cycle
    # Example: ws://domain/ws/reviews/status/cycle-123/
    re_path(
        r'^ws/reviews/status/(?P<cycle_id>[\w-]+)/$',
        ReviewStatusConsumer.as_asgi(),
        name='reviews_status'
    ),
    
    # Live calibration session chat and rating adjustments
    # Example: ws://domain/ws/reviews/calibration/session-456/
    re_path(
        r'^ws/reviews/calibration/(?P<session_id>[\w-]+)/$',
        CalibrationConsumer.as_asgi(),
        name='reviews_calibration'
    ),
    
    # Real-time user notifications
    # Example: ws://domain/ws/reviews/notifications/
    path(
        'ws/reviews/notifications/',
        NotificationConsumer.as_asgi(),
        name='reviews_notifications'
    ),
]