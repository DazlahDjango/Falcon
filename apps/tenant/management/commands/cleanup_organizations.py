from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.tenant.models import Organization
from apps.tenant.constants import OrganizationStatus

class Command(BaseCommand):
    help = 'Clean up failed or stale organizations.'

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=7, help='Delete organizations failed for N days (default: 7)')
        parser.add_argument('--dry-run', action='store_true', help='Show what would be deleted without actually deleting')
        parser.add_argument('--hard-delete', action='store_true', help='Permanently delete instead of soft delete')

    def handle(self, *args, **options):
        days = options.get('days', 7)
        cutoff = timezone.now() - timedelta(days=days)
        failed_orgs = Organization.objects.filter(
            status='FAILED',
            created_at__lt=cutoff,
            is_deleted=False
        )
        if options.get('dry_run'):
            self.stdout.write(f'Would delete {failed_orgs.count()} organizations:')
            for org in failed_orgs:
                self.stdout.write(f'  - {org.name} ({org.id}) created: {org.created_at}')
            return
        count = 0
        for org in failed_orgs:
            if options.get('hard_delete'):
                org.hard_delete()
                self.stdout.write(self.style.SUCCESS(f'Permanently deleted: {org.name}'))
            else:
                org.soft_delete()
                self.stdout.write(self.style.SUCCESS(f'Soft deleted: {org.name}'))
            count += 1
        self.stdout.write(self.style.SUCCESS(f'Cleaned up {count} organizations'))