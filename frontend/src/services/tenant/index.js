// frontend/src/services/tenant/index.js
import TenantService from './tenant.service';
import DomainService from './domain.service';
import BackupService from './backup.service';
import MigrationService from './migration.service';
import SchemaService from './schema.service';
import ResourceService from './resource.service';
import ProvisioningService from './provisioning.service';
import HealthService from './health.service';
import StatsService from './stats.service';
import TenantAuditService from './tenantAudit.service';
import TenantWebSocketService from './websocket.service';
import connectionService from './connection.service';

// Named exports
export {
    TenantService,
    DomainService,
    BackupService,
    MigrationService,
    SchemaService,
    ResourceService,
    ProvisioningService,
    HealthService,
    StatsService,
    TenantAuditService,
    TenantWebSocketService,
    connectionService,
};

// Default export
export default {
    TenantService,
    DomainService,
    BackupService,
    MigrationService,
    SchemaService,
    ResourceService,
    ProvisioningService,
    HealthService,
    StatsService,
    TenantAuditService,
    TenantWebSocketService,
    connectionService,
};
