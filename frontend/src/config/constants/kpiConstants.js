export const KPI_TYPES = {
    COUNT: 'COUNT',
    PERCENTAGE: 'PERCENTAGE',
    FINANCIAL: 'FINANCIAL',
    MILESTONE: 'MILESTONE',
    TIME: 'TIME',
    IMPACT: 'IMPACT',
};

export const KPI_TYPES_DISPLAY = {
    COUNT: 'Count / Number',
    PERCENTAGE: 'Percentage (%)',
    FINANCIAL: 'Financial Amount',
    MILESTONE: 'Yes / No Milestone',
    TIME: 'Time / Turnaround',
    IMPACT: 'Impact Score',
};

export const KPI_TYPES_ORDER = {
    COUNT: 0,
    PERCENTAGE: 1,
    FINANCIAL: 2,
    MILESTONE: 3,
    TIME: 4,
    IMPACT: 5,
};

// ============================================
// 2. CALCULATION LOGIC CONSTANTS
// ============================================

export const CALCULATION_LOGIC = {
    HIGHER_IS_BETTER: 'HIGHER_IS_BETTER',
    LOWER_IS_BETTER: 'LOWER_IS_BETTER',
};

export const CALCULATION_LOGIC_DISPLAY = {
    HIGHER_IS_BETTER: 'Higher is Better',
    LOWER_IS_BETTER: 'Lower is Better',
};

export const CALCULATION_LOGIC_COLORS = {
    HIGHER_IS_BETTER: 'success',
    LOWER_IS_BETTER: 'warning',
};

// ============================================
// 3. MEASURE TYPE CONSTANTS
// ============================================

export const MEASURE_TYPES = {
    CUMULATIVE: 'CUMULATIVE',
    NON_CUMULATIVE: 'NON_CUMULATIVE',
};

export const MEASURE_TYPES_DISPLAY = {
    CUMULATIVE: 'Cumulative (YTD)',
    NON_CUMULATIVE: 'Non-Cumulative (Period Only)',
};

// ============================================
// 4. FRAMEWORK STATUS CONSTANTS
// ============================================

export const FRAMEWORK_STATUS = {
    DRAFT: 'DRAFT',
    PUBLISHED: 'PUBLISHED',
    ARCHIVED: 'ARCHIVED',
};

export const FRAMEWORK_STATUS_DISPLAY = {
    DRAFT: 'Draft',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived',
};

export const FRAMEWORK_STATUS_COLORS = {
    DRAFT: 'secondary',
    PUBLISHED: 'success',
    ARCHIVED: 'error',
};

export const FRAMEWORK_STATUS_ICONS = {
    DRAFT: 'FileText',
    PUBLISHED: 'CheckCircle',
    ARCHIVED: 'Archive',
};

// ============================================
// 5. CATEGORY TYPE CONSTANTS
// ============================================

export const CATEGORY_TYPES = {
    FINANCIAL: 'FINANCIAL',
    IMPACT: 'IMPACT',
    OPERATIONAL: 'OPERATIONAL',
    CUSTOMER: 'CUSTOMER',
    INTERNAL: 'INTERNAL',
    GROWTH: 'GROWTH',
    COMPLIANCE: 'COMPLIANCE',
};

export const CATEGORY_TYPES_DISPLAY = {
    FINANCIAL: 'Financial',
    IMPACT: 'Impact / Outcomes',
    OPERATIONAL: 'Operational',
    CUSTOMER: 'Customer / Stakeholder',
    INTERNAL: 'Internal Process',
    GROWTH: 'Growth & Learning',
    COMPLIANCE: 'Compliance & Risk',
};

export const CATEGORY_TYPE_COLORS = {
    FINANCIAL: '#10b981',
    IMPACT: '#3b82f6',
    OPERATIONAL: '#f59e0b',
    CUSTOMER: '#8b5cf6',
    INTERNAL: '#ec4899',
    GROWTH: '#14b8a6',
    COMPLIANCE: '#ef4444',
};

// ============================================
// 6. SECTOR TYPE CONSTANTS
// ============================================

export const SECTOR_TYPES = {
    COMMERCIAL: 'COMMERCIAL',
    NGO: 'NGO',
    PUBLIC: 'PUBLIC',
    CONSULTING: 'CONSULTING',
};

export const SECTOR_TYPES_DISPLAY = {
    COMMERCIAL: 'Commercial / Corporate',
    NGO: 'NGO / Non-Profit',
    PUBLIC: 'Public Sector / Government',
    CONSULTING: 'Consulting / Professional Services',
};

// ============================================
// 7. TEMPLATE DIFFICULTY CONSTANTS
// ============================================

export const TEMPLATE_DIFFICULTY = {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED',
};

export const TEMPLATE_DIFFICULTY_DISPLAY = {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
};

export const TEMPLATE_DIFFICULTY_COLORS = {
    BEGINNER: 'success',
    INTERMEDIATE: 'warning',
    ADVANCED: 'error',
};

// ============================================
// 8. ACTUAL STATUS CONSTANTS
// ============================================

export const ACTUAL_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    ADJUSTED: 'ADJUSTED',
};

export const ACTUAL_STATUS_DISPLAY = {
    PENDING: 'Pending Validation',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    ADJUSTED: 'Adjusted',
};

export const ACTUAL_STATUS_COLORS = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    ADJUSTED: 'info',
};

export const ACTUAL_STATUS_ICONS = {
    PENDING: 'Clock',
    APPROVED: 'CheckCircle',
    REJECTED: 'XCircle',
    ADJUSTED: 'Edit',
};

// ============================================
// 9. ADJUSTMENT STATUS CONSTANTS
// ============================================

export const ADJUSTMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
};

export const ADJUSTMENT_STATUS_DISPLAY = {
    PENDING: 'Pending Approval',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
};

// ============================================
// 10. EVIDENCE TYPE CONSTANTS
// ============================================

export const EVIDENCE_TYPES = {
    DOCUMENT: 'DOCUMENT',
    IMAGE: 'IMAGE',
    LINK: 'LINK',
    NOTE: 'NOTE',
};

export const EVIDENCE_TYPES_DISPLAY = {
    DOCUMENT: 'Document',
    IMAGE: 'Image',
    LINK: 'Link',
    NOTE: 'Note',
};

export const EVIDENCE_TYPES_ICONS = {
    DOCUMENT: 'FileText',
    IMAGE: 'Image',
    LINK: 'Link',
    NOTE: 'File',
};

// ============================================
// 11. TRAFFIC LIGHT STATUS CONSTANTS
// ============================================

export const TRAFFIC_LIGHT_STATUS = {
    GREEN: 'GREEN',
    YELLOW: 'YELLOW',
    RED: 'RED',
};

export const TRAFFIC_LIGHT_STATUS_DISPLAY = {
    GREEN: 'On Track',
    YELLOW: 'At Risk',
    RED: 'Off Track',
};

export const TRAFFIC_LIGHT_COLORS = {
    GREEN: '#10b981',
    YELLOW: '#f59e0b',
    RED: '#ef4444',
};

export const TRAFFIC_LIGHT_EMOJIS = {
    GREEN: '🟢',
    YELLOW: '🟡',
    RED: '🔴',
};

// ============================================
// 12. AGGREGATION LEVEL CONSTANTS
// ============================================

export const AGGREGATION_LEVELS = {
    TEAM: 'TEAM',
    DEPARTMENT: 'DEPARTMENT',
    ORGANIZATION: 'ORGANIZATION',
};

export const AGGREGATION_LEVELS_DISPLAY = {
    TEAM: 'Team',
    DEPARTMENT: 'Department',
    ORGANIZATION: 'Organization',
};

// ============================================
// 13. HEALTH STATUS CONSTANTS
// ============================================

export const HEALTH_STATUS = {
    EXCELLENT: 'EXCELLENT',
    GOOD: 'GOOD',
    FAIR: 'FAIR',
    POOR: 'POOR',
};

export const HEALTH_STATUS_DISPLAY = {
    EXCELLENT: 'Excellent',
    GOOD: 'Good',
    FAIR: 'Fair',
    POOR: 'Poor',
};

export const HEALTH_STATUS_COLORS = {
    EXCELLENT: '#22c55e',
    GOOD: '#3b82f6',
    FAIR: '#eab308',
    POOR: '#ef4444',
};

export const HEALTH_STATUS_SCORES = {
    EXCELLENT: { min: 90, max: 100 },
    GOOD: { min: 75, max: 89 },
    FAIR: { min: 50, max: 74 },
    POOR: { min: 0, max: 49 },
};

// ============================================
// 14. RISK LEVEL CONSTANTS
// ============================================

export const RISK_LEVELS = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
};

export const RISK_LEVELS_DISPLAY = {
    LOW: 'Low Risk',
    MEDIUM: 'Medium Risk',
    HIGH: 'High Risk',
};

export const RISK_LEVELS_COLORS = {
    LOW: '#22c55e',
    MEDIUM: '#eab308',
    HIGH: '#ef4444',
};

// ============================================
// 15. TREND DIRECTION CONSTANTS
// ============================================

export const TREND_DIRECTIONS = {
    IMPROVING: 'IMPROVING',
    DECLINING: 'DECLINING',
    STABLE: 'STABLE',
    VOLATILE: 'VOLATILE',
};

export const TREND_DIRECTIONS_DISPLAY = {
    IMPROVING: 'Improving',
    DECLINING: 'Declining',
    STABLE: 'Stable',
    VOLATILE: 'Volatile',
};

// ============================================
// 16. VALIDATION STATUS CONSTANTS
// ============================================

export const VALIDATION_STATUS = {
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    ESCALATED: 'ESCALATED',
};

// ============================================
// 17. ESCALATION STATUS CONSTANTS
// ============================================

export const ESCALATION_STATUS = {
    PENDING: 'PENDING',
    REVIEWING: 'REVIEWING',
    RESOLVED: 'RESOLVED',
    CLOSED: 'CLOSED',
};

export const ESCALATION_STATUS_DISPLAY = {
    PENDING: 'Pending',
    REVIEWING: 'Under Review',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
};

// ============================================
// 18. REJECTION REASON CATEGORIES
// ============================================

export const REJECTION_REASON_CATEGORIES = {
    DATA_QUALITY: 'DATA_QUALITY',
    MISSING_EVIDENCE: 'MISSING_EVIDENCE',
    CALCULATION_ERROR: 'CALCULATION_ERROR',
    TIMING: 'TIMING',
    OTHER: 'OTHER',
};

export const REJECTION_REASON_CATEGORIES_DISPLAY = {
    DATA_QUALITY: 'Data Quality',
    MISSING_EVIDENCE: 'Missing Evidence',
    CALCULATION_ERROR: 'Calculation Error',
    TIMING: 'Timing Issue',
    OTHER: 'Other',
};

// ============================================
// 19. DEPENDENCY TYPES
// ============================================

export const DEPENDENCY_TYPES = {
    DRIVER: 'DRIVER',
    OUTCOME: 'OUTCOME',
    CORRELATED: 'CORRELATED',
    CONSTRAINT: 'CONSTRAINT',
};

export const DEPENDENCY_TYPES_DISPLAY = {
    DRIVER: 'Driver (affects)',
    OUTCOME: 'Outcome (affected by)',
    CORRELATED: 'Correlated',
    CONSTRAINT: 'Constraint',
};

// ============================================
// 20. LINKAGE TYPES
// ============================================

export const LINKAGE_TYPES = {
    PRIMARY: 'PRIMARY',
    SECONDARY: 'SECONDARY',
    INDICATOR: 'INDICATOR',
    LAGGING: 'LAGGING',
};

export const LINKAGE_TYPES_DISPLAY = {
    PRIMARY: 'Primary Driver',
    SECONDARY: 'Secondary Driver',
    INDICATOR: 'Leading Indicator',
    LAGGING: 'Lagging Indicator',
};

// ============================================
// 21. CASCADE RULE TYPES
// ============================================

export const CASCADE_RULE_TYPES = {
    EQUAL_SPLIT: 'EQUAL_SPLIT',
    WEIGHTED: 'WEIGHTED',
    WEIGHTED_BY_BUDGET: 'WEIGHTED_BY_BUDGET',
    CUSTOM: 'CUSTOM',
};

export const CASCADE_RULE_TYPES_DISPLAY = {
    EQUAL_SPLIT: 'Equal Split',
    WEIGHTED: 'Weighted by Headcount',
    WEIGHTED_BY_BUDGET: 'Weighted by Budget',
    CUSTOM: 'Custom',
};

// ============================================
// 22. PHASING STRATEGIES
// ============================================

export const PHASING_STRATEGIES = {
    EQUAL_SPLIT: 'equal_split',
    LINEAR_INCREASING: 'linear_increasing',
    LINEAR_DECREASING: 'linear_decreasing',
    FRONT_LOADED: 'front_loaded',
    BACK_LOADED: 'back_loaded',
    SEASONAL: 'seasonal',
    CUSTOM: 'custom',
};

export const PHASING_STRATEGIES_DISPLAY = {
    equal_split: 'Equal Split across months',
    linear_increasing: 'Linear Increasing',
    linear_decreasing: 'Linear Decreasing',
    front_loaded: 'Front Loaded (Q1 heavy)',
    back_loaded: 'Back Loaded (Q4 heavy)',
    seasonal: 'Seasonal Pattern',
    custom: 'Custom Distribution',
};

// ============================================
// 23. MONTH CONSTANTS
// ============================================

export const MONTHS = [
    { value: 1, label: 'January', short: 'Jan' },
    { value: 2, label: 'February', short: 'Feb' },
    { value: 3, label: 'March', short: 'Mar' },
    { value: 4, label: 'April', short: 'Apr' },
    { value: 5, label: 'May', short: 'May' },
    { value: 6, label: 'June', short: 'Jun' },
    { value: 7, label: 'July', short: 'Jul' },
    { value: 8, label: 'August', short: 'Aug' },
    { value: 9, label: 'September', short: 'Sep' },
    { value: 10, label: 'October', short: 'Oct' },
    { value: 11, label: 'November', short: 'Nov' },
    { value: 12, label: 'December', short: 'Dec' },
];

// ============================================
// 24. DEFAULT VALUES
// ============================================

export const DEFAULT_WEIGHT = 100;
export const DEFAULT_GREEN_THRESHOLD = 90;
export const DEFAULT_YELLOW_THRESHOLD = 50;
export const DEFAULT_CONSECUTIVE_RED_ALERT = 2;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_BULK_SIZE = 1000;

// ============================================
// 25. CACHE TTL CONSTANTS (in seconds)
// ============================================

export const KPI_CACHE_TTL = {
    SECTORS: 3600,
    FRAMEWORKS: 3600,
    CATEGORIES: 3600,
    TEMPLATES: 3600,
    KPIS: 300,
    TARGETS: 300,
    SCORES: 60,
    DASHBOARD: 60,
    ANALYTICS: 300,
};

// ============================================
// 26. EXPORT FORMATS
// ============================================

export const EXPORT_FORMATS = {
    CSV: 'csv',
    EXCEL: 'excel',
    PDF: 'pdf',
};

export const EXPORT_FORMATS_DISPLAY = {
    csv: 'CSV',
    excel: 'Excel',
    pdf: 'PDF',
};

// ============================================
// 27. REPORT TYPES
// ============================================

export const REPORT_TYPES = {
    KPI_PERFORMANCE: 'kpi_performance',
    DEPARTMENT_COMPARISON: 'department_comparison',
    TREND_ANALYSIS: 'trend_analysis',
};

export const REPORT_TYPES_DISPLAY = {
    kpi_performance: 'KPI Performance Report',
    department_comparison: 'Department Comparison',
    trend_analysis: 'Trend Analysis Report',
};

// ============================================
// 28. CALCULATION STATUS
// ============================================

export const CALCULATION_STATUS = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
};

export const CALCULATION_STATUS_DISPLAY = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
};

// ============================================
// 29. NOTIFICATION TYPES
// ============================================

export const KPI_NOTIFICATION_TYPES = {
    KPI_APPROVED: 'kpi_approved',
    KPI_REJECTED: 'kpi_rejected',
    KPI_SUBMITTED: 'kpi_submitted',
    VALIDATION_PENDING: 'validation_pending',
    VALIDATION_OVERDUE: 'validation_overdue',
    RED_ALERT: 'red_alert',
    TARGET_ASSIGNED: 'target_assigned',
    TARGET_CASCADED: 'target_cascaded',
    ESCALATION_CREATED: 'escalation_created',
    ESCALATION_RESOLVED: 'escalation_resolved',
    REPORT_READY: 'report_ready',
    SYSTEM_ALERT: 'system_alert',
};

export const KPI_NOTIFICATION_TYPES_DISPLAY = {
    kpi_approved: 'KPI Entry Approved',
    kpi_rejected: 'KPI Entry Rejected',
    kpi_submitted: 'KPI Entry Submitted',
    validation_pending: 'Validation Pending',
    validation_overdue: 'Validation Overdue',
    red_alert: 'Red Alert',
    target_assigned: 'Target Assigned',
    target_cascaded: 'Target Cascaded',
    escalation_created: 'Escalation Created',
    escalation_resolved: 'Escalation Resolved',
    report_ready: 'Report Ready',
    system_alert: 'System Alert',
};

// ============================================
// 30. STORAGE KEYS
// ============================================

export const KPI_STORAGE_KEYS = {
    SECTORS_CACHE: 'kpi_sectors_cache',
    FRAMEWORKS_CACHE: 'kpi_frameworks_cache',
    CATEGORIES_CACHE: 'kpi_categories_cache',
    TEMPLATES_CACHE: 'kpi_templates_cache',
    KPIS_CACHE: 'kpi_kpis_cache',
    DASHBOARD_FILTERS: 'kpi_dashboard_filters',
    REPORT_FILTERS: 'kpi_report_filters',
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default {
    KPI_TYPES,
    KPI_TYPES_DISPLAY,
    CALCULATION_LOGIC,
    CALCULATION_LOGIC_DISPLAY,
    MEASURE_TYPES,
    MEASURE_TYPES_DISPLAY,
    FRAMEWORK_STATUS,
    FRAMEWORK_STATUS_DISPLAY,
    FRAMEWORK_STATUS_COLORS,
    CATEGORY_TYPES,
    CATEGORY_TYPES_DISPLAY,
    CATEGORY_TYPE_COLORS,
    SECTOR_TYPES,
    SECTOR_TYPES_DISPLAY,
    TEMPLATE_DIFFICULTY,
    TEMPLATE_DIFFICULTY_DISPLAY,
    ACTUAL_STATUS,
    ACTUAL_STATUS_DISPLAY,
    ACTUAL_STATUS_COLORS,
    ADJUSTMENT_STATUS,
    ADJUSTMENT_STATUS_DISPLAY,
    EVIDENCE_TYPES,
    EVIDENCE_TYPES_DISPLAY,
    TRAFFIC_LIGHT_STATUS,
    TRAFFIC_LIGHT_STATUS_DISPLAY,
    TRAFFIC_LIGHT_COLORS,
    TRAFFIC_LIGHT_EMOJIS,
    AGGREGATION_LEVELS,
    AGGREGATION_LEVELS_DISPLAY,
    HEALTH_STATUS,
    HEALTH_STATUS_DISPLAY,
    HEALTH_STATUS_COLORS,
    RISK_LEVELS,
    RISK_LEVELS_DISPLAY,
    RISK_LEVELS_COLORS,
    TREND_DIRECTIONS,
    TREND_DIRECTIONS_DISPLAY,
    VALIDATION_STATUS,
    ESCALATION_STATUS,
    ESCALATION_STATUS_DISPLAY,
    REJECTION_REASON_CATEGORIES,
    REJECTION_REASON_CATEGORIES_DISPLAY,
    DEPENDENCY_TYPES,
    DEPENDENCY_TYPES_DISPLAY,
    LINKAGE_TYPES,
    LINKAGE_TYPES_DISPLAY,
    CASCADE_RULE_TYPES,
    CASCADE_RULE_TYPES_DISPLAY,
    PHASING_STRATEGIES,
    PHASING_STRATEGIES_DISPLAY,
    MONTHS,
    DEFAULT_WEIGHT,
    DEFAULT_GREEN_THRESHOLD,
    DEFAULT_YELLOW_THRESHOLD,
    DEFAULT_CONSECUTIVE_RED_ALERT,
    DEFAULT_PAGE_SIZE,
    MAX_BULK_SIZE,
    KPI_CACHE_TTL,
    EXPORT_FORMATS,
    EXPORT_FORMATS_DISPLAY,
    REPORT_TYPES,
    REPORT_TYPES_DISPLAY,
    CALCULATION_STATUS,
    CALCULATION_STATUS_DISPLAY,
    KPI_NOTIFICATION_TYPES,
    KPI_NOTIFICATION_TYPES_DISPLAY,
    KPI_STORAGE_KEYS,
};