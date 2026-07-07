from django.core.management.base import BaseCommand
from django.apps import apps
from django.db import connections
from apps.tenant.models import Organization, OrganizationMigration

class Command(BaseCommand):
    help = 'Sync Django migrations to OrganizationMigration table'

    def add_arguments(self, parser):
        parser.add_argument(
            '--org-id',
            type=str,
            help='Specific organization ID (optional)',
        )

    def handle(self, *args, **options):
        # Get all migration records from Django
        django_migrations = self.get_django_migrations()
        
        # Get organizations
        orgs = Organization.objects.filter(is_active=True)
        if options.get('org_id'):
            orgs = orgs.filter(id=options['org_id'])
        
        for org in orgs:
            self.stdout.write(f"Processing {org.name}...")
            for migration in django_migrations:
                # Check if already exists
                exists = OrganizationMigration.objects.filter(
                    organization=org,
                    migration_name=migration['name'],
                    app_name=migration['app']
                ).exists()
                
                if not exists:
                    # Create the migration record
                    OrganizationMigration.objects.create(
                        organization=org,
                        migration_name=migration['name'],
                        app_name=migration['app'],
                        status='COMPLETED',
                        started_at=migration['applied_at'],
                        completed_at=migration['applied_at']
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f"  ✅ Added {migration['app']}.{migration['name']}")
                    )
        
        self.stdout.write(self.style.SUCCESS("Migration sync complete!"))

    def get_django_migrations(self):
        """Get all applied Django migrations"""
        migrations = []
        from django.db.migrations.recorder import MigrationRecorder
        recorder = MigrationRecorder(connections['default'])
        
        for migration in recorder.applied_migrations():
            migrations.append({
                'app': migration.app,
                'name': migration.name,
                'applied_at': migration.applied
            })
        return migrations