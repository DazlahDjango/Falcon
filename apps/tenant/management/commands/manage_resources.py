"""
Alias for manage_resource command.
"""
from apps.tenant.management.commands.manage_resource import Command as ResourceCommand


class Command(ResourceCommand):
    help = 'Alias for manage_resource: Comprehensive management command for Falcon PMS Tenant Resource Quotas, tracking, and daily cycles.'
