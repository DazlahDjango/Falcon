"""
Comprehensive Management Command for Falcon PMS Tenant Custom Domains and SSL Certificates.
Handles:
- Domain Lifecycle: list, info, add, remove, set-primary
- Verification & SSL: verify, ssl-status, ssl-renew

Usage:
    python manage.py manage_domain list --status active
    python manage.py manage_domain info --domain portal.acme.com
    python manage.py manage_domain add --org-id <uuid> --domain portal.acme.com [--primary]
    python manage.py manage_domain verify --domain portal.acme.com [--method manual]
    python manage.py manage_domain verify --all-pending
    python manage.py manage_domain set-primary --domain portal.acme.com
    python manage.py manage_domain remove --domain portal.acme.com [--hard]
    python manage.py manage_domain ssl-status [--expiring-days 30]
    python manage.py manage_domain ssl-renew --all-expiring [--days 30]
"""

import sys
import json
from datetime import timedelta
from typing import Optional, List, Dict

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.db.models import Q

from apps.tenant.models import Organization, OrganizationDomain
from apps.tenant.services import DomainService
from apps.tenant.exceptions import DomainError, OrganizationException


class Command(BaseCommand):
    help = 'Comprehensive management command for Falcon PMS Tenant Custom Domains and SSL Certificates.'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', required=True, help='Action to perform')

        # ---------------- LIST ----------------
        list_parser = subparsers.add_parser('list', help='List custom domains with filters')
        list_parser.add_argument('--org-id', '-i', type=str, help='Filter by Organization UUID')
        list_parser.add_argument('--status', '-s', type=str, help='Filter by status (pending, verifying, active, failed, expired, removed)')
        list_parser.add_argument('--primary-only', action='store_true', help='Show primary domains only')
        list_parser.add_argument('--expiring-ssl-days', type=int, help='Filter domains with SSL expiring within N days')
        list_parser.add_argument('--limit', '-l', type=int, default=50, help='Max rows to show (default: 50)')
        list_parser.add_argument('--json', action='store_true', help='Output results as JSON')

        # ---------------- INFO ----------------
        info_parser = subparsers.add_parser('info', help='Display detailed profile of a domain')
        info_parser.add_argument('--domain', '-d', type=str, help='Fully qualified domain name')
        info_parser.add_argument('--domain-id', type=str, help='Domain UUID')
        info_parser.add_argument('--json', action='store_true', help='Output details as JSON')

        # ---------------- ADD ----------------
        add_parser = subparsers.add_parser('add', help='Add a custom domain to an organization')
        add_parser.add_argument('--org-id', '-i', type=str, required=True, help='Organization UUID')
        add_parser.add_argument('--domain', '-d', type=str, required=True, help='Domain name (e.g. app.customer.com)')
        add_parser.add_argument('--primary', action='store_true', help='Set as primary domain for organization')
        add_parser.add_argument('--verified', action='store_true', help='Mark as immediately verified')

        # ---------------- VERIFY ----------------
        ver_parser = subparsers.add_parser('verify', help='Verify domain ownership')
        ver_parser.add_argument('--domain', '-d', type=str, help='Domain name')
        ver_parser.add_argument('--domain-id', type=str, help='Domain UUID')
        ver_parser.add_argument('--all-pending', action='store_true', help='Verify all pending domains')
        ver_parser.add_argument('--method', '-m', type=str, default='manual', choices=['manual', 'dns_txt', 'http_file'], help='Verification method')

        # ---------------- SET PRIMARY ----------------
        pri_parser = subparsers.add_parser('set-primary', help='Set domain as primary for its organization')
        pri_parser.add_argument('--domain', '-d', type=str, help='Domain name')
        pri_parser.add_argument('--domain-id', type=str, help='Domain UUID')

        # ---------------- REMOVE ----------------
        rem_parser = subparsers.add_parser('remove', help='Remove / delete a domain')
        rem_parser.add_argument('--domain', '-d', type=str, help='Domain name')
        rem_parser.add_argument('--domain-id', type=str, help='Domain UUID')
        rem_parser.add_argument('--hard', action='store_true', help='Perform permanent deletion')
        rem_parser.add_argument('--force', action='store_true', help='Bypass confirmation prompt')

        # ---------------- SSL STATUS ----------------
        ssl_stat_parser = subparsers.add_parser('ssl-status', help='Check SSL certificates validity and upcoming expirations')
        ssl_stat_parser.add_argument('--expiring-days', type=int, default=30, help='Days threshold for upcoming expiration (default: 30)')
        ssl_stat_parser.add_argument('--json', action='store_true', help='Output results as JSON')

        # ---------------- SSL RENEW ----------------
        ssl_ren_parser = subparsers.add_parser('ssl-renew', help='Renew or provision SSL certificates')
        ssl_ren_parser.add_argument('--domain', '-d', type=str, help='Target domain name')
        ssl_ren_parser.add_argument('--all-expiring', action='store_true', help='Renew all domains expiring within --days')
        ssl_ren_parser.add_argument('--all-missing', action='store_true', help='Provision SSL for all active domains missing SSL')
        ssl_ren_parser.add_argument('--days', type=int, default=30, help='Expiry window threshold in days')

    def handle(self, *args, **options):
        action = options['action']
        handler = getattr(self, f"handle_{action.replace('-', '_')}", None)
        if not handler:
            self.stdout.write(self.style.ERROR(f"Action '{action}' is not implemented."))
            return
        try:
            handler(options)
        except CommandError as e:
            self.stdout.write(self.style.ERROR(str(e)))
        except (DomainError, OrganizationException) as e:
            self.stdout.write(self.style.ERROR(f"Domain Error: {str(e)}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error: {str(e)}"))

    def _resolve_domain(self, options) -> OrganizationDomain:
        domain_str = options.get('domain')
        domain_id = options.get('domain_id')

        qs = OrganizationDomain.objects.all_with_deleted().select_related('organization')
        if domain_id:
            try:
                return qs.get(id=domain_id)
            except OrganizationDomain.DoesNotExist:
                raise CommandError(f"Domain with ID '{domain_id}' not found.")
        elif domain_str:
            domain_obj = qs.filter(domain__iexact=domain_str.strip().lower()).first()
            if not domain_obj:
                raise CommandError(f"Domain '{domain_str}' not found.")
            return domain_obj
        else:
            raise CommandError("Please specify --domain or --domain-id.")

    # ---------------- HANDLERS ----------------

    def handle_list(self, options):
        org_id = options.get('org_id')
        status_filter = options.get('status')
        primary_only = options.get('primary_only', False)
        exp_days = options.get('expiring_ssl_days')
        limit = options.get('limit', 50)
        as_json = options.get('json', False)

        qs = OrganizationDomain.objects.filter(is_deleted=False).select_related('organization').order_by('domain')

        if org_id:
            qs = qs.filter(organization_id=org_id)
        if status_filter:
            qs = qs.filter(status=status_filter.lower())
        if primary_only:
            qs = qs.filter(is_primary=True)
        if exp_days:
            expiry_threshold = timezone.now() + timedelta(days=exp_days)
            qs = qs.filter(ssl_expires_at__lte=expiry_threshold, ssl_expires_at__gte=timezone.now())

        total_count = qs.count()
        domains = list(qs[:limit])

        if as_json:
            data = [
                {
                    'id': str(d.id),
                    'domain': d.domain,
                    'organization_id': str(d.organization_id),
                    'organization_name': d.organization.name if d.organization else None,
                    'is_primary': d.is_primary,
                    'is_verified': d.is_verified,
                    'status': d.status,
                    'ssl_enabled': d.ssl_enabled,
                    'ssl_expires_at': d.ssl_expires_at.isoformat() if d.ssl_expires_at else None,
                    'created_at': d.created_at.isoformat() if d.created_at else None,
                }
                for d in domains
            ]
            self.stdout.write(json.dumps({'total': total_count, 'results': data}, indent=2))
            return

        self.stdout.write("\n" + "=" * 110)
        self.stdout.write(self.style.SUCCESS(f" TENANT DOMAINS ({len(domains)} of {total_count} total)"))
        self.stdout.write("=" * 110)
        header = f"{'Domain':<32} {'Organization':<26} {'Status':<12} {'Primary':<9} {'SSL Enabled':<13} {'SSL Expires'}"
        self.stdout.write(header)
        self.stdout.write("-" * 110)

        for d in domains:
            org_name = d.organization.name if d.organization else "Unassigned"
            status_style = self.style.SUCCESS if d.status == 'active' else (self.style.ERROR if d.status == 'failed' else self.style.WARNING)
            primary_str = self.style.SUCCESS("YES") if d.is_primary else "NO"
            ssl_str = "YES" if d.ssl_enabled else "NO"
            ssl_exp = d.ssl_expires_at.strftime('%Y-%m-%d') if d.ssl_expires_at else "N/A"

            self.stdout.write(
                f"{d.domain[:30]:<32} {org_name[:24]:<26} [{status_style(d.status):<10}] "
                f"{primary_str:<9} {ssl_str:<13} {ssl_exp}"
            )

        self.stdout.write("-" * 110 + "\n")

    def handle_info(self, options):
        d = self._resolve_domain(options)
        as_json = options.get('json', False)

        if as_json:
            data = {
                'id': str(d.id),
                'domain': d.domain,
                'organization_id': str(d.organization_id),
                'organization_name': d.organization.name if d.organization else None,
                'is_primary': d.is_primary,
                'is_verified': d.is_verified,
                'status': d.status,
                'verification_token': d.verification_token,
                'verification_method': d.verification_method,
                'verified_at': d.verified_at.isoformat() if d.verified_at else None,
                'ssl_enabled': d.ssl_enabled,
                'ssl_issuer': d.ssl_issuer,
                'ssl_expires_at': d.ssl_expires_at.isoformat() if d.ssl_expires_at else None,
                'created_at': d.created_at.isoformat() if d.created_at else None,
            }
            self.stdout.write(json.dumps(data, indent=2))
            return

        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS(f" DOMAIN DETAILS: {d.domain}"))
        self.stdout.write("=" * 70)
        self.stdout.write(f"  Domain ID:           {d.id}")
        self.stdout.write(f"  Domain Name:         {d.domain}")
        self.stdout.write(f"  Organization:        {d.organization.name if d.organization else 'N/A'} ({d.organization_id})")
        self.stdout.write(f"  Status:              {d.status}")
        self.stdout.write(f"  Is Primary Domain:   {'YES' if d.is_primary else 'NO'}")
        self.stdout.write(f"  Is Verified:         {'YES' if d.is_verified else 'NO'}")
        self.stdout.write(f"  Verification Method: {d.verification_method or 'N/A'}")
        self.stdout.write(f"  Verification Token:  {d.verification_token or 'N/A'}")
        self.stdout.write(f"  Verified At:         {d.verified_at or 'N/A'}")
        self.stdout.write(f"  SSL Enabled:         {'YES' if d.ssl_enabled else 'NO'}")
        self.stdout.write(f"  SSL Issuer:          {d.ssl_issuer or 'N/A'}")
        self.stdout.write(f"  SSL Expires At:      {d.ssl_expires_at or 'N/A'}")
        self.stdout.write(f"  Created At:          {d.created_at}")
        self.stdout.write("=" * 70 + "\n")

    def handle_add(self, options):
        org_id = options['org_id']
        domain_name = options['domain'].strip().lower()
        is_primary = options.get('primary', False)
        is_verified = options.get('verified', False)

        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{org_id}' not found.")

        service = DomainService()
        self.stdout.write(f"Adding domain '{domain_name}' to '{org.name}'...")
        try:
            domain_obj = service.add_domain(
                organization_id=org.id,
                domain_name=domain_name,
                is_primary=is_primary,
                is_verified=is_verified
            )
            self.stdout.write(self.style.SUCCESS(
                f"Domain '{domain_obj.domain}' registered successfully (Status: {domain_obj.status}, Primary: {domain_obj.is_primary})."
            ))
            if not is_verified and domain_obj.verification_token:
                self.stdout.write(f"  DNS TXT Verification Token: falcon-domain-verification={domain_obj.verification_token}")
        except Exception as e:
            raise CommandError(f"Failed to add domain: {str(e)}")

    def handle_verify(self, options):
        all_pending = options.get('all_pending', False)
        service = DomainService()

        if all_pending:
            pending_domains = OrganizationDomain.objects.filter(status='PENDING', is_deleted=False)
            self.stdout.write(f"Verifying {pending_domains.count()} pending domain(s)...")
            success_count = 0
            for d in pending_domains:
                try:
                    res = service.verify_domain(d.id)
                    self.stdout.write(self.style.SUCCESS(f"  [OK] Verified '{res.domain}'"))
                    success_count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  [FAILED] '{d.domain}': {str(e)}"))
            self.stdout.write(self.style.SUCCESS(f"Verification complete: {success_count}/{pending_domains.count()} verified."))
        else:
            d = self._resolve_domain(options)
            self.stdout.write(f"Verifying domain '{d.domain}'...")
            try:
                res = service.verify_domain(d.id)
                self.stdout.write(self.style.SUCCESS(f"Domain '{res.domain}' verified successfully!"))
            except Exception as e:
                raise CommandError(f"Domain verification failed: {str(e)}")

    def handle_set_primary(self, options):
        d = self._resolve_domain(options)
        if d.status != 'ACTIVE':
            self.stdout.write(self.style.ERROR(
                f"Cannot set domain '{d.domain}' as primary because its status is '{d.status}'. "
                f"Please verify the domain first: python manage.py manage_domain verify --domain {d.domain}"
            ))
            return
        service = DomainService()
        res = service.set_primary_domain(d.id)
        self.stdout.write(self.style.SUCCESS(f"Domain '{res.domain}' set as primary for organization '{res.organization.name}'."))

    def handle_remove(self, options):
        d = self._resolve_domain(options)
        hard = options.get('hard', False)
        force = options.get('force', False)

        if not force:
            mode = "HARD" if hard else "SOFT"
            confirm = input(f"Are you sure you want to perform {mode} deletion on domain '{d.domain}'? [y/N]: ")
            if confirm.lower() != 'y':
                self.stdout.write("Operation cancelled.")
                return

        service = DomainService()
        service.remove_domain(d.id, hard=hard)
        self.stdout.write(self.style.SUCCESS(f"Removed domain '{d.domain}'."))

    def handle_ssl_status(self, options):
        days_thresh = options.get('expiring_days', 30)
        as_json = options.get('json', False)

        cutoff = timezone.now() + timedelta(days=days_thresh)
        domains = OrganizationDomain.objects.filter(is_deleted=False).select_related('organization')

        expiring = [d for d in domains if d.ssl_expires_at and d.ssl_expires_at <= cutoff]
        active_ssl = [d for d in domains if d.ssl_enabled]
        missing_ssl = [d for d in domains if not d.ssl_enabled]

        if as_json:
            data = {
                'total_domains': domains.count(),
                'ssl_enabled': len(active_ssl),
                'ssl_missing': len(missing_ssl),
                'expiring_within_days': len(expiring),
                'expiring_domains': [{'domain': d.domain, 'expires_at': d.ssl_expires_at.isoformat()} for d in expiring],
            }
            self.stdout.write(json.dumps(data, indent=2))
            return

        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS(f" DOMAIN SSL CERTIFICATES AUDIT"))
        self.stdout.write("=" * 70)
        self.stdout.write(f"  Total Domains Tracked:      {domains.count()}")
        self.stdout.write(f"  SSL Certificates Active:    {len(active_ssl)}")
        self.stdout.write(f"  Missing SSL:                {len(missing_ssl)}")
        self.stdout.write(f"  Expiring Within {days_thresh} Days:     {len(expiring)}")

        if missing_ssl:
            self.stdout.write("\n  Missing SSL Certificates:")
            for d in missing_ssl:
                self.stdout.write(f"    - {d.domain} (Status: {d.status}, Verified: {d.is_verified})")

        if expiring:
            self.stdout.write("\n  Expiring Certificates:")
            for d in expiring:
                self.stdout.write(f"    - {d.domain} (Expires: {d.ssl_expires_at.strftime('%Y-%m-%d')})")
        self.stdout.write("=" * 70 + "\n")

    def handle_ssl_renew(self, options):
        all_expiring = options.get('all_expiring', False)
        all_missing = options.get('all_missing', False)
        domain_str = options.get('domain')
        domain_id = options.get('domain_id')
        days = options.get('days', 30)
        service = DomainService()

        if all_expiring:
            renewed = service.renew_expiring_ssl_certificates(days=days)
            self.stdout.write(self.style.SUCCESS(f"Successfully renewed/verified SSL for {len(renewed)} expiring domain(s)."))
        elif all_missing:
            active_domains = list(OrganizationDomain.objects.filter(is_deleted=False, status='ACTIVE'))
            missing_domains = [d for d in active_domains if not d.ssl_enabled]
            if not missing_domains:
                self.stdout.write(self.style.SUCCESS("No active domains missing SSL found. (Note: Unverified/pending domains receive SSL upon verification)."))
                return
            count = 0
            for d in missing_domains:
                try:
                    res = service.provision_ssl_certificate(d.id)
                    self.stdout.write(self.style.SUCCESS(f"  [OK] Provisioned SSL for '{res.domain}' (Expires: {res.ssl_expires_at})"))
                    count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"  [FAILED] '{d.domain}': {str(e)}"))
            self.stdout.write(self.style.SUCCESS(f"Provisioned SSL for {count}/{len(missing_domains)} domain(s)."))
        elif domain_str or domain_id:
            d = self._resolve_domain(options)
            if d.status != 'ACTIVE':
                self.stdout.write(self.style.ERROR(
                    f"Domain '{d.domain}' has status '{d.status}'. "
                    f"Please verify the domain first: python manage.py manage_domain verify --domain {d.domain}"
                ))
                return
            res = service.provision_ssl_certificate(d.id)
            self.stdout.write(self.style.SUCCESS(f"SSL certificate provisioned/renewed for '{res.domain}' (Expires: {res.ssl_expires_at})."))
        else:
            raise CommandError("Please specify --domain <name>, --all-expiring, or --all-missing")
