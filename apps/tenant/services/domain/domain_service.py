"""
Domain Service - Manages custom domains for tenants.

Handles:
- Domain registration and verification
- Primary domain management
- Domain routing configuration
- Domain lifecycle (add, verify, remove)
"""

import logging
import re
from django.utils import timezone
from apps.tenant.exceptions import DomainValidationError, DomainNotFoundError
from apps.tenant.constants import DomainStatus

logger = logging.getLogger(__name__)


class DomainService:
    """
    Service for managing tenant custom domains.

    What it does:
        - Adds custom domains to tenants
        - Verifies domain ownership via DNS
        - Sets primary domains
        - Removes domains
        - Manages domain routing

    Usage:
        service = DomainService()
        domain = service.add_domain(tenant_id, 'pms.acme.com')
        service.verify_domain(domain.id)
        service.set_as_primary(domain.id)
        service.remove_domain(domain.id)
    """

    def __init__(self):
        """Initialize domain service."""
        self.logger = logging.getLogger(__name__)

    def add_domain(self, tenant_id, domain_name, is_primary=False):
        """
        Add a custom domain to a tenant.

        Args:
            tenant_id: UUID of tenant
            domain_name: Domain name (e.g., 'pms.acme.com')
            is_primary: Whether this should be the primary domain

        Returns:
            CustomDomain object

        Raises:
            DomainValidationError: If domain is invalid or already exists
        """
        self.logger.info(f"Adding domain {domain_name} to tenant {tenant_id}")

        from apps.tenant.models import CustomDomain, Tenant

        # Validate domain format
        self._validate_domain_format(domain_name)

        # Check if domain already exists
        if CustomDomain.objects.filter(domain=domain_name, is_deleted=False).exists():
            raise DomainValidationError(f"Domain {domain_name} already exists")

        # Get tenant
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            raise DomainValidationError(f"Tenant {tenant_id} not found")

        # Create domain
        domain = CustomDomain.objects.create(
            tenant=tenant,
            domain=domain_name,
            is_primary=is_primary,
            status=DomainStatus.PENDING,
        )

        # If this is primary, unset other primary domains
        if is_primary:
            self._unset_other_primary_domains(tenant_id, domain.id)

        self.logger.info(f"Domain {domain_name} added with ID {domain.id}")
        return domain

    def _validate_domain_format(self, domain_name):
        """Validate domain name format."""
        domain_pattern = r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'

        if not re.match(domain_pattern, domain_name):
            raise DomainValidationError(
                f"Invalid domain format: {domain_name}")

        if len(domain_name) > 255:
            raise DomainValidationError(f"Domain too long: {domain_name}")

    def _unset_other_primary_domains(self, tenant_id, exclude_domain_id):
        """Unset primary flag from other domains of this tenant."""
        from apps.tenant.models import CustomDomain

        CustomDomain.objects.filter(
            tenant_id=tenant_id,
            is_primary=True
        ).exclude(id=exclude_domain_id).update(is_primary=False)

    def verify_domain(self, domain_id):
        """
        Verify domain ownership.

        Args:
            domain_id: UUID of domain to verify

        Returns:
            bool: True if verified, False otherwise
        """
        self.logger.info(f"Verifying domain {domain_id}")

        from apps.tenant.models import CustomDomain
        from .dns_validator import DNSValidator

        try:
            domain = CustomDomain.objects.get(id=domain_id, is_deleted=False)
        except CustomDomain.DoesNotExist:
            raise DomainNotFoundError(f"Domain {domain_id} not found")

        # Update status to verifying
        domain.status = DomainStatus.VERIFYING
        domain.save(update_fields=['status'])

        # Perform DNS validation
        validator = DNSValidator()
        is_valid = validator.verify_domain(
            domain.domain, domain.verification_token)

        if is_valid:
            domain.status = DomainStatus.ACTIVE
            domain.verified_at = timezone.now()
            domain.save(update_fields=['status', 'verified_at'])
            self.logger.info(f"Domain {domain.domain} verified successfully")
            return True
        else:
            domain.status = DomainStatus.FAILED
            domain.verification_error = "DNS verification failed"
            domain.save(update_fields=['status', 'verification_error'])
            self.logger.warning(f"Domain {domain.domain} verification failed")
            return False

    def set_as_primary(self, domain_id):
        """
        Set a domain as the primary domain for its tenant.

        Args:
            domain_id: UUID of domain to set as primary
        """
        self.logger.info(f"Setting domain {domain_id} as primary")

        from apps.tenant.models import CustomDomain

        try:
            domain = CustomDomain.objects.get(id=domain_id, is_deleted=False)
        except CustomDomain.DoesNotExist:
            raise DomainNotFoundError(f"Domain {domain_id} not found")

        # Unset other primary domains
        self._unset_other_primary_domains(domain.tenant_id, domain_id)

        # Set this as primary
        domain.is_primary = True
        domain.save(update_fields=['is_primary'])

        self.logger.info(f"Domain {domain.domain} is now primary")

    def remove_domain(self, domain_id):
        """
        Remove a custom domain.

        Args:
            domain_id: UUID of domain to remove
        """
        self.logger.info(f"Removing domain {domain_id}")

        from apps.tenant.models import CustomDomain

        try:
            domain = CustomDomain.objects.get(id=domain_id, is_deleted=False)
        except CustomDomain.DoesNotExist:
            raise DomainNotFoundError(f"Domain {domain_id} not found")

        domain.status = DomainStatus.REMOVED
        domain.soft_delete()

        self.logger.info(f"Domain {domain.domain} removed")

    def get_domain_by_name(self, domain_name):
        """
        Get domain by name.

        Args:
            domain_name: Domain name to look up

        Returns:
            CustomDomain object or None
        """
        from apps.tenant.models import CustomDomain

        try:
            return CustomDomain.objects.get(domain=domain_name, is_deleted=False)
        except CustomDomain.DoesNotExist:
            return None

    def get_tenant_domains(self, tenant_id):
        """
        Get all domains for a tenant.

        Args:
            tenant_id: UUID of tenant

        Returns:
            QuerySet of CustomDomain objects
        """
        from apps.tenant.models import CustomDomain

        return CustomDomain.objects.filter(tenant_id=tenant_id, is_deleted=False)

    def get_primary_domain(self, tenant_id):
        """
        Get primary domain for a tenant.

        Args:
            tenant_id: UUID of tenant

        Returns:
            CustomDomain object or None
        """
        from apps.tenant.models import CustomDomain

        try:
            return CustomDomain.objects.get(
                tenant_id=tenant_id,
                is_primary=True,
                is_deleted=False
            )
        except CustomDomain.DoesNotExist:
            return None

    def get_active_domains(self, tenant_id):
        """
        Get active (verified) domains for a tenant.

        Args:
            tenant_id: UUID of tenant

        Returns:
            QuerySet of active CustomDomain objects
        """
        from apps.tenant.models import CustomDomain

        return CustomDomain.objects.filter(
            tenant_id=tenant_id,
            status=DomainStatus.ACTIVE,
            is_deleted=False
        )

    def get_domain_status(self, domain_id):
        """
        Get detailed status of a domain.

        Args:
            domain_id: UUID of domain

        Returns:
            dict: Domain status information
        """
        from apps.tenant.models import CustomDomain

        try:
            domain = CustomDomain.objects.get(id=domain_id, is_deleted=False)

            return {
                'id': str(domain.id),
                'domain': domain.domain,
                'status': domain.status,
                'is_primary': domain.is_primary,
                'verified_at': domain.verified_at.isoformat() if domain.verified_at else None,
                'verification_error': domain.verification_error,
                'verification_token': str(domain.verification_token),
                'ssl_issued_at': domain.ssl_issued_at.isoformat() if domain.ssl_issued_at else None,
                'ssl_expires_at': domain.ssl_expires_at.isoformat() if domain.ssl_expires_at else None,
                'ssl_issuer': domain.ssl_issuer,
                'force_https': domain.force_https,
                'created_at': domain.created_at.isoformat(),
            }
        except CustomDomain.DoesNotExist:
            return None

    def resend_verification(self, domain_id):
        """
        Resend/restart domain verification.

        Args:
            domain_id: UUID of domain

        Returns:
            dict: New verification token
        """
        self.logger.info(f"Resending verification for domain {domain_id}")

        from apps.tenant.models import CustomDomain
        import uuid

        try:
            domain = CustomDomain.objects.get(id=domain_id, is_deleted=False)
        except CustomDomain.DoesNotExist:
            raise DomainNotFoundError(f"Domain {domain_id} not found")

        # Generate new verification token
        domain.verification_token = uuid.uuid4()
        domain.status = DomainStatus.PENDING
        domain.verification_error = ''
        domain.save(update_fields=[
                    'verification_token', 'status', 'verification_error'])

        return {
            'domain': domain.domain,
            'verification_token': str(domain.verification_token),
            'dns_record': f"falcon-domain-verification={domain.verification_token.hex}",
        }

    def update_ssl_info(self, domain_id, issued_at, expires_at, issuer):
        """
        Update SSL certificate information for a domain.

        Args:
            domain_id: UUID of domain
            issued_at: When certificate was issued
            expires_at: When certificate expires
            issuer: Certificate issuer name
        """
        from apps.tenant.models import CustomDomain

        try:
            domain = CustomDomain.objects.get(id=domain_id, is_deleted=False)
            domain.ssl_issued_at = issued_at
            domain.ssl_expires_at = expires_at
            domain.ssl_issuer = issuer
            domain.save(update_fields=['ssl_issued_at',
                        'ssl_expires_at', 'ssl_issuer'])
            self.logger.info(f"Updated SSL info for domain {domain.domain}")
        except CustomDomain.DoesNotExist:
            self.logger.warning(f"Domain {domain_id} not found for SSL update")

    def get_tenant_by_domain(self, domain_name):
        """
        Get tenant that owns a domain.

        Args:
            domain_name: Domain name to look up

        Returns:
            Tenant object or None
        """
        domain = self.get_domain_by_name(domain_name)
        if domain and domain.status == DomainStatus.ACTIVE:
            return domain.tenant
        return None
