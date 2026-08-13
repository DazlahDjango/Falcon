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
async def test_dashboard_consumers():
    user = await User.objects.acreate(
        email="test_dashboard_ws@example.com",
        username="test_dashboard_ws",
        tenant_id="275adb1f-8e12-46ee-b394-ea42d41b10c9",
        role="super_admin"
    )

    tokens = await sync_to_async(jwt_service.create_token)(user)
    token = tokens["access"]

    # 1. DashboardConsumer
    comm_dash = WebsocketCommunicator(application, f"/ws/dashboard/super_admin/?token={token}")
    connected, _ = await comm_dash.connect()
    assert connected
    await comm_dash.disconnect()

    # 2. DashboardNotificationConsumer
    from apps.dashboard.consumers import DashboardNotificationConsumer
    comm_notif = WebsocketCommunicator(DashboardNotificationConsumer.as_asgi(), f"/ws/notifications/?token={token}")
    comm_notif.scope['user'] = user
    connected, _ = await comm_notif.connect()
    assert connected
    await comm_notif.disconnect()
