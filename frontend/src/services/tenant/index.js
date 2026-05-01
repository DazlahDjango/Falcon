// frontend/src/services/tenant/index.js
import TenantService from './tenant.service';
import DomainService from './domain.service';
import BackupService from './backup.service';
import ResourceService from './resource.service';

// Export individual services
export {
    TenantService,
    DomainService,
    BackupService,
    ResourceService,
};

// Export default object with all services
export default {
    TenantService,
    DomainService,
    BackupService,
    ResourceService,
};