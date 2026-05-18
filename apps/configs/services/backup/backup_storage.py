import os
import boto3
from django.conf import settings
from datetime import datetime, timedelta
from apps.configs.constants import StorageLocation
from apps.configs.exceptions import StorageError

class BackupStorage:
    def __init__(self):
        self.storage_type = getattr(settings, 'BACKUP_STORAGE_TYPE', 's3')
        self.bucket_name = getattr(settings, 'BACKUP_S3_BUCKET', 'falcon-pms-backups')
        self.s3_client = boto3.client('s3', region_name=getattr(settings, 'AWS_REGION', 'us-east-1')) if self.storage_type == 's3' else None
    def get_storage_type(self):
        return self.storage_type
    def upload(self, data, app_name, backup_type, checksum):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        key = f"backups/{app_name}/{backup_type}/{app_name}_{backup_type}_{timestamp}_{checksum[:8]}.enc"
        if self.storage_type == 's3':
            try:
                self.s3_client.put_object(Bucket=self.bucket_name, Key=key, Body=data, ServerSideEncryption='AES256')
                return f"s3://{self.bucket_name}/{key}"
            except Exception as e:
                raise StorageError(f"S3 upload failed: {str(e)}")
        else:
            local_path = os.path.join('/var/backups/falcon', key)
            os.makedirs(os.path.dirname(local_path), exist_ok=True)
            with open(local_path, 'wb') as f:
                f.write(data)
            return local_path
    def download(self, storage_path):
        if storage_path.startswith('s3://'):
            path_parts = storage_path.replace('s3://', '').split('/', 1)
            bucket = path_parts[0]
            key = path_parts[1]
            try:
                response = self.s3_client.get_object(Bucket=bucket, Key=key)
                return response['Body'].read()
            except Exception as e:
                raise StorageError(f"S3 download failed: {str(e)}")
        else:
            with open(storage_path, 'rb') as f:
                return f.read()
    def delete(self, storage_path):
        if storage_path.startswith('s3://'):
            path_parts = storage_path.replace('s3://', '').split('/', 1)
            bucket = path_parts[0]
            key = path_parts[1]
            try:
                self.s3_client.delete_object(Bucket=bucket, Key=key)
            except Exception as e:
                raise StorageError(f"S3 delete failed: {str(e)}")
        else:
            if os.path.exists(storage_path):
                os.remove(storage_path)
    def generate_presigned_url(self, storage_path, expires_in=3600):
        if storage_path.startswith('s3://'):
            path_parts = storage_path.replace('s3://', '').split('/', 1)
            bucket = path_parts[0]
            key = path_parts[1]
            return self.s3_client.generate_presigned_url('get_object', Params={'Bucket': bucket, 'Key': key}, ExpiresIn=expires_in)
        return None