import uuid
from datetime import timedelta
from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.db import transaction, connection

from apps.billing.models import (
    SubscriptionPlan, Subscription, Invoice, Transaction as BillingTransaction,
    TenantSubscriptionOverride
)
from apps.tenant.models import Organization
from apps.accounts.models import User
from apps.billing.tasks import send_payment_confirmation, send_admin_alert


class Command(BaseCommand):
    help = 'Management command to bill a tenant, manage subscriptions, seed default plans, or process renewals.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--seed-plans',
            action='store_true',
            help='Seed standard subscription plans (Trial, Basic, Professional, Enterprise)'
        )
        parser.add_argument(
            '--tenant-id',
            type=str,
            help='UUID of the tenant (Organization) to bill'
        )
        parser.add_argument(
            '--email',
            type=str,
            help='Email of tenant admin user to look up tenant ID'
        )
        parser.add_argument(
            '--plan',
            type=str,
            choices=['trial', 'basic', 'professional', 'enterprise'],
            default='enterprise',
            help='Plan type to assign to tenant'
        )
        parser.add_argument(
            '--interval',
            type=str,
            choices=['monthly', 'yearly'],
            default='yearly',
            help='Billing interval (monthly or yearly)'
        )
        parser.add_argument(
            '--pay',
            action='store_true',
            help='Automatically mark generated invoice as PAID and create transaction receipt'
        )
        parser.add_argument(
            '--list',
            action='store_true',
            help='List all tenant subscriptions and statuses'
        )
        parser.add_argument(
            '--process-renewals',
            action='store_true',
            help='Process upcoming subscription renewals'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Simulate billing action without writing changes to the database'
        )

    def handle(self, *args, **options):
        # Set public search path for global queries
        with connection.cursor() as cursor:
            cursor.execute('SET search_path TO "public"')

        if options['seed_plans']:
            self._handle_seed_plans(options['dry_run'])
            return

        if options['list']:
            self._handle_list_subscriptions()
            return

        if options['process_renewals']:
            self._handle_process_renewals(options['dry_run'])
            return

        tenant_id = options.get('tenant_id')
        email = options.get('email')

        if not tenant_id and not email:
            self.stdout.write(self.style.WARNING(
                "No target tenant specified. Use --tenant-id, --email, --seed-plans, or --list.\n"
                "Example: python manage.py bill_tenant --email admin@falcontech.com --plan enterprise --pay"
            ))
            return

        tenant = self._resolve_tenant(tenant_id, email)
        if not tenant:
            raise CommandError(f"Could not find Organization matching tenant_id='{tenant_id}' or email='{email}'")

        self._bill_tenant(
            tenant=tenant,
            plan_type=options['plan'],
            interval=options['interval'],
            mark_paid=options['pay'],
            dry_run=options['dry_run']
        )

    def _resolve_tenant(self, tenant_id=None, email=None):
        if tenant_id:
            try:
                return Organization.objects.filter(id=tenant_id).first()
            except Exception:
                pass

        if email:
            user = User.objects.filter(email=email).first()
            if user and user.tenant_id:
                return Organization.objects.filter(id=user.tenant_id).first()

        return None

    def _handle_seed_plans(self, dry_run=False):
        self.stdout.write(self.style.MIGRATE_HEADING("=== Seeding Default Subscription Plans ==="))
        if dry_run:
            self.stdout.write(self.style.WARNING("DRY RUN MODE: Skipping DB writes."))
            return

        plans = SubscriptionPlan.get_default_plans()
        for p in plans:
            self.stdout.write(self.style.SUCCESS(
                f"  Plan: {p.name:<15} Type: {p.plan_type:<15} Price: {p.currency} {p.price / 100:.2f}  Max Users: {p.max_users}"
            ))

    def _handle_list_subscriptions(self):
        self.stdout.write(self.style.MIGRATE_HEADING("=== Tenant Subscriptions List ==="))
        subs = Subscription.objects.all_including_deleted().select_related('plan')
        if not subs.exists():
            self.stdout.write("No subscriptions found.")
            return

        for s in subs:
            org = Organization.objects.filter(id=s.tenant_id).first()
            org_name = org.name if org else "Unknown Org"
            self.stdout.write(
                f"  [{s.status.upper():^10}] Org: {org_name:<25} ({s.tenant_id}) | "
                f"Code: {s.subscription_code:<18} | Plan: {s.plan.name if s.plan else 'None'} | "
                f"End Date: {s.current_period_end.strftime('%Y-%m-%d %H:%M') if s.current_period_end else 'N/A'}"
            )

    def _handle_process_renewals(self, dry_run=False):
        self.stdout.write(self.style.MIGRATE_HEADING("=== Processing Upcoming Subscription Renewals ==="))
        now = timezone.now()
        expiring = Subscription.objects.filter(
            status=Subscription.STATUS_ACTIVE,
            auto_renew=True,
            current_period_end__lte=now + timedelta(days=3)
        )

        if not expiring.exists():
            self.stdout.write("No active subscriptions currently due for renewal.")
            return

        for sub in expiring:
            self.stdout.write(f"  Subscription {sub.subscription_code} (Tenant: {sub.tenant_id}) expires at {sub.current_period_end}")
            if not dry_run:
                old_end = sub.current_period_end
                sub.current_period_start = now
                sub.current_period_end = now + (timedelta(days=365) if sub.billing_interval == 'yearly' else timedelta(days=30))
                sub.save()
                self.stdout.write(self.style.SUCCESS(f"    Renewed from {old_end} to {sub.current_period_end}"))

    def _bill_tenant(self, tenant, plan_type, interval, mark_paid=False, dry_run=False):
        self.stdout.write(self.style.MIGRATE_HEADING(f"=== Billing Tenant: {tenant.name} ({tenant.id}) ==="))
        plan = SubscriptionPlan.objects.filter(plan_type=plan_type).first()
        if not plan:
            self.stdout.write(self.style.WARNING(f"Plan type '{plan_type}' not found. Seeding default plans first..."))
            SubscriptionPlan.get_default_plans()
            plan = SubscriptionPlan.objects.filter(plan_type=plan_type).first()

        if not plan:
            raise CommandError(f"Could not load or create plan type '{plan_type}'.")

        # Determine price based on interval
        base_price = plan.yearly_price if (interval == 'yearly' and plan.yearly_price) else plan.price
        subtotal = base_price
        tax_amount = int(subtotal * 0.16)
        total_amount = subtotal + tax_amount
        duration_days = 365 if interval == 'yearly' else 30

        now = timezone.now()
        period_end = now + timedelta(days=duration_days)

        self.stdout.write(f"  Plan Selected: {plan.name} ({plan.plan_type})")
        self.stdout.write(f"  Billing Interval: {interval.title()}")
        self.stdout.write(f"  Subtotal: {plan.currency} {subtotal / 100:.2f}")
        self.stdout.write(f"  Tax (16% VAT): {plan.currency} {tax_amount / 100:.2f}")
        self.stdout.write(f"  Total Amount: {plan.currency} {total_amount / 100:.2f}")
        self.stdout.write(f"  Billing Period: {now.strftime('%Y-%m-%d')} to {period_end.strftime('%Y-%m-%d')}")
        self.stdout.write(f"  Mark as Paid: {'YES' if mark_paid else 'NO (Pending Invoice)'}")

        if dry_run:
            self.stdout.write(self.style.WARNING("\nDRY RUN COMPLETE: No database records created."))
            return

        with transaction.atomic():
            # 1. Get or Create Subscription
            existing_sub = Subscription.objects.get_current_for_tenant(tenant.id)
            if existing_sub:
                subscription = existing_sub
                subscription.plan = plan
                subscription.billing_interval = interval
                subscription.amount = total_amount
                subscription.currency = plan.currency
                subscription.status = Subscription.STATUS_ACTIVE
                subscription.current_period_start = now
                subscription.current_period_end = period_end
                subscription.auto_renew = True
                subscription.cancel_at_period_end = False
                subscription.save()
                self.stdout.write(self.style.SUCCESS(f"  Updated existing Subscription: {subscription.subscription_code}"))
            else:
                code = f"SUB-{tenant.slug.upper()[:6]}-{uuid.uuid4().hex[:6].upper()}"
                subscription = Subscription.objects.create(
                    tenant_id=tenant.id,
                    plan=plan,
                    subscription_code=code,
                    status=Subscription.STATUS_ACTIVE,
                    start_date=now,
                    current_period_start=now,
                    current_period_end=period_end,
                    billing_interval=interval,
                    amount=total_amount,
                    currency=plan.currency,
                    auto_renew=True
                )
                self.stdout.write(self.style.SUCCESS(f"  Created new Subscription: {subscription.subscription_code}"))

            # 2. Create Tenant Override for Enterprise
            if plan_type == 'enterprise':
                admin_user = User.objects.filter(is_superuser=True).first()
                admin_id = admin_user.id if admin_user else '00000000-0000-0000-0000-000000000000'

                TenantSubscriptionOverride.objects.update_or_create(
                    tenant_id=tenant.id,
                    defaults={
                        'plan': plan,
                        'subscription': subscription,
                        'approved_by': admin_id,
                        'override_type': 'all',
                        'override_features': {
                            'users': -1,
                            'kpis': -1,
                            'departments': -1,
                            'storage': -1,
                            'custom_branding': True,
                            'api_access': True,
                            'sso_enabled': True,
                        },
                        'approval_notes': f"Billed via bill_tenant command on {now.strftime('%Y-%m-%d')}"
                    }
                )
                self.stdout.write(self.style.SUCCESS("  Applied Enterprise Custom Override"))

            # 3. Create Invoice
            inv_number = Invoice.generate_invoice_number(tenant.id)
            inv_status = Invoice.STATUS_PAID if mark_paid else Invoice.STATUS_PENDING
            invoice = Invoice.objects.create(
                tenant_id=tenant.id,
                subscription=subscription,
                invoice_number=inv_number,
                invoice_date=now,
                due_date=now + timedelta(days=14),
                subtotal=subtotal,
                tax_rate=0.16,
                tax_amount=tax_amount,
                total_amount=total_amount,
                currency=plan.currency,
                status=inv_status,
                paid_at=now if mark_paid else None,
                line_items=[
                    {
                        'description': f"{plan.name} Plan ({interval.title()})",
                        'quantity': 1,
                        'unit_price': subtotal,
                        'total': subtotal,
                        'currency': plan.currency
                    },
                    {
                        'description': f"Tax (16% VAT)",
                        'quantity': 1,
                        'unit_price': tax_amount,
                        'total': tax_amount,
                        'currency': plan.currency,
                        'is_tax': True
                    }
                ],
                notes=f"Generated via management command for {tenant.name}"
            )
            self.stdout.write(self.style.SUCCESS(f"  Generated Invoice: {invoice.invoice_number} (Status: {inv_status.upper()})"))

            # 4. Create Transaction Record if Paid
            if mark_paid:
                txn_ref = f"TXN-MANUAL-{uuid.uuid4().hex[:8].upper()}"
                billing_txn = BillingTransaction.objects.create(
                    tenant_id=tenant.id,
                    subscription=subscription,
                    invoice=invoice,
                    reference=txn_ref,
                    transaction_type=BillingTransaction.TYPE_SUBSCRIPTION,
                    status=BillingTransaction.STATUS_SUCCESS,
                    amount=subtotal,
                    tax_amount=tax_amount,
                    total_amount=total_amount,
                    currency=plan.currency,
                    payment_method='other',
                    metadata={
                        'description': f"Manual payment for Invoice {invoice.invoice_number}",
                        'generated_by': 'bill_tenant_command'
                    }
                )
                self.stdout.write(self.style.SUCCESS(f"  Recorded Transaction: {billing_txn.reference}"))

            # 5. Dispatch Email Notifications
            if mark_paid and 'billing_txn' in locals():
                try:
                    send_payment_confirmation.delay(str(billing_txn.id))
                    self.stdout.write(self.style.SUCCESS(f"  Dispatched payment confirmation email notification."))
                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"  Could not send email notification: {e}"))

        self.stdout.write(self.style.SUCCESS(f"\nSuccessfully billed tenant {tenant.name} on {plan.name} Plan!"))
