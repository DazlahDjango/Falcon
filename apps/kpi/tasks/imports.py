import os
import logging
from celery import shared_task
from django.contrib.auth import get_user_model
from django.db import transaction
from apps.kpi.services import KPIImportExport, ActualBatchUpload
from apps.kpi.services.target import TargetImporter
from apps.tenant.context import set_current_tenant_id, clear_current_tenant_id
from apps.kpi.services.realtime.event_broadcaster import KPIEventBroadcaster

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task(bind=True, max_retries=2, default_retry_delay=60)
def process_bulk_upload_task(
    self,
    file_path: str,
    tenant_id: str,
    user_id: str,
    import_type: str,
    extra_params: dict
) -> dict:
    set_current_tenant_id(tenant_id)
    logger.info(f"Starting async bulk upload of type={import_type} for tenant={tenant_id}, user={user_id}")

    try:
        user = User.objects.get(id=user_id)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Upload file not found at: {file_path}")

        # Read the file content
        if file_path.endswith('.csv'):
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        else:
            # For Excel (.xlsx, .xls), we convert it to CSV first inside the task
            import openpyxl
            import csv
            import io
            workbook = openpyxl.load_workbook(file_path)
            sheet = workbook.active
            output = io.StringIO()
            writer = csv.writer(output)
            for row in sheet.iter_rows(values_only=True):
                writer.writerow(row)
            content = output.getvalue()

        dry_run = extra_params.get('dry_run', False)

        with transaction.atomic():
            if import_type == 'kpi':
                import_export = KPIImportExport()
                result = import_export.import_from_csv(
                    content,
                    tenant_id,
                    user,
                    dry_run=dry_run
                )
            elif import_type == 'actual':
                batch_upload = ActualBatchUpload()
                result = batch_upload.upload_from_csv(
                    content,
                    tenant_id,
                    user,
                    dry_run=dry_run
                )
            elif import_type == 'target':
                target_importer = TargetImporter()
                result = target_importer.import_from_csv(
                    content,
                    tenant_id,
                    user
                )
                # Rollback target importer if dry_run is set
                if dry_run:
                    transaction.set_rollback(True)
            else:
                raise ValueError(f"Invalid import type: {import_type}")

        # Broadcast progress/completion success notification via WebSocket
        KPIEventBroadcaster._group_send(
            f"user_{user_id}",
            "notification",
            {
                "event": "bulk_upload_completed",
                "import_type": import_type,
                "created_count": result.get("created", 0) if isinstance(result.get("created"), int) else len(result.get("created", [])),
                "total_rows": result.get("total", 0),
                "errors_count": len(result.get("errors", [])),
                "dry_run": dry_run,
                "message": f"Bulk import for {import_type} completed successfully."
            }
        )

        return {
            'status': 'SUCCESS',
            'created': result.get('created', 0) if isinstance(result.get('created'), int) else len(result.get('created', [])),
            'errors': result.get('errors', []),
            'total': result.get('total', 0)
        }

    except Exception as e:
        logger.exception(f"Async bulk upload task failed: {e}")
        # Broadcast failure notification via WebSocket
        KPIEventBroadcaster._group_send(
            f"user_{user_id}",
            "notification",
            {
                "event": "bulk_upload_failed",
                "import_type": import_type,
                "error": str(e),
                "message": f"Bulk import for {import_type} failed: {str(e)}"
            }
        )
        raise self.retry(exc=e)

    finally:
        # Clean up the temporary upload file
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"Cleaned up temporary upload file: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to delete temporary file {file_path}: {e}")
        clear_current_tenant_id()
