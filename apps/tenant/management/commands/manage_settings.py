"""
Alias for manage_tenant_settings command.
"""
from apps.tenant.management.commands.manage_tenant_settings import Command as SettingsCommand


class Command(SettingsCommand):
    help = 'Alias for manage_tenant_settings: Comprehensive management command for Falcon PMS Tenant system settings, configurations, and cache.'
