import uuid
import logging
import socket
import dns.resolver
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.core.exceptions import ValidationError
from apps.tenant.models import OrganizationDomain
from apps.tenant.exceptions import DomainError

logger = logging.getLogger(__name__)


class DomainService:
    def __init__(self):
        self.logger = logging.getLogger(__name__)

    def add_domain(self, organization_id, domain_name, is_primary=False):
        with transaction.atomic():
            if OrganizationDomain.objects.filter(domain=domain_name).exists():
                raise DomainError(f"Domain '{domain_name}' is already registered")
            domain = OrganizationDomain.objects.create(
                organization_id=organization_id,
                domain=domain_name,
                is_primary=is_primary,
                status='PENDING',
                verification_token=uuid.uuid4()
            )
            self.logger.info(f"Added domain: {domain_name} for organization {organization_id}")
            return domain

    def verify_domain(self, domain_id):
        domain = OrganizationDomain.objects.get(id=domain_id)
        if domain.status in ['ACTIVE', 'VERIFYING']:
            raise DomainError(f"Domain {domain.domain} is already being verified or active")
        domain.status = 'VERIFYING'
        domain.save(update_fields=['status'])
        try:
            txt_value = self._get_dns_txt_record(domain.domain)
            expected = f"falcon-domain-verification={domain.verification_token.hex}"
            if txt_value == expected:
                domain.mark_verified()
                self._issue_ssl_certificate(domain)
                if domain.is_primary:
                    self._set_primary_domain(domain)
                self.logger.info(f"Domain verified: {domain.domain}")
                return domain
            else:
                domain.mark_failed(f"TXT record mismatch. Expected: {expected}, Got: {txt_value}")
                self.logger.warning(f"Domain verification failed: {domain.domain}")
                return domain
        except Exception as e:
            domain.mark_failed(str(e))
            self.logger.error(f"Domain verification error: {domain.domain} - {str(e)}")
            return domain

    def _get_dns_txt_record(self, domain):
        try:
            answers = dns.resolver.resolve(domain, 'TXT')
            for answer in answers:
                for txt_string in answer.strings:
                    value = txt_string.decode('utf-8')
                    if value.startswith('falcon-domain-verification='):
                        return value
            return ''
        except dns.resolver.NXDOMAIN:
            raise DomainError(f"Domain '{domain}' does not exist")
        except dns.resolver.NoAnswer:
            raise DomainError(f"No TXT record found for '{domain}'")
        except Exception as e:
            raise DomainError(f"DNS lookup failed: {str(e)}")

    def _issue_ssl_certificate(self, domain):
        from cryptography import x509
        from cryptography.x509.oid import NameOID
        from cryptography.hazmat.primitives import hashes
        from cryptography.hazmat.primitives.asymmetric import rsa
        import datetime
        private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        subject = issuer = x509.Name([
            x509.NameAttribute(NameOID.COMMON_NAME, domain.domain),
        ])
        cert = x509.CertificateBuilder().subject_name(subject).issuer_name(issuer).public_key(private_key.public_key()).serial_number(x509.random_serial_number()).not_valid_before(datetime.datetime.now(datetime.timezone.utc)).not_valid_after(datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=90)).add_extension(x509.SubjectAlternativeName([x509.DNSName(domain.domain)]), critical=False).sign(private_key, hashes.SHA256())
        domain.update_ssl(
            issued_at=timezone.now(),
            expires_at=timezone.now() + timedelta(days=90),
            issuer='Falcon Self-Signed'
        )
        self.logger.info(f"SSL certificate issued for {domain.domain}")

    def _set_primary_domain(self, domain):
        OrganizationDomain.objects.filter(organization=domain.organization, is_primary=True).exclude(id=domain.id).update(is_primary=False)
        domain.is_primary = True
        domain.save(update_fields=['is_primary'])

    def set_primary_domain(self, domain_id):
        domain = OrganizationDomain.objects.get(id=domain_id)
        if domain.status != 'ACTIVE':
            raise DomainError(f"Domain {domain.domain} must be active to set as primary")
        domain.set_primary()
        self.logger.info(f"Set primary domain: {domain.domain}")
        return domain

    def delete_domain(self, domain_id):
        domain = OrganizationDomain.objects.get(id=domain_id)
        domain.soft_delete()
        self.logger.info(f"Deleted domain: {domain.domain}")
        return True

    def get_domain(self, domain_id):
        try:
            return OrganizationDomain.objects.get(id=domain_id)
        except OrganizationDomain.DoesNotExist:
            raise DomainError(f"Domain {domain_id} not found")

    def get_domain_by_name(self, domain_name):
        domain = OrganizationDomain.objects.by_domain(domain_name)
        if not domain:
            raise DomainError(f"Domain '{domain_name}' not found")
        return domain

    def list_domains(self, organization_id):
        return OrganizationDomain.objects.by_organization(organization_id)

    def renew_ssl(self, domain_id):
        domain = OrganizationDomain.objects.get(id=domain_id)
        if domain.status != 'ACTIVE':
            raise DomainError(f"Domain {domain.domain} is not active")
        self._issue_ssl_certificate(domain)
        self.logger.info(f"Renewed SSL for {domain.domain}")
        return domain

    def check_expiring_ssl(self, days=30):
        return OrganizationDomain.objects.expiring_ssl(days)

    def verify_all_pending(self):
        pending = OrganizationDomain.objects.pending_verification()
        results = []
        for domain in pending:
            try:
                result = self.verify_domain(domain.id)
                results.append({'domain': domain.domain, 'success': result.status == 'ACTIVE'})
            except Exception as e:
                results.append({'domain': domain.domain, 'success': False, 'error': str(e)})
        return results