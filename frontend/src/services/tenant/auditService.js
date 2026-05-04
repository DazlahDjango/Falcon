// frontend/src/services/tenant/auditService.js
// INDEPENDENT - no imports from BaseTenantService

export const auditLog = async (logData) => {
    try {
        console.log('[AUDIT]', logData);
        return { success: true };
    } catch (error) {
        console.error('Audit log failed:', error);
        return { success: false, error: error.message };
    }
};

export default { auditLog };
