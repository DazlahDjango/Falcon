from django.db import models
from django.utils import timezone
from .base import BaseManager


class DomainManager(BaseManager):
    def active_domains(self):
        return self.active().filter(status='active')
    
    def by_domain(self, domain):
        try:
            return self.get_queryset().get(domain=domain, is_deleted=False)
        except self.model.DoesNotExist:
            return None
    
    def by_client(self, client_id):
        return self.active().filter(client_id=client_id)
    
    def primary_domains(self):
        return self.active().filter(is_primary=True)
    
    def get_primary_for_client(self, client_id):
        try:
            return self.active().get(client_id=client_id, is_primary=True)
        except self.model.DoesNotExist:
            return None
    
    def pending_verification(self):
        return self.active().filter(status='pending')
    
    def verifying_domains(self):
        return self.get_queryset().filter(status='verifying', is_deleted=False)
    
    def failed_domains(self):
        return self.get_queryset().filter(status='failed', is_deleted=False)
    
    def expiring_ssl(self, days=30):
        cutoff = timezone.now() + timezone.timedelta(days=days)
        return self.active().filter(
            ssl_expires_at__lte=cutoff,
            ssl_expires_at__gt=timezone.now()
        )
    
    def expired_ssl(self):
        return self.active().filter(ssl_expires_at__lt=timezone.now())
    
    def ssl_valid(self):
        return self.active().filter(
            models.Q(ssl_expires_at__gt=timezone.now()) |
            models.Q(ssl_expires_at__isnull=True)
        )
    
    def by_status(self, status):
        return self.get_queryset().filter(status=status, is_deleted=False)
    
    def force_https_domains(self):
        return self.active().filter(force_https=True)
