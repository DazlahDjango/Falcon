from django.db import models
from .base import BaseConfigModel
from .backup_job import BackupJob
from apps.configs.managers.backup_artifact_manager import BackupArtifactManager

class BackupArtifact(BaseConfigModel):
    STORAGE_LOCATION_CHOICES = [('s3', 'AWS S3'), ('gcs', 'Google Cloud Storage'), ('azure', 'Azure Blob'), ('local', 'Local Filesystem'), ('nfs', 'Network File System'), ('tape', 'Tape Archive')]
    STATUS_CHOICES = [('uploaded', 'Uploaded'), ('verifying', 'Verifying'), ('verified', 'Verified'), ('corrupt', 'Corrupt - Failing Integrity'), ('deleted', 'Deleted by Retention'), ('archived', 'Archived to Glacier')]
    
    backup_job = models.OneToOneField(BackupJob, on_delete=models.CASCADE, related_name='artifact')
    storage_location = models.CharField(max_length=20, choices=STORAGE_LOCATION_CHOICES, default='s3')
    storage_path = models.CharField(max_length=1000, help_text="Full S3 URI or file system path")
    encrypted_key_id = models.CharField(max_length=255, help_text="KMS key ID used for encryption")
    iv_initialization_vector = models.CharField(max_length=255, blank=True, help_text="Base64 encoded IV for decryption")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded', db_index=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verification_checksum = models.CharField(max_length=128, blank=True)
    download_url_expires_at = models.DateTimeField(null=True, blank=True, help_text="Pre-signed URL expiration")
    restored_at = models.DateTimeField(null=True, blank=True, help_text="When this backup was last used for restore")
    restore_count = models.IntegerField(default=0)
    archived_at = models.DateTimeField(null=True, blank=True)
    archive_tier = models.CharField(max_length=50, blank=True, help_text="Glacier, Deep Archive, etc.")
    
    objects = BackupArtifactManager()
    
    class Meta:
        db_table = 'config_backup_artifact'
        indexes = [models.Index(fields=['storage_location', 'status']), models.Index(fields=['verified_at']), models.Index(fields=['archived_at'])]
    
    def __str__(self):
        return f"Artifact for {self.backup_job} - {self.status}"