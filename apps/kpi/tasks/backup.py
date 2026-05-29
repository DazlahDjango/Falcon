import logging
from celery import shared_task
logger = logging.getLogger(__name__)

@shared_task(bind=True)
def daily_backup_task(self, backup_type='database'):
    from django.core.management import call_command

    try:
        call_command('backup', type=backup_type, destination='s3')
        logger.info(f"Daily {backup_type} backup completed")
        return {'status': 'SUCCESS', 'type': backup_type}
    except Exception as e:
        logger.error(f"Daily backup failed: {e}")
        return {'status': 'FAILED', 'type': backup_type, 'error': str(e)}


@shared_task(bind=True)
def full_backup_task(self):
    """Perform weekly full backup"""
    from django.core.management import call_command

    try:
        call_command('backup', type='full', destination='both')
        logger.info("Weekly full backup completed")
        return {'status': 'SUCCESS', 'type': 'full'}
    except Exception as e:
        logger.error(f"Weekly full backup failed: {e}")
        return {'status': 'FAILED', 'type': 'full', 'error': str(e)}


@shared_task(bind=True)
def archive_backup_task(self):
    """Archive old backups to Glacier"""
    import boto3
    from django.conf import settings

    s3 = boto3.client('s3')
    bucket = settings.BACKUP_BUCKET

    # List backups older than 30 days
    response = s3.list_objects_v2(
        Bucket=bucket,
        Prefix='backups/'
    )

    archived = []
    for obj in response.get('Contents', []):
        # Check age
        import datetime
        age = datetime.datetime.now() - obj['LastModified'].replace(tzinfo=None)

        if age.days > 30:
            # Move to Glacier
            s3.copy_object(
                Bucket=bucket,
                CopySource={'Bucket': bucket, 'Key': obj['Key']},
                Key=obj['Key'].replace('backups/', 'archives/'),
                StorageClass='GLACIER'
            )
            # Delete original
            s3.delete_object(Bucket=bucket, Key=obj['Key'])
            archived.append(obj['Key'])

    logger.info(f"Archived {len(archived)} old backups to Glacier")
    return {'status': 'SUCCESS', 'archived': len(archived)}


@shared_task(bind=True)
def cleanup_old_backups_task(self, days_to_keep=30):
    """Clean up old backup files"""
    import os
    import glob
    import datetime

    backup_dir = '/tmp/backups'
    cutoff = datetime.datetime.now() - datetime.timedelta(days=days_to_keep)

    deleted = 0
    for backup_file in glob.glob(f"{backup_dir}/backup_*"):
        file_time = datetime.datetime.fromtimestamp(os.path.getctime(backup_file))
        if file_time < cutoff:
            os.remove(backup_file)
            deleted += 1

    logger.info(f"Cleaned up {deleted} old backup files")
    return {'status': 'SUCCESS', 'deleted': deleted}