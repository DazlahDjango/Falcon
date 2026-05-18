from django.db import models
from .base import BaseConfigModel

class EncryptionKey(BaseConfigModel):
    KEY_STATUS_CHOICES = [('active', 'Active - Currently Used'), ('inactive', 'Inactive - Not Used'), ('compromised', 'Compromised - Needs Rotation'), ('expired', 'Expired - Cannot Use'), ('deleted', 'Deleted')]
    KEY_SOURCE_CHOICES = [('aws_kms', 'AWS KMS'), ('gcp_kms', 'Google Cloud KMS'), ('azure_keyvault', 'Azure Key Vault'), ('hashicorp_vault', 'HashiCorp Vault'), ('local_hsm', 'Local HSM')]
    
    key_id = models.CharField(max_length=255, unique=True, db_index=True, help_text="External KMS key ID or ARN")
    key_alias = models.CharField(max_length=255, unique=True)
    key_source = models.CharField(max_length=50, choices=KEY_SOURCE_CHOICES)
    key_status = models.CharField(max_length=20, choices=KEY_STATUS_CHOICES, default='active', db_index=True)
    key_region = models.CharField(max_length=50, blank=True)
    key_arn = models.CharField(max_length=500, blank=True, help_text="Full ARN if AWS")
    is_default = models.BooleanField(default=False, help_text="Is this the default encryption key?")
    activated_at = models.DateTimeField()
    rotated_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    usage_count = models.IntegerField(default=0)
    rotated_by = models.UUIDField(null=True, blank=True)
    rotation_reason = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'config_encryption_key'
        indexes = [models.Index(fields=['key_status', 'is_default']), models.Index(fields=['key_source', 'key_status']), models.Index(fields=['expires_at'])]
    
    def __str__(self):
        return f"{self.key_alias} - {self.key_status} ({self.key_source})"