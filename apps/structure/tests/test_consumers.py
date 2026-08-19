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
async def test_structure_consumers():
    user = await User.objects.acreate(
        email="test_struct_ws@example.com",
        username="test_struct_ws",
        tenant_id="275adb1f-8e12-46ee-b394-ea42d41b10c9",
        role="super_admin"
    )

    tokens = await sync_to_async(jwt_service.create_token)(user)
    token = tokens["access"]
    tenant_id = "275adb1f-8e12-46ee-b394-ea42d41b10c9"

    # 1. OrgEventsConsumer
    comm_org = WebsocketCommunicator(application, f"/ws/structure/{tenant_id}/events/?token={token}")
    connected, _ = await comm_org.connect()
    assert connected
    await comm_org.disconnect()

    # 2. ReportingChainConsumer
    comm_rep = WebsocketCommunicator(application, f"/ws/structure/{tenant_id}/reporting/?token={token}")
    connected, _ = await comm_rep.connect()
    assert connected
    await comm_rep.disconnect()

    # 3. PermissionsSyncConsumer
    comm_perm = WebsocketCommunicator(application, f"/ws/structure/{tenant_id}/permissions/?token={token}")
    connected, _ = await comm_perm.connect()
    assert connected
    await comm_perm.disconnect()
