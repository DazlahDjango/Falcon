// KPI Types
export const KPI_TYPES = {
    COUNT: { value: 'COUNT', label: 'Count / Number', icon: '🔢', defaultUnit: '' },
    PERCENTAGE: { value: 'PERCENTAGE', label: 'Percentage (%)', icon: '%', defaultUnit: '%' },
    FINANCIAL: { value: 'FINANCIAL', label: 'Financial Amount', icon: '💰', defaultUnit: 'KES' },
    MILESTONE: { value: 'MILESTONE', label: 'Yes / No Milestone', icon: '✅', defaultUnit: '' },
    TIME: { value: 'TIME', label: 'Time / Turnaround', icon: '⏱️', defaultUnit: 'days' },
    IMPACT: { value: 'IMPACT', label: 'Impact Score', icon: '🎯', defaultUnit: 'points' }
};

// Calculation Logic
export const CALCULATION_LOGIC = {
    HIGHER_IS_BETTER: { 
        value: 'HIGHER_IS_BETTER', 
        label: 'Higher is Better', 
        formula: '(Actual ÷ Target) × 100',
        formulaFn: (actual, target) => (actual / target) * 100
    },
    LOWER_IS_BETTER: { 
        value: 'LOWER_IS_BETTER', 
        label: 'Lower is Better', 
        formula: '(Target ÷ Actual) × 100',
        formulaFn: (actual, target) => (target / actual) * 100
    }
};

// Measure Types
export const MEASURE_TYPES = {
    CUMULATIVE: { 
        value: 'CUMULATIVE', 
        label: 'Cumulative (YTD)', 
        description: 'Values add up over time',
        icon: '📊'
    },
    NON_CUMULATIVE: { 
        value: 'NON_CUMULATIVE', 
        label: 'Non-Cumulative', 
        description: 'Period-only values',
        icon: '📅'
    }
};

// Traffic Light Status
export const TRAFFIC_LIGHT = {
    GREEN: { value: 'GREEN', label: 'On Track', emoji: '🟢', color: '#22c55e', score: '≥ 90%', threshold: 90 },
    YELLOW: { value: 'YELLOW', label: 'At Risk', emoji: '🟡', color: '#eab308', score: '50% - 89%', threshold: 50 },
    RED: { value: 'RED', label: 'Off Track', emoji: '🔴', color: '#ef4444', score: '< 50%', threshold: 0 }
};

// Validation Status
export const VALIDATION_STATUS = {
    PENDING: { value: 'PENDING', label: 'Pending Validation', color: '#eab308', icon: '⏳' },
    APPROVED: { value: 'APPROVED', label: 'Approved', color: '#22c55e', icon: '✅' },
    REJECTED: { value: 'REJECTED', label: 'Rejected', color: '#ef4444', icon: '❌' },
    ADJUSTED: { value: 'ADJUSTED', label: 'Adjusted', color: '#8b5cf6', icon: '↻' }
};

// Escalation Status
export const ESCALATION_STATUS = {
    PENDING: { value: 'PENDING', label: 'Pending', color: '#eab308' },
    REVIEWING: { value: 'REVIEWING', label: 'Under Review', color: '#3b82f6' },
    RESOLVED: { value: 'RESOLVED', label: 'Resolved', color: '#22c55e' },
    CLOSED: { value: 'CLOSED', label: 'Closed', color: '#6b7280' }
};

// Sector Types
export const SECTOR_TYPES = {
    COMMERCIAL: { value: 'COMMERCIAL', label: 'Commercial / Corporate', icon: '🏢' },
    NGO: { value: 'NGO', label: 'NGO / Non-Profit', icon: '🤝' },
    PUBLIC: { value: 'PUBLIC', label: 'Public Sector / Government', icon: '🏛️' },
    CONSULTING: { value: 'CONSULTING', label: 'Consulting / Professional Services', icon: '💼' }
};

// Category Types
export const CATEGORY_TYPES = {
    FINANCIAL: { value: 'FINANCIAL', label: 'Financial', icon: '💰', color: '#10b981' },
    IMPACT: { value: 'IMPACT', label: 'Impact', icon: '🎯', color: '#3b82f6' },
    OPERATIONAL: { value: 'OPERATIONAL', label: 'Operational', icon: '⚙️', color: '#8b5cf6' },
    CUSTOMER: { value: 'CUSTOMER', label: 'Customer', icon: '👥', color: '#f59e0b' },
    INTERNAL: { value: 'INTERNAL', label: 'Internal', icon: '📋', color: '#6366f1' },
    GROWTH: { value: 'GROWTH', label: 'Growth', icon: '📈', color: '#ec489a' },
    COMPLIANCE: { value: 'COMPLIANCE', label: 'Compliance', icon: '⚠️', color: '#ef4444' }
};

// Thresholds
export const THRESHOLDS = {
    GREEN: 90,
    YELLOW: 50,
    RED_ALERT_CONSECUTIVE: 2,
    VALIDATION_REMINDER_HOURS: 48,
    MISSING_DATA_DAY: 5
};

// Calculation Precision
export const PRECISION = {
    SCORE: 1,
    PERCENTAGE: 1,
    CURRENCY: 2,
    DEFAULT: 2
};

// Chart Colors
export const CHART_COLORS = {
    PRIMARY: '#3b82f6',
    SUCCESS: '#22c55e',
    WARNING: '#eab308',
    DANGER: '#ef4444',
    INFO: '#8b5cf6',
    GRAY: '#6b7280',
    LIGHT_GRAY: '#e5e7eb',
    WHITE: '#ffffff'
};

// Chart Defaults
export const CHART_DEFAULTS = {
    HEIGHT: 300,
    ANIMATION_DURATION: 1000,
    FONT_FAMILY: 'system-ui, -apple-system, sans-serif'
};

// Date Formats
export const DATE_FORMATS = {
    DISPLAY: 'MMM DD, YYYY',
    API: 'YYYY-MM-DD',
    PERIOD: 'YYYY-MM',
    MONTH_YEAR: 'MMMM YYYY',
    YEAR: 'YYYY',
    TIME: 'HH:mm'
};

// Cache TTL (seconds)
export const CACHE_TTL = {
    DASHBOARD: 300,      // 5 minutes
    SCORES: 60,          // 1 minute
    AGGREGATIONS: 180,   // 3 minutes
    FRAMEWORKS: 3600,    // 1 hour
    KPIS: 300,           // 5 minutes
    TARGETS: 300         // 5 minutes
};

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    VALIDATION: 'Please check the form for errors.',
    SERVER: 'An unexpected error occurred. Please try again.',
    RATE_LIMIT: 'Too many requests. Please wait a moment.',
    INVALID_KPI: 'Invalid KPI configuration',
    INVALID_TARGET: 'Invalid target value',
    INVALID_ACTUAL: 'Invalid actual value',
    DUPLICATE: 'This record already exists',
    LOCKED: 'This record is locked and cannot be modified'
};
// Success Messages
export const SUCCESS_MESSAGES = {
    CREATE: 'Successfully created.',
    UPDATE: 'Successfully updated.',
    DELETE: 'Successfully deleted.',
    APPROVE: 'Successfully approved.',
    REJECT: 'Successfully rejected.',
    SUBMIT: 'Successfully submitted.',
    CALCULATE: 'Calculation started successfully.',
    EXPORT: 'Export started. You will be notified when ready.',
    CASCADE: 'Target cascade created successfully',
    PHASING: 'Target phasing configured successfully'
};
export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf', '.xls', '.xlsx', '.csv']
};