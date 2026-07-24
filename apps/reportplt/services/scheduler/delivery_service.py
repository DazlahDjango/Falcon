# apps/reportplt/services/scheduler/delivery_service.py
import os
import json
import logging
from typing import Dict, Any, List, Optional
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.core.files.storage import default_storage
from django.template.loader import render_to_string
from django.utils import timezone
import requests
import boto3
from botocore.exceptions import ClientError
from apps.reportplt.models import ReportSchedule, ReportExecution
from apps.reportplt.exceptions import DeliveryError

logger = logging.getLogger(__name__)

class DeliveryService:
    def __init__(self):
        self.s3_client = None
        self._init_s3()

    def _init_s3(self):
        try:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
                region_name=os.environ.get('AWS_REGION', 'us-east-1')
            )
        except Exception:
            self.s3_client = None
            logger.warning("S3 client initialization failed")

    def deliver(self, schedule: ReportSchedule, execution: ReportExecution, report_data: Optional[Dict] = None, export_path: Optional[str] = None) -> Dict[str, Any]:
        results = {'success': True, 'methods': [], 'errors': []}
        delivery_methods = schedule.delivery_method if isinstance(schedule.delivery_method, list) else [schedule.delivery_method]
        for method in delivery_methods:
            try:
                if method == 'email':
                    self._deliver_email(schedule, execution, export_path)
                elif method == 'download':
                    result = self._deliver_download(schedule, execution)
                elif method == 's3':
                    self._deliver_s3(schedule, execution, export_path)
                elif method == 'webhook':
                    self._deliver_webhook(schedule, execution, report_data)
                else:
                    raise DeliveryError(f"Unsupported delivery method: {method}")
                results['methods'].append({'method': method, 'status': 'success'})
            except Exception as e:
                logger.error(f"Delivery method {method} failed: {str(e)}")
                results['methods'].append({'method': method, 'status': 'failed', 'error': str(e)})
                results['errors'].append(f"{method}: {str(e)}")
        if results['errors']:
            results['success'] = False
        if results['success']:
            execution.mark_delivered(', '.join(delivery_methods))
        return results

    def _deliver_email(self, schedule: ReportSchedule, execution: ReportExecution, export_path: Optional[str] = None) -> None:
        recipients = self._get_all_recipients(schedule)
        if not recipients:
            raise DeliveryError("No recipients specified for email delivery")
        subject = f"Report: {schedule.report.name} - {timezone.now().strftime('%Y-%m-%d')}"
        context = {
            'report_name': schedule.report.name,
            'schedule_name': schedule.name,
            'date': timezone.now().strftime('%B %d, %Y'),
            'message': schedule.custom_params.get('message', ''),
            'execution_id': str(execution.id)
        }
        html_body = render_to_string('reportplt/email/report_ready.html', context)
        text_body = f"Report {schedule.report.name} is ready for download."
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@falcon.com'),
            to=recipients,
            cc=schedule.cc_recipients,
            bcc=schedule.bcc_recipients
        )
        email.attach_alternative(html_body, "text/html")
        if export_path and schedule.include_attachments and default_storage.exists(export_path):
            with default_storage.open(export_path, 'rb') as f:
                file_name = os.path.basename(export_path)
                email.attach(file_name, f.read(), self._get_mime_type(export_path))
        email.send()

    def _deliver_download(self, schedule: ReportSchedule, execution: ReportExecution) -> Dict[str, Any]:
        from apps.reportplt.services.security.export_security import ExportSecurity
        export_security = ExportSecurity()
        token = export_security.generate_download_token(
            str(execution.id),
            str(schedule.owner_id),
            86400
        )
        download_url = f"/api/v1/reports/download/{token}"
        return {'method': 'download', 'url': download_url, 'token': token}

    def _deliver_s3(self, schedule: ReportSchedule, execution: ReportExecution, export_path: Optional[str]) -> None:
        if not self.s3_client:
            raise DeliveryError("S3 client not configured")
        if not export_path or not default_storage.exists(export_path):
            raise DeliveryError("No export file available for S3 upload")
        bucket = os.environ.get('AWS_STORAGE_BUCKET_NAME')
        if not bucket:
            raise DeliveryError("S3 bucket not configured")
        s3_key = schedule.s3_path or f"reports/{schedule.tenant_id}/{schedule.report_id}/{os.path.basename(export_path)}"
        try:
            with default_storage.open(export_path, 'rb') as f:
                self.s3_client.upload_fileobj(
                    f,
                    bucket,
                    s3_key,
                    ExtraArgs={'ContentType': self._get_mime_type(export_path)}
                )
            logger.info(f"File uploaded to S3: {s3_key}")
        except ClientError as e:
            raise DeliveryError(f"S3 upload failed: {str(e)}")

    def _deliver_webhook(self, schedule: ReportSchedule, execution: ReportExecution, report_data: Optional[Dict]) -> None:
        if not schedule.webhook_url:
            raise DeliveryError("Webhook URL not configured")
        payload = {
            'schedule_id': str(schedule.id),
            'execution_id': str(execution.id),
            'report_id': str(schedule.report.id),
            'report_name': schedule.report.name,
            'timestamp': timezone.now().isoformat(),
            'status': execution.status,
            'data': report_data,
            'recipients': self._get_all_recipients(schedule)
        }
        headers = {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': self._generate_signature(payload)
        }
        try:
            response = requests.post(
                schedule.webhook_url,
                json=payload,
                headers=headers,
                timeout=30
            )
            response.raise_for_status()
            logger.info(f"Webhook delivered to {schedule.webhook_url}")
        except requests.RequestException as e:
            raise DeliveryError(f"Webhook delivery failed: {str(e)}")

    def _get_all_recipients(self, schedule: ReportSchedule) -> List[str]:
        recipients = list(schedule.recipients) if schedule.recipients else []
        return list(set(recipients))

    def _get_mime_type(self, file_path: str) -> str:
        from apps.reportplt.constants import REPORT_MIME_TYPES
        ext = os.path.splitext(file_path)[1].lower().lstrip('.')
        return REPORT_MIME_TYPES.get(ext, 'application/octet-stream')

    def _generate_signature(self, payload: Dict) -> str:
        import hmac
        import hashlib
        secret = os.environ.get('WEBHOOK_SIGNING_SECRET', 'default-secret').encode()
        data = json.dumps(payload, sort_keys=True).encode()
        return hmac.new(secret, data, hashlib.sha256).hexdigest()

    def send_test_email(self, recipient: str) -> bool:
        try:
            email = EmailMessage(
                subject="Test Email from Falcon PMS",
                body="This is a test email to verify email delivery configuration.",
                from_email=os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@falcon.com'),
                to=[recipient]
            )
            email.send()
            return True
        except Exception as e:
            logger.error(f"Test email failed: {str(e)}")
            return False

    def test_s3_connection(self) -> bool:
        if not self.s3_client:
            return False
        try:
            bucket = os.environ.get('AWS_STORAGE_BUCKET_NAME')
            if not bucket:
                return False
            self.s3_client.head_bucket(Bucket=bucket)
            return True
        except ClientError:
            return False

    def test_webhook(self, url: str) -> bool:
        try:
            payload = {'test': True, 'timestamp': timezone.now().isoformat()}
            response = requests.post(url, json=payload, timeout=10)
            return response.status_code < 400
        except:
            return False