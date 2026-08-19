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
async def test_tenant_consumers_auth_and_events():
    user = await User.objects.acreate(
        email="superadmin_tenant_test@example.com",
        username="superadmin_tenant_test",
        tenant_id="275adb1f-8e12-46ee-b394-ea42d41b10c9",
        role="super_admin"
    )

    tokens = await sync_to_async(jwt_service.create_token)(user)
    token = tokens["access"]
    org_id = "275adb1f-8e12-46ee-b394-ea42d41b10c9"

    # 1. OrganizationStatusConsumer
    comm_status = WebsocketCommunicator(application, f"/ws/organizations/{org_id}/status/?token={token}")
    connected, _ = await comm_status.connect()
    assert connected
    await comm_status.disconnect()

    # 2. ProvisioningConsumer
    comm_prov = WebsocketCommunicator(application, f"/ws/organizations/{org_id}/provisioning/?token={token}")
    connected, _ = await comm_prov.connect()
    assert connected
    await comm_prov.disconnect()

    # 3. ConnectionEventConsumer
    comm_conn = WebsocketCommunicator(application, f"/ws/connections/?token={token}")
    connected, _ = await comm_conn.connect()
    assert connected
    await comm_conn.disconnect()

    # 4. SystemAlertConsumer
    comm_alert = WebsocketCommunicator(application, f"/ws/system/alerts/?token={token}")
    connected, _ = await comm_alert.connect()
    assert connected
    await comm_alert.disconnect()
