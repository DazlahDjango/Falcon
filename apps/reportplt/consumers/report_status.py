# apps/reportplt/consumers/report_status.py
import json
import logging
from typing import Dict, Any
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from apps.reportplt.models import Report, ReportExecution
from apps.accounts.models import User

logger = logging.getLogger(__name__)

class ReportStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.report_id = self.scope['url_route']['kwargs'].get('report_id')
        self.group_name = f"report_{self.report_id}"
        self.user = self.scope.get('user')
        if not self.user or self.user.is_anonymous:
            await self.close(code=4001)
            return
        try:
            report = await self.get_report(self.report_id)
            if not await self.has_access(report):
                await self.close(code=4003)
                return
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            await self.send_report_status()
            logger.info(f"Report status consumer connected: {self.report_id} - {self.user.email}")
        except Exception as e:
            logger.error(f"Report status connection failed: {str(e)}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
            logger.info(f"Report status consumer disconnected: {self.report_id}")
        except Exception as e:
            logger.error(f"Report status disconnect failed: {str(e)}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data.get('action')
            if action == 'refresh':
                await self.send_report_status()
            elif action == 'cancel_generation':
                await self.cancel_generation()
            elif action == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong', 'timestamp': timezone.now().isoformat()}))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'type': 'error', 'message': 'Invalid JSON'}))
        except Exception as e:
            logger.error(f"Report status receive error: {str(e)}")
            await self.send(text_data=json.dumps({'type': 'error', 'message': str(e)}))

    async def report_message(self, event):
        content = event.get('content')
        if isinstance(content, str):
            try:
                content = json.loads(content)
            except:
                pass
        await self.send(text_data=json.dumps(content))

    async def send_report_status(self):
        try:
            status = await self.get_report_status(self.report_id)
            await self.send(text_data=json.dumps({
                'type': 'report_status',
                'report_id': self.report_id,
                'data': status,
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Failed to send report status: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f"Failed to load report status: {str(e)}"
            }))

    async def cancel_generation(self):
        try:
            await self.update_report_status('cancelled')
            await self.send(text_data=json.dumps({
                'type': 'generation_cancelled',
                'report_id': self.report_id,
                'timestamp': timezone.now().isoformat()
            }))
        except Exception as e:
            logger.error(f"Failed to cancel generation: {str(e)}")

    @database_sync_to_async
    def get_report(self, report_id: str) -> Report:
        try:
            return Report.objects.get(id=report_id)
        except ObjectDoesNotExist:
            return None

    @database_sync_to_async
    def has_access(self, report: Report) -> bool:
        if not self.user:
            return False
        if self.user.is_superuser or self.user.role == 'super_admin':
            return True
        if str(report.tenant_id) != str(self.user.tenant_id):
            return False
        if report.owner_id == self.user.id:
            return True
        if report.is_public:
            return True
        if self.user.role in report.allowed_roles:
            return True
        if self.user.department and self.user.department in report.allowed_departments:
            return True
        return False

    @database_sync_to_async
    def get_report_status(self, report_id: str) -> Dict:
        try:
            report = Report.objects.get(id=report_id)
            executions = ReportExecution.objects.filter(report=report).order_by('-created_at')[:5]
            result = {
                'report_name': report.name,
                'status': report.status,
                'last_generated_at': report.last_generated_at.isoformat() if report.last_generated_at else None,
                'progress': 0,
                'executions': []
            }
            if report.status == 'generating':
                result['progress'] = 50
            elif report.status == 'completed':
                result['progress'] = 100
            for execution in executions:
                result['executions'].append({
                    'id': str(execution.id),
                    'status': execution.status,
                    'started_at': execution.started_at.isoformat() if execution.started_at else None,
                    'completed_at': execution.completed_at.isoformat() if execution.completed_at else None,
                    'duration': execution.duration,
                    'row_count': execution.row_count,
                    'error_message': execution.error_message
                })
            return result
        except ObjectDoesNotExist:
            return {'error': 'Report not found'}

    @database_sync_to_async
    def update_report_status(self, status: str):
        try:
            report = Report.objects.get(id=self.report_id)
            report.status = status
            report.save(update_fields=['status'])
        except ObjectDoesNotExist:
            pass