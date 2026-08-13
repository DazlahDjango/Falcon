import pytest
import json
from asgiref.sync import sync_to_async
from channels.testing import WebsocketCommunicator
from django.contrib.auth import get_user_model
from apps.accounts.services.auth.jwt import JWTServices
from config.routing import application

User = get_user_model()
jwt_service = JWTServices()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_auth_consumer_connection_and_ping():
    user = await User.objects.acreate(
        email="test_ws_auth@example.com",
        username="test_ws_auth",
        tenant_id="275adb1f-8e12-46ee-b394-ea42d41b10c9",
        role="client_admin"
    )

    tokens = await sync_to_async(jwt_service.create_token)(user)
    token = tokens["access"]

    communicator = WebsocketCommunicator(application, f"/ws/auth/?token={token}")
    connected, _ = await communicator.connect()
    assert connected

    # Receive connection response
    res = await communicator.receive_json_from()
    assert res.get("status") == "connected"
    assert res.get("user_id") == str(user.id)
    assert res.get("tenant_id") == "275adb1f-8e12-46ee-b394-ea42d41b10c9"

    # Ping test
    await communicator.send_json_to({"type": "ping"})
    pong = await communicator.receive_json_from()
    assert pong.get("type") == "pong"

    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_notification_consumer_unread_and_broadcast():
    user = await User.objects.acreate(
        email="test_ws_notif@example.com",
        username="test_ws_notif",
        tenant_id="275adb1f-8e12-46ee-b394-ea42d41b10c9",
        role="staff"
    )

    tokens = await sync_to_async(jwt_service.create_token)(user)
    token = tokens["access"]

    communicator = WebsocketCommunicator(application, f"/ws/notifications/?token={token}")
    connected, _ = await communicator.connect()
    assert connected

    res = await communicator.receive_json_from()
    assert res.get("type") == "connected"
    assert "unread_count" in res

    # Group Send Notification
    from channels.layers import get_channel_layer
    channel_layer = get_channel_layer()
    await channel_layer.group_send(
        f"notifications_{user.id}",
        {
            "type": "send_notification",
            "notification_id": "999",
            "title": "Alert",
            "message": "Test notification message",
            "level": "warning"
        }
    )

    broadcast = await communicator.receive_json_from()
    assert broadcast.get("type") == "notification"
    assert broadcast.get("title") == "Alert"
    assert broadcast.get("message") == "Test notification message"

    await communicator.disconnect()


@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
async def test_presence_consumer_online_users():
    user = await User.objects.acreate(
        email="test_ws_presence@example.com",
        username="test_ws_presence",
        tenant_id="275adb1f-8e12-46ee-b394-ea42d41b10c9",
        role="supervisor"
    )

    tokens = await sync_to_async(jwt_service.create_token)(user)
    token = tokens["access"]

    communicator = WebsocketCommunicator(application, f"/ws/presence/?token={token}")
    connected, _ = await communicator.connect()
    assert connected

    # Should receive user status change or presence list
    res = await communicator.receive_json_from()
    assert "type" in res

    await communicator.disconnect()
