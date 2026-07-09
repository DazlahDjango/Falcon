// ============================================
// Structure Constants - Extra constants beyond API and Routes
// ============================================

// ============================================
// UI CONSTANTS
// ============================================

export const STRUCTURE_UI = {
    // Pagination defaults
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],

    // Table columns configuration
    TABLE_COLUMNS: {
        ORG_UNITS: ['code', 'name', 'level', 'parent', 'depth', 'is_active'],
        DEPARTMENTS: ['code', 'name', 'parent', 'depth', 'headcount_limit', 'sensitivity_level', 'is_active'],
        POSITIONS: ['job_code', 'title', 'grade', 'level', 'current_incumbents_count', 'is_vacant'],
        EMPLOYMENTS: ['user', 'position', 'department', 'employment_type', 'effective_from', 'is_current'],
        REPORTING: ['employee', 'manager', 'effective_from', 'effective_to', 'is_active'],
        COST_CENTERS: ['code', 'name', 'category', 'fiscal_year', 'budget_amount', 'is_active'],
        LOCATIONS: ['code', 'name', 'type', 'city', 'country', 'is_active'],
    },

    // Status colors
    STATUS_COLORS: {
        active: '#22c55e',
        inactive: '#ef4444',
        draft: '#f59e0b',
        pending: '#3b82f6',
        archived: '#6b7280',
    },

    // Icon mappings
    ICONS: {
        division: 'Building',
        department: 'Building2',
        section: 'Layers',
        unit: 'Grid',
        position: 'Briefcase',
        employment: 'User',
        reporting: 'GitBranch',
        cost_center: 'DollarSign',
        location: 'MapPin',
    },
};

// ============================================
// VALIDATION CONSTANTS
// ============================================

export const STRUCTURE_VALIDATION = {
    CODE_MAX_LENGTH: 50,
    NAME_MAX_LENGTH: 255,
    DESCRIPTION_MAX_LENGTH: 1000,
    MAX_DEPTH: 10,
    MAX_INCUMBENTS: 10,
    MIN_LEVEL: 1,
    MAX_LEVEL: 20,
    BUDGET_MAX_DIGITS: 15,
    BUDGET_DECIMAL_PLACES: 2,
    ALLOCATION_MIN: 0,
    ALLOCATION_MAX: 100,
    PHONE_REGEX: /^\+?[\d\s-()]{10,20}$/,
    POSTAL_REGEX: /^[A-Z0-9\s-]{3,20}$/,
};

// ============================================
// BULK OPERATION CONSTANTS
// ============================================

export const BULK_OPERATIONS = {
    MAX_RECORDS: 100,
    SUPPORTED_ACTIONS: ['create', 'update', 'delete'],
    BATCH_TYPES: {
        DEPARTMENTS: 'departments',
        EMPLOYMENTS: 'employments',
        REPORTING_LINES: 'reporting_lines',
    },
};

// ============================================
// EXPORT CONSTANTS
// ============================================

export const EXPORT_FORMATS = {
    JSON: 'json',
    CSV: 'csv',
    TXT: 'txt',
    VISIO: 'visio',
};

export const EXPORT_FORMAT_LABELS = {
    JSON: 'JSON',
    CSV: 'CSV',
    TXT: 'TXT',
    VISIO: 'Visio',
};

export const EXPORT_ENTITIES = {
    ORG_UNITS: 'org_units',
    DIVISIONS: 'divisions',
    DEPARTMENTS: 'departments',
    SECTIONS: 'sections',
    UNITS: 'units',
    EMPLOYMENTS: 'employments',
    POSITIONS: 'positions',
    REPORTING: 'reporting',
};

// ============================================
// HIERARCHY VERSION CONSTANTS
// ============================================

export const HIERARCHY_VERSION = {
    DEFAULT_LIMIT: 20,
    AUTO_CAPTURE_INTERVAL_DAYS: 1,
    MAX_VERSIONS_TO_KEEP: 100,
};

// ============================================
// DASHBOARD CONSTANTS
// ============================================

export const DASHBOARD = {
    DEFAULT_TREND_MONTHS: 6,
    HEALTH_SCORE_THRESHOLDS: {
        EXCELLENT: 90,
        GOOD: 80,
        WARNING: 70,
        CRITICAL: 50,
    },
    CHART_COLORS: [
        '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
        '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
    ],
};

// ============================================
// MESSAGES
// ============================================

export const STRUCTURE_MESSAGES = {
    // Success messages
    CREATE_SUCCESS: 'Created successfully',
    UPDATE_SUCCESS: 'Updated successfully',
    DELETE_SUCCESS: 'Deleted successfully',
    BULK_SUCCESS: 'Bulk operation completed successfully',
    TRANSFER_SUCCESS: 'Transfer completed successfully',
    ASSIGN_SUCCESS: 'Assignment completed successfully',
    SNAPSHOT_CAPTURED: 'Hierarchy snapshot captured successfully',
    RESTORE_SUCCESS: 'Hierarchy restored successfully',

    // Error messages
    FETCH_ERROR: 'Failed to fetch data',
    CREATE_ERROR: 'Failed to create',
    UPDATE_ERROR: 'Failed to update',
    DELETE_ERROR: 'Failed to delete',
    BULK_ERROR: 'Bulk operation failed',
    VALIDATION_ERROR: 'Validation failed',
    PERMISSION_DENIED: 'Permission denied',
    TENANT_ERROR: 'Tenant isolation violation',
    CYCLE_DETECTED: 'Hierarchy cycle detected',
    SELF_PARENT_ERROR: 'Cannot set self as parent',
    INVALID_DATE_RANGE: 'Invalid date range',
    POSITION_OCCUPIED: 'Position already occupied',
    EMPLOYMENT_OVERLAP: 'Employment period overlaps',

    // Confirm messages
    CONFIRM_DELETE: 'Are you sure you want to delete this item?',
    CONFIRM_BULK_DELETE: 'Are you sure you want to delete these items?',
    CONFIRM_RESTORE: 'Are you sure you want to restore this version?',
};

// ============================================
// DEPARTMENT SENSITIVITY CONSTANTS
// ============================================

export const DEPARTMENT_SENSITIVITY = {
    PUBLIC: 'public',
    INTERNAL: 'internal',
    CONFIDENTIAL: 'confidential',
    RESTRICTED: 'restricted',
};

export const DEPARTMENT_SENSITIVITY_LABELS = {
    public: 'Public',
    internal: 'Internal',
    confidential: 'Confidential',
    restricted: 'Restricted',
};

export const DEPARTMENT_SENSITIVITY_COLORS = {
    public: '#10b981',
    internal: '#3b82f6',
    confidential: '#f59e0b',
    restricted: '#ef4444',
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    STRUCTURE_UI,
    STRUCTURE_VALIDATION,
    BULK_OPERATIONS,
    EXPORT_FORMATS,
    EXPORT_ENTITIES,
    EXPORT_FORMAT_LABELS,
    HIERARCHY_VERSION,
    DASHBOARD,
    STRUCTURE_MESSAGES,
    DEPARTMENT_SENSITIVITY,
    DEPARTMENT_SENSITIVITY_LABELS,
    DEPARTMENT_SENSITIVITY_COLORS,
};