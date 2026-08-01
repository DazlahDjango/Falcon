"""
Canonical V1 app registry definitions — single source of truth for CIA-aligned registration.

Confidentiality: registry metadata is system-level; health paths are internal only.
Integrity: all apps sync from this module; apps.py calls register_from_definition().
Availability: is_critical, recovery_priority, RPO/RTO, and dependencies drive DR/backup order.
"""
from dataclasses import dataclass, field
from typing import FrozenSet, Tuple


@dataclass(frozen=True)
class AppDefinition:
    name: str
    display_name: str
    is_critical: bool
    recovery_priority: int
    rpo_minutes: int
    rto_minutes: int
    backup_retention_days: int
    health_check_path: str = ''
    dependencies: Tuple[str, ...] = field(default_factory=tuple)
    cia_availability_tier: str = 'standard'
    cia_integrity_level: str = 'high'
    cia_confidentiality_level: str = 'internal'

    @property
    def cia_summary(self) -> dict:
        return {
            'availability_tier': self.cia_availability_tier,
            'integrity_level': self.cia_integrity_level,
            'confidentiality_level': self.cia_confidentiality_level,
        }


# Relative paths resolved against CONFIG_INTERNAL_HEALTH_BASE_URL (see app_registry)
V1_APP_DEFINITIONS: dict[str, AppDefinition] = {
    'accounts': AppDefinition(
        name='accounts',
        display_name='Accounts & Authentication',
        is_critical=True,
        recovery_priority=1,
        rpo_minutes=15,
        rto_minutes=30,
        backup_retention_days=90,
        health_check_path='/api/v1/accounts/health/',
        cia_availability_tier='critical',
        cia_integrity_level='critical',
        cia_confidentiality_level='restricted',
    ),
    'tenant': AppDefinition(
        name='tenant',
        display_name='Tenant Management',
        is_critical=True,
        recovery_priority=1,
        rpo_minutes=15,
        rto_minutes=30,
        backup_retention_days=90,
        health_check_path='/api/v1/tenant/health/',
        cia_availability_tier='critical',
        cia_integrity_level='critical',
        cia_confidentiality_level='restricted',
    ),
    'kpi': AppDefinition(
        name='kpi',
        display_name='KPI Engine',
        is_critical=True,
        recovery_priority=1,
        rpo_minutes=60,
        rto_minutes=120,
        backup_retention_days=90,
        health_check_path='/api/v1/health/',
        cia_availability_tier='critical',
        cia_integrity_level='high',
        cia_confidentiality_level='internal',
    ),
    'billing': AppDefinition(
        name='billing',
        display_name='Billing & Subscription',
        is_critical=True,
        recovery_priority=1,
        rpo_minutes=60,
        rto_minutes=120,
        backup_retention_days=90,
        health_check_path='/api/v1/health/',
        dependencies=('accounts', 'tenant'),
        cia_availability_tier='critical',
        cia_integrity_level='critical',
        cia_confidentiality_level='restricted',
    ),
    'structure': AppDefinition(
        name='structure',
        display_name='Organization Structure',
        is_critical=False,
        recovery_priority=2,
        rpo_minutes=240,
        rto_minutes=480,
        backup_retention_days=60,
        health_check_path='/api/v1/structure/health/database/',
        cia_availability_tier='high',
        cia_integrity_level='high',
        cia_confidentiality_level='internal',
    ),
    'dashboard': AppDefinition(
        name='dashboard',
        display_name='Dashboard & Analytics',
        is_critical=True,
        recovery_priority=2,
        rpo_minutes=30,
        rto_minutes=45,
        backup_retention_days=60,
        health_check_path='/api/v1/health/',
        dependencies=('accounts', 'kpi', 'structure', 'tenant'),
        cia_availability_tier='high',
        cia_integrity_level='high',
        cia_confidentiality_level='internal',
    ),
    'reviews': AppDefinition(
        name='reviews',
        display_name='Performance Reviews',
        is_critical=False,
        recovery_priority=3,
        rpo_minutes=240,
        rto_minutes=480,
        backup_retention_days=30,
        health_check_path='/api/v1/reviews/health/',
        dependencies=('accounts', 'structure', 'tenant'),
        cia_availability_tier='standard',
        cia_integrity_level='high',
        cia_confidentiality_level='internal',
    ),
    'configs': AppDefinition(
        name='configs',
        display_name='Configuration Management',
        is_critical=True,
        recovery_priority=1,
        rpo_minutes=15,
        rto_minutes=30,
        backup_retention_days=365,
        health_check_path='/api/v1/config/dashboard/health/',
        dependencies=('accounts', 'tenant'),
        cia_availability_tier='critical',
        cia_integrity_level='critical',
        cia_confidentiality_level='restricted',
    ),
    'reportplt': AppDefinition(
        name='reportplt',
        display_name='Reporting Platform & Templates',
        is_critical=False,
        recovery_priority=3,
        rpo_minutes=240,
        rto_minutes=480,
        backup_retention_days=60,
        health_check_path='/api/v1/health/',
        dependencies=('accounts', 'kpi', 'tenant'),
        cia_availability_tier='high',
        cia_integrity_level='high',
        cia_confidentiality_level='internal',
    ),
}

# Apps that self-register on Django startup via apps.py
STARTUP_REGISTERED_APPS: FrozenSet[str] = frozenset({
    'accounts', 'tenant', 'kpi', 'billing', 'structure', 'dashboard', 'reviews', 'reportplt',
})

