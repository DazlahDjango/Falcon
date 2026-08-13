import pytest
import json
from asgiref.sync import sync_to_async
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from apps.accounts.services.auth.jwt import JWTServices
from config.routing import application

User = get_user_model()
jwt_service = JWTServices()
channel_layer = get_channel_layer()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_reviews_consumers():
    user = await User.objects.acreate(
        email="test_reviews_ws@example.com",
        username="test_reviews_ws",
        tenant_id="275adb1f-8e12-46ee-b394-ea42d41b10c9",
        role="super_admin"
    )

    tokens = await sync_to_async(jwt_service.create_token)(user)
    token = tokens["access"]

    # 1. ReviewStatusConsumer
    comm_status = WebsocketCommunicator(application, f"/ws/reviews/status/cycle-123/?token={token}")
    connected, _ = await comm_status.connect()
    assert connected
    await comm_status.disconnect()

    # 2. CalibrationConsumer
    comm_calib = WebsocketCommunicator(application, f"/ws/reviews/calibration/session-456/?token={token}")
    connected, _ = await comm_calib.connect()
    assert connected
    await comm_calib.disconnect()

    # 3. NotificationConsumer
    comm_notif = WebsocketCommunicator(application, f"/ws/reviews/notifications/?token={token}")
    connected, _ = await comm_notif.connect()
    assert connected
    await comm_notif.disconnect()

    # 4. ReviewsDashboardConsumer
    comm_dash = WebsocketCommunicator(application, f"/ws/reviews/dashboard/?token={token}")
    connected, _ = await comm_dash.connect()
    assert connected
    await comm_dash.disconnect()
