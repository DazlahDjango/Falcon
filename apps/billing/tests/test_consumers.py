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
async def test_billing_consumers():
    user = await User.objects.acreate(
        email="test_billing_ws@example.com",
        username="test_billing_ws",
        tenant_id="275adb1f-8e12-46ee-b394-ea42d41b10c9",
        role="super_admin"
    )

    tokens = await sync_to_async(jwt_service.create_token)(user)
    token = tokens["access"]
    tenant_id = "275adb1f-8e12-46ee-b394-ea42d41b10c9"

    # 1. BillingConsumer
    comm_bill = WebsocketCommunicator(application, f"/ws/billing/{tenant_id}/?token={token}")
    connected, _ = await comm_bill.connect()
    assert connected
    await comm_bill.disconnect()

    # 2. AdminBillingConsumer
    comm_admin = WebsocketCommunicator(application, f"/ws/admin/billing/?token={token}")
    connected, _ = await comm_admin.connect()
    assert connected
    await comm_admin.disconnect()
