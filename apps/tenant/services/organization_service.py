import re
import logging
from urllib.parse import urlparse
from django.db import transaction
from django.utils import timezone
from django.core.validators import validate_email

from apps.tenant.models import Organization, OrganizationSector
from apps.tenant.constants import OrganizationStatus, SubscriptionTier
from apps.tenant.exceptions import (
    OrganizationError,
    OrganizationNotFoundError,
    OrganizationAlreadyExistsError,
    OrganizationInvalidError,
)

logger = logging.getLogger(__name__)


class OrganizationService:
    """
    Enterprise organization management service.

    Owns organization CRUD, lifecycle transitions, and coordinates
    provisioning through ProvisioningService (never inline).
    """

    PROVISIONABLE_STATUSES = {
        OrganizationStatus.PENDING,
        OrganizationStatus.FAILED,
    }

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    # ------------------------------------------------------------------ #
    # Create / update / read                                                #
    # ------------------------------------------------------------------ #

    def create_organization(self, data, user=None, auto_provision=True):
        """
        Create a new organization in PENDING state.

        Provisioning is dispatched automatically via post_save signal
        unless auto_provision=False (bulk import / admin use).
        """
        self._validate_create_payload(data)

        with transaction.atomic():
            slug = data.get('slug') or self._generate_unique_slug(data['name'])
            if Organization.objects.by_slug(slug):
                raise OrganizationAlreadyExistsError(
                    f"Organization with slug '{slug}' already exists"
                )

            sector = self._resolve_sector(data.get('sector_id'))

            org = Organization(
                name=data['name'].strip(),
                slug=slug,
                sector=sector,
                contact_email=data['contact_email'],
                contact_phone=data.get('contact_phone', ''),
                contact_address=data.get('contact_address', ''),
                website=data.get('website', ''),
                primary_color=data.get('primary_color', '#2563EB'),
                secondary_color=data.get('secondary_color', '#7C3AED'),
                subscription_tier=data.get('subscription_tier', SubscriptionTier.FREE),
                status=OrganizationStatus.PENDING,
                metadata=self._build_initial_metadata(data),
            )
            
            if not auto_provision:
                org.metadata.setdefault('provisioning', {})['auto_dispatch'] = False

            if data.get('logo'):
                org.logo = data['logo']
            if data.get('favicon'):
                org.favicon = data['favicon']
            org.save(user=user)

            # Auto-register primary domain if website URL is provided
            website_url = data.get('website', '').strip()
            if website_url:
                domain_name = self._extract_domain_from_url(website_url)
                if domain_name:
                    try:
                        from apps.tenant.services.domain_service import DomainService
                        DomainService().add_domain(organization_id=org.id, domain_name=domain_name, is_primary=True)
                        self.logger.info("Automatically registered primary domain '%s' for org %s", domain_name, org.id)
                    except Exception as exc:
                        self.logger.warning("Could not auto-register domain for website '%s': %s", website_url, exc)

            org.record_audit('created', user_id=getattr(user, 'id', None), details={
                'subscription_tier': org.subscription_tier,
                'auto_provision': auto_provision,
            })

            self.logger.info("Created organization %s — %s", org.id, org.name)

            return org

    def update_organization(self, organization_id, data, user=None):
        with transaction.atomic():
            org = self._get_org_or_raise(organization_id)

            if org.is_provisioning:
                raise OrganizationInvalidError(
                    'Cannot update organization while provisioning is in progress.'
                )

            for field in (
                'name', 'contact_email', 'contact_phone', 'contact_address',
                'website', 'primary_color', 'secondary_color', 'subscription_tier',
            ):
                if field in data:
                    setattr(org, field, data[field])

            if 'sector_id' in data:
                org.sector = self._resolve_sector(data['sector_id'])

            if 'logo' in data:
                org.logo = data['logo']
            if 'favicon' in data:
                org.favicon = data['favicon']
            if 'metadata' in data:
                org.metadata.update(data['metadata'])

            org.save(user=user)
            org.record_audit('updated', user_id=getattr(user, 'id', None))
            self.logger.info("Updated organization %s — %s", org.id, org.name)
            return org

    def get_organization(self, organization_id):
        org = Organization.objects.get_by_id(organization_id)
        if not org:
            raise OrganizationNotFoundError(f"Organization {organization_id} not found")
        return org

    def get_organization_by_slug(self, slug):
        org = Organization.objects.by_slug(slug)
        if not org:
            raise OrganizationNotFoundError(f"Organization with slug '{slug}' not found")
        return org

    def get_organization_by_domain(self, domain):
        org = Organization.objects.by_domain(domain)
        if not org:
            raise OrganizationNotFoundError(f"Organization with domain '{domain}' not found")
        return org

    def list_organizations(self, filters=None):
        return Organization.objects.for_list(filters)

    # ------------------------------------------------------------------ #
    # Lifecycle                                                             #
    # ------------------------------------------------------------------ #

    def suspend_organization(self, organization_id, user=None):
        org = self._get_org_or_raise(organization_id)
        if org.status == OrganizationStatus.SUSPENDED:
            raise OrganizationInvalidError('Organization is already suspended')

        org.suspend()
        self._pause_connections(org.id)
        org.record_audit('suspended', user_id=getattr(user, 'id', None))
        self.logger.warning("Suspended organization %s", org.id)
        return org

    def activate_organization(self, organization_id, user=None):
        org = self._get_org_or_raise(organization_id)
        if not org.is_onboarded:
            raise OrganizationInvalidError(
                'Organization must be fully provisioned before activation.'
            )
        if org.status == OrganizationStatus.ACTIVE and org.is_active:
            raise OrganizationInvalidError('Organization is already active')

        org.activate()
        self._resume_connections(org.id)
        org.record_audit('activated', user_id=getattr(user, 'id', None))
        self.logger.info("Activated organization %s", org.id)
        return org

    def archive_organization(self, organization_id, user=None):
        org = self._get_org_or_raise(organization_id)
        org.archive()
        self._pause_connections(org.id)
        org.record_audit('archived', user_id=getattr(user, 'id', None))
        self.logger.info("Archived organization %s", org.id)
        return org

    def delete_organization(self, organization_id, hard=False, user=None):
        org = self._get_org_or_raise(organization_id)

        if org.is_provisioning:
            raise OrganizationInvalidError(
                'Cannot delete organization while provisioning is in progress.'
            )

        if hard:
            from apps.tenant.services.provisioning_service import ProvisioningService
            ProvisioningService().deprovision_organization(org.id, reason='hard_delete')
            org.hard_delete()
            self.logger.warning("Hard deleted organization %s", organization_id)
        else:
            org.soft_delete(user=user)
            org.record_audit('soft_deleted', user_id=getattr(user, 'id', None))
            self.logger.info("Soft deleted organization %s", organization_id)

        return True

    # ------------------------------------------------------------------ #
    # Provisioning coordination                                             #
    # ------------------------------------------------------------------ #

    def trigger_provisioning(self, organization_id, force=False, user=None):
        """
        Dispatch async provisioning for an organization.
        Used by API endpoints and management commands.
        """
        org = self._get_org_or_raise(organization_id)

        if org.is_provisioning:
            raise OrganizationInvalidError('Organization is already being provisioned.')

        if org.is_provisioned and not force:
            raise OrganizationInvalidError(
                'Organization is already provisioned. Pass force=True to re-run.'
            )

        if org.status not in self.PROVISIONABLE_STATUSES and not force:
            raise OrganizationInvalidError(
                f"Cannot provision from status '{org.status}'. "
                f"Allowed: {', '.join(self.PROVISIONABLE_STATUSES)}."
            )

        if org.status == OrganizationStatus.FAILED:
            org.reset_for_provisioning_retry()

        org.record_audit('provisioning_triggered', user_id=getattr(user, 'id', None), details={
            'force': force,
        })

        from apps.tenant.tasks import provision_organization
        provision_organization.delay(str(org.id))
        self.logger.info("Provisioning dispatched for organization %s", org.id)
        return org

    def retry_provisioning(self, organization_id, user=None):
        org = self._get_org_or_raise(organization_id)
        if org.status != OrganizationStatus.FAILED:
            raise OrganizationInvalidError(
                f"Retry is only available for FAILED organizations (current: {org.status})."
            )
        org.reset_for_provisioning_retry()
        return self.trigger_provisioning(org.id, force=True, user=user)

    def get_provisioning_status(self, organization_id):
        org = self._get_org_or_raise(organization_id)
        meta = org.provisioning_state
        return {
            'organization_id': str(org.id),
            'organization_name': org.name,
            'status': org.status,
            'is_active': org.is_active,
            'is_onboarded': org.is_onboarded,
            'onboarded_at': org.onboarded_at,
            'created_at': org.created_at,
            'updated_at': org.updated_at,
            'schema_name': org.schema_name,
            'provisioning': {
                'status': meta.get('status'),
                'step_name': meta.get('step_name'),
                'progress': meta.get('progress', 0),
                'message': meta.get('message'),
                'started_at': meta.get('started_at'),
                'updated_at': meta.get('updated_at'),
                'failed_at': meta.get('failed_at'),
                'error': meta.get('error'),
            },
        }

    def rollback_provisioning(self, organization_id, user=None, reason='manual_rollback'):
        """Force deprovision and mark organization FAILED."""
        from apps.tenant.services.provisioning_service import ProvisioningService

        org = self._get_org_or_raise(organization_id)
        if org.is_provisioned:
            raise OrganizationInvalidError(
                'Cannot rollback a fully active organization. Suspend or archive instead.'
            )

        ProvisioningService().deprovision_organization(org.id, reason=reason)
        org.refresh_from_db()
        org.mark_failed(error_message=reason)
        meta = org.metadata or {}
        meta.setdefault('provisioning', {}).update({
            'status': 'ROLLED_BACK',
            'message': reason,
            'rolled_back_at': timezone.now().isoformat(),
        })
        org.metadata = meta
        org.save(update_fields=['metadata', 'updated_at'])
        org.record_audit('provisioning_rolled_back', user_id=getattr(user, 'id', None), details={
            'reason': reason,
        })
        self.logger.warning("Provisioning rolled back for organization %s", org.id)
        return org

    # ------------------------------------------------------------------ #
    # Internal helpers                                                      #
    # ------------------------------------------------------------------ #

    def _get_org_or_raise(self, organization_id):
        try:
            return Organization.objects.get(id=organization_id, is_deleted=False)
        except Organization.DoesNotExist:
            raise OrganizationNotFoundError(f"Organization {organization_id} not found")

    def _validate_create_payload(self, data):
        name = (data.get('name') or '').strip()
        if not name:
            raise OrganizationInvalidError('Organization name is required')
        if len(name) > 200:
            raise OrganizationInvalidError('Organization name cannot exceed 200 characters')

        email = data.get('contact_email')
        if not email:
            raise OrganizationInvalidError('Contact email is required')
        validate_email(email)

        tier = data.get('subscription_tier', SubscriptionTier.FREE)
        valid_tiers = {choice.value for choice in SubscriptionTier}
        if tier not in valid_tiers:
            raise OrganizationInvalidError(f"Invalid subscription tier: {tier}")

        if Organization.objects.filter(name__iexact=name).exists():
            raise OrganizationAlreadyExistsError(
                f"Organization with name '{name}' already exists"
            )

    def _resolve_sector(self, sector_id):
        if not sector_id:
            return None
        try:
            return OrganizationSector.objects.get(id=sector_id, is_active=True)
        except OrganizationSector.DoesNotExist:
            raise OrganizationError(f"Sector {sector_id} not found or inactive")

    def _generate_unique_slug(self, name):
        base = re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')[:90] or 'org'
        slug = base
        counter = 1
        while Organization.objects.filter(slug=slug).exists():
            suffix = f"-{counter}"
            slug = f"{base[:100 - len(suffix)]}{suffix}"
            counter += 1
        return slug

    def _build_initial_metadata(self, data):
        metadata = dict(data.get('metadata') or {})
        metadata.setdefault('created_via', data.get('created_via', 'api'))
        return metadata

    def _pause_connections(self, organization_id):
        try:
            from apps.tenant.services import ConnectionService
            ConnectionService.pause_connection(organization_id)
        except Exception as exc:
            self.logger.warning("Could not pause connections for %s: %s", organization_id, exc)

    def _resume_connections(self, organization_id):
        try:
            from apps.tenant.services import ConnectionService
            ConnectionService.resume_connection(organization_id)
        except Exception as exc:
            self.logger.warning("Could not resume connections for %s: %s", organization_id, exc)

    def _extract_domain_from_url(self, url_string):
        if not url_string:
            return None
        url = url_string.strip()
        if not url.startswith(('http://', 'https://')):
            url = 'http://' + url
        try:
            parsed = urlparse(url)
            hostname = parsed.hostname or parsed.netloc or parsed.path
            if hostname:
                hostname = hostname.split(':')[0].lower().strip('/')
                if '.' in hostname and not hostname.startswith(('localhost', '127.0.0.1')):
                    return hostname
        except Exception as exc:
            self.logger.debug("Failed to parse website URL '%s': %s", url_string, exc)
        return None
