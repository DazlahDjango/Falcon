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
import TenantWebSocketService from './websocket.service';

// Export individual services
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
    TenantWebSocketService,
};

// Export default object with all services
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
    TenantWebSocketService,
};