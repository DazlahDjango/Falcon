"""
SSL Manager Service - Manages SSL certificates for custom domains.

Handles:
- SSL certificate issuance
- Certificate renewal
- Certificate validation
- Expiry monitoring
"""

import logging
from datetime import timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)


class SSLManager:
    """
    Manages SSL certificates for tenant custom domains.

    What it does:
        - Issues SSL certificates for domains
        - Checks certificate validity
        - Monitors expiry dates
        - Renews certificates before expiry

    Usage:
        manager = SSLManager()
        manager.issue_certificate(domain_id)
        manager.check_certificate_status(domain_id)
        manager.renew_expiring_certificates()
    """

    def __init__(self):
        """Initialize SSL manager."""
        self.logger = logging.getLogger(__name__)

    def issue_certificate(self, domain_id):
        """
        Issue SSL certificate for a domain.

        Args:
            domain_id: UUID of domain

        Returns:
            bool: True if issued successfully

        Note: This is a placeholder. In production, integrate with
              Let's Encrypt or another certificate authority.
        """
        self.logger.info(f"Issuing SSL certificate for domain {domain_id}")

        from apps.tenant.models import CustomDomain

        try:
            domain = CustomDomain.objects.get(id=domain_id, is_deleted=False)
        except CustomDomain.DoesNotExist:
            self.logger.error(f"Domain {domain_id} not found")
            return False

        # In production, this would call Let's Encrypt API
        # For now, simulate certificate issuance
        try:
            issued_at = timezone.now()
            expires_at = issued_at + timedelta(days=90)  # 90 day certificate

            domain.ssl_issued_at = issued_at
            domain.ssl_expires_at = expires_at
            domain.ssl_issuer = "Let's Encrypt (Simulated)"
            domain.save(update_fields=['ssl_issued_at',
                        'ssl_expires_at', 'ssl_issuer'])

            self.logger.info(f"SSL certificate issued for {domain.domain}")
            return True

        except Exception as e:
            self.logger.error(f"Failed to issue certificate: {str(e)}")
            return False

    def renew_certificate(self, domain_id):
        """
        Renew SSL certificate for a domain.

        Args:
            domain_id: UUID of domain

        Returns:
            bool: True if renewed successfully
        """
        self.logger.info(f"Renewing SSL certificate for domain {domain_id}")

        from apps.tenant.models import CustomDomain

        try:
            domain = CustomDomain.objects.get(id=domain_id, is_deleted=False)
        except CustomDomain.DoesNotExist:
            self.logger.error(f"Domain {domain_id} not found")
            return False

        # Issue new certificate
        return self.issue_certificate(domain_id)

    def check_certificate_status(self, domain_id):
        """
        Check SSL certificate status for a domain.

        Args:
            domain_id: UUID of domain

        Returns:
            dict: Certificate status information
        """
        from apps.tenant.models import CustomDomain

        try:
            domain = CustomDomain.objects.get(id=domain_id, is_deleted=False)
        except CustomDomain.DoesNotExist:
            return {'error': 'Domain not found'}

        now = timezone.now()
        is_valid = False
        days_remaining = 0

        if domain.ssl_expires_at:
            is_valid = domain.ssl_expires_at > now
            days_remaining = (domain.ssl_expires_at - now).days

        return {
            'domain': domain.domain,
            'has_certificate': domain.ssl_issued_at is not None,
            'issued_at': domain.ssl_issued_at.isoformat() if domain.ssl_issued_at else None,
            'expires_at': domain.ssl_expires_at.isoformat() if domain.ssl_expires_at else None,
            'is_valid': is_valid,
            'days_remaining': days_remaining,
            'issuer': domain.ssl_issuer,
            'needs_renewal': days_remaining < 30 if days_remaining > 0 else True,
        }

    def renew_expiring_certificates(self, days_before_expiry=30):
        """
        Renew all certificates expiring soon.

        Args:
            days_before_expiry: Renew certificates expiring within this many days

        Returns:
            dict: Renewal results
        """
        self.logger.info(
            f"Checking for certificates expiring within {days_before_expiry} days")

        from apps.tenant.models import CustomDomain
        from apps.tenant.constants import DomainStatus

        expiry_threshold = timezone.now() + timedelta(days=days_before_expiry)

        expiring_domains = CustomDomain.objects.filter(
            status=DomainStatus.ACTIVE,
            ssl_expires_at__lte=expiry_threshold,
            ssl_expires_at__gt=timezone.now(),
            is_deleted=False
        )

        results = {
            'total_expiring': expiring_domains.count(),
            'renewed': 0,
            'failed': 0,
            'details': [],
        }

        for domain in expiring_domains:
            success = self.renew_certificate(domain.id)

            if success:
                results['renewed'] += 1
                results['details'].append({
                    'domain': domain.domain,
                    'status': 'renewed',
                })
            else:
                results['failed'] += 1
                results['details'].append({
                    'domain': domain.domain,
                    'status': 'failed',
                })

        self.logger.info(
            f"Renewed {results['renewed']} certificates, {results['failed']} failed")
        return results

    def get_expired_certificates(self):
        """
        Get domains with expired certificates.

        Returns:
            QuerySet: Domains with expired SSL certificates
        """
        from apps.tenant.models import CustomDomain
        from apps.tenant.constants import DomainStatus

        return CustomDomain.objects.filter(
            status=DomainStatus.ACTIVE,
            ssl_expires_at__lt=timezone.now(),
            is_deleted=False
        )

    def validate_certificate(self, domain_id):
        """
        Validate existing SSL certificate.

        Args:
            domain_id: UUID of domain

        Returns:
            dict: Validation results
        """
        status = self.check_certificate_status(domain_id)

        if status.get('error'):
            return {'valid': False, 'error': status['error']}

        return {
            'valid': status.get('is_valid', False),
            'domain': status.get('domain'),
            'expires_at': status.get('expires_at'),
            'days_remaining': status.get('days_remaining'),
            'needs_renewal': status.get('needs_renewal', False),
        }

    def get_https_url(self, domain_name, path=''):
        """
        Get HTTPS URL for a domain.

        Args:
            domain_name: Domain name
            path: URL path

        Returns:
            str: Full HTTPS URL
        """
        path = path.lstrip('/')
        return f"https://{domain_name}/{path}" if path else f"https://{domain_name}"
