"""
Services for organisations app
"""

# Provisioning services
from .provisioning.tenant_creator import TenantCreatorService
from .provisioning.schema_setup import SchemaSetupService
from .provisioning.default_data import DefaultDataLoader
from .provisioning.welcome_emails import WelcomeEmailService

# Subscription services
from .subscription.plan_manager import PlanManagerService
from .subscription.feature_access import FeatureAccessService
from .subscription.billing_integration import BillingIntegrationService
from .subscription.renewal_service import RenewalService

# Domain services
from .domain.dns_verifier import DNSVerifierService
from .domain.ssl_handler import SSLHandlerService
from .domain.domain_router import DomainRouterService

# Config services
from .config.settings_manager import SettingsManagerService
from .config.branding import BrandingService
from .config.module_manager import ModuleManagerService

# Reporting services
from .reporting.usage_reporter import UsageReporterService
from .reporting.quota_checker import QuotaCheckerService
from .reporting.activity_logs import ActivityLogsService

# Structure services
from .structure.hierarchy import HierarchyService

# Settings services
from .settings.kpi_templates import KPITemplatesService

__all__ = [
    # Provisioning
    'TenantCreatorService',
    'SchemaSetupService',
    'DefaultDataLoader',
    'WelcomeEmailService',
    # Subscription
    'PlanManagerService',
    'FeatureAccessService',
    'BillingIntegrationService',
    'RenewalService',
    # Domain
    'DNSVerifierService',
    'SSLHandlerService',
    'DomainRouterService',
    # Config
    'SettingsManagerService',
    'BrandingService',
    'ModuleManagerService',
    # Reporting
    'UsageReporterService',
    'QuotaCheckerService',
    'ActivityLogsService',
    # Structure
    'HierarchyService',
    # Settings
    'KPITemplatesService',
]