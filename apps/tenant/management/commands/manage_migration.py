"""
Alias for tenant_migrate command.
"""
from apps.tenant.management.commands.tenant_migrate import Command as MigrateCommand


class Command(MigrateCommand):
    help = 'Alias for tenant_migrate: Manage multi-tenant schema database migrations (sync, status, preview, apply, rollback).'
