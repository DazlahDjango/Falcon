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
async def test_configs_consumers():
    user = await User.objects.acreate(
        email="test_configs_ws@example.com",
        username="test_configs_ws",
        tenant_id="275adb1f-8e12-46ee-b394-ea42d41b10c9",
        role="super_admin"
    )

    tokens = await sync_to_async(jwt_service.create_token)(user)
    token = tokens["access"]
    tenant_id = "275adb1f-8e12-46ee-b394-ea42d41b10c9"

    # 1. MaintenanceStatusConsumer
    comm_maint = WebsocketCommunicator(application, f"/ws/config/maintenance/{tenant_id}/?token={token}")
    connected, _ = await comm_maint.connect()
    assert connected
    await comm_maint.disconnect()

    # 2. BackupProgressConsumer
    comm_backup = WebsocketCommunicator(application, f"/ws/config/backup/backup-job-100/?token={token}")
    connected, _ = await comm_backup.connect()
    assert connected
    await comm_backup.disconnect()

    # 3. DRProgressConsumer
    comm_dr = WebsocketCommunicator(application, f"/ws/config/dr/dr-exec-200/?token={token}")
    connected, _ = await comm_dr.connect()
    assert connected
    await comm_dr.disconnect()
