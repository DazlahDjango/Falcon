/**
 * Organisation Constants
 * All constant values used across the organisation module
 */

// ============================================================
// Organisation Types
// ============================================================

export const SECTOR_TYPES = {
  COMMERCIAL: 'commercial',
  NGO: 'ngo',
  PUBLIC: 'public',
  CONSULTING: 'consulting',
  EDUCATION: 'education',
  HEALTHCARE: 'healthcare',
  TECHNOLOGY: 'technology',
  MANUFACTURING: 'manufacturing',
  RETAIL: 'retail',
  OTHER: 'other',
};

export const SECTOR_LABELS = {
  [SECTOR_TYPES.COMMERCIAL]: 'Commercial / Corporate',
  [SECTOR_TYPES.NGO]: 'NGO / Non-Profit',
  [SECTOR_TYPES.PUBLIC]: 'Public Sector / Government',
  [SECTOR_TYPES.CONSULTING]: 'Consulting / Professional Services',
  [SECTOR_TYPES.EDUCATION]: 'Education',
  [SECTOR_TYPES.HEALTHCARE]: 'Healthcare',
  [SECTOR_TYPES.TECHNOLOGY]: 'Technology / IT',
  [SECTOR_TYPES.MANUFACTURING]: 'Manufacturing',
  [SECTOR_TYPES.RETAIL]: 'Retail / E-commerce',
  [SECTOR_TYPES.OTHER]: 'Other',
};

export const SECTOR_ICONS = {
  [SECTOR_TYPES.COMMERCIAL]: '🏢',
  [SECTOR_TYPES.NGO]: '🌍',
  [SECTOR_TYPES.PUBLIC]: '🏛️',
  [SECTOR_TYPES.CONSULTING]: '💼',
  [SECTOR_TYPES.EDUCATION]: '📚',
  [SECTOR_TYPES.HEALTHCARE]: '🏥',
  [SECTOR_TYPES.TECHNOLOGY]: '💻',
  [SECTOR_TYPES.MANUFACTURING]: '🏭',
  [SECTOR_TYPES.RETAIL]: '🛍️',
  [SECTOR_TYPES.OTHER]: '📋',
};

// ============================================================
// Organisation Status
// ============================================================

export const ORGANISATION_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  ARCHIVED: 'archived',
  TRIAL: 'trial',
  EXPIRED: 'expired',
};

export const STATUS_LABELS = {
  [ORGANISATION_STATUS.ACTIVE]: 'Active',
  [ORGANISATION_STATUS.SUSPENDED]: 'Suspended',
  [ORGANISATION_STATUS.PENDING]: 'Pending Setup',
  [ORGANISATION_STATUS.ARCHIVED]: 'Archived',
  [ORGANISATION_STATUS.TRIAL]: 'Trial',
  [ORGANISATION_STATUS.EXPIRED]: 'Expired',
};

export const STATUS_COLORS = {
  [ORGANISATION_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [ORGANISATION_STATUS.SUSPENDED]: 'bg-red-100 text-red-800',
  [ORGANISATION_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ORGANISATION_STATUS.ARCHIVED]: 'bg-gray-100 text-gray-800',
  [ORGANISATION_STATUS.TRIAL]: 'bg-blue-100 text-blue-800',
  [ORGANISATION_STATUS.EXPIRED]: 'bg-gray-100 text-gray-800',
};

// ============================================================
// Subscription Plans
// ============================================================

export const PLAN_CODES = {
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
};

export const PLAN_NAMES = {
  [PLAN_CODES.BASIC]: 'Basic',
  [PLAN_CODES.PROFESSIONAL]: 'Professional',
  [PLAN_CODES.ENTERPRISE]: 'Enterprise',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const SUBSCRIPTION_STATUS_LABELS = {
  [SUBSCRIPTION_STATUS.ACTIVE]: 'Active',
  [SUBSCRIPTION_STATUS.TRIALING]: 'Trial',
  [SUBSCRIPTION_STATUS.PAST_DUE]: 'Past Due',
  [SUBSCRIPTION_STATUS.CANCELLED]: 'Cancelled',
  [SUBSCRIPTION_STATUS.EXPIRED]: 'Expired',
};

// ============================================================
// Contact Types
// ============================================================

export const CONTACT_TYPES = {
  PRIMARY: 'primary',
  BILLING: 'billing',
  TECHNICAL: 'technical',
  ADMIN: 'admin',
  LEGAL: 'legal',
  SUPPORT: 'support',
};

export const CONTACT_TYPE_LABELS = {
  [CONTACT_TYPES.PRIMARY]: 'Primary Contact',
  [CONTACT_TYPES.BILLING]: 'Billing Contact',
  [CONTACT_TYPES.TECHNICAL]: 'Technical Contact',
  [CONTACT_TYPES.ADMIN]: 'Administrative',
  [CONTACT_TYPES.LEGAL]: 'Legal Contact',
  [CONTACT_TYPES.SUPPORT]: 'Support Contact',
};

export const CONTACT_TYPE_ICONS = {
  [CONTACT_TYPES.PRIMARY]: '⭐',
  [CONTACT_TYPES.BILLING]: '💰',
  [CONTACT_TYPES.TECHNICAL]: '🔧',
  [CONTACT_TYPES.ADMIN]: '👑',
  [CONTACT_TYPES.LEGAL]: '⚖️',
  [CONTACT_TYPES.SUPPORT]: '🆘',
};

// ============================================================
// Domain Status
// ============================================================

export const DOMAIN_VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
};

export const SSL_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  EXPIRED: 'expired',
  FAILED: 'failed',
  ISSUING: 'issuing',
};

// ============================================================
// Hierarchy Levels
// ============================================================

export const HIERARCHY_LEVELS = {
  CEO: 1,
  EXECUTIVE: 2,
  DIRECTOR: 3,
  HEAD: 4,
  MANAGER: 5,
  SUPERVISOR: 6,
  STAFF: 7,
  INTERN: 8,
};

export const HIERARCHY_LEVEL_LABELS = {
  [HIERARCHY_LEVELS.CEO]: 'CEO / Executive Director',
  [HIERARCHY_LEVELS.EXECUTIVE]: 'Executive / C-Suite',
  [HIERARCHY_LEVELS.DIRECTOR]: 'Director',
  [HIERARCHY_LEVELS.HEAD]: 'Head of Department',
  [HIERARCHY_LEVELS.MANAGER]: 'Manager',
  [HIERARCHY_LEVELS.SUPERVISOR]: 'Supervisor',
  [HIERARCHY_LEVELS.STAFF]: 'Staff',
  [HIERARCHY_LEVELS.INTERN]: 'Intern / Trainee',
};

// ============================================================
// KPI Status
// ============================================================

export const KPI_STATUS = {
  ON_TRACK: 'on_track',
  AT_RISK: 'at_risk',
  OFF_TRACK: 'off_track',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const KPI_STATUS_LABELS = {
  [KPI_STATUS.ON_TRACK]: 'On Track',
  [KPI_STATUS.AT_RISK]: 'At Risk',
  [KPI_STATUS.OFF_TRACK]: 'Off Track',
  [KPI_STATUS.PENDING]: 'Pending',
  [KPI_STATUS.APPROVED]: 'Approved',
  [KPI_STATUS.REJECTED]: 'Rejected',
};

export const KPI_STATUS_COLORS = {
  [KPI_STATUS.ON_TRACK]: 'bg-green-100 text-green-800',
  [KPI_STATUS.AT_RISK]: 'bg-yellow-100 text-yellow-800',
  [KPI_STATUS.OFF_TRACK]: 'bg-red-100 text-red-800',
  [KPI_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [KPI_STATUS.APPROVED]: 'bg-green-100 text-green-800',
  [KPI_STATUS.REJECTED]: 'bg-red-100 text-red-800',
};

// ============================================================
// User Roles
// ============================================================

export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
  DASHBOARD_CHAMPION: 'dashboard_champion',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Admin',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.STAFF]: 'Staff',
  [USER_ROLES.VIEWER]: 'Viewer',
  [USER_ROLES.DASHBOARD_CHAMPION]: 'Dashboard Champion',
};

export const USER_ROLE_COLORS = {
  [USER_ROLES.ADMIN]: 'bg-purple-100 text-purple-800',
  [USER_ROLES.MANAGER]: 'bg-blue-100 text-blue-800',
  [USER_ROLES.STAFF]: 'bg-gray-100 text-gray-800',
  [USER_ROLES.VIEWER]: 'bg-green-100 text-green-800',
  [USER_ROLES.DASHBOARD_CHAMPION]: 'bg-yellow-100 text-yellow-800',
};

// ============================================================
// Industry Types
// ============================================================

export const INDUSTRY_TYPES = {
  TECH: 'TECH',
  FINANCE: 'FINANCE',
  HEALTH: 'HEALTH',
  EDU: 'EDU',
  MANUF: 'MANUF',
  RETAIL: 'RETAIL',
  GOVT: 'GOVT',
  NONPROFIT: 'NONPROFIT',
  OTHER: 'OTHER',
};

export const INDUSTRY_LABELS = {
  [INDUSTRY_TYPES.TECH]: 'Technology',
  [INDUSTRY_TYPES.FINANCE]: 'Finance',
  [INDUSTRY_TYPES.HEALTH]: 'Healthcare',
  [INDUSTRY_TYPES.EDU]: 'Education',
  [INDUSTRY_TYPES.MANUF]: 'Manufacturing',
  [INDUSTRY_TYPES.RETAIL]: 'Retail',
  [INDUSTRY_TYPES.GOVT]: 'Government',
  [INDUSTRY_TYPES.NONPROFIT]: 'Non-Profit',
  [INDUSTRY_TYPES.OTHER]: 'Other',
};

// ============================================================
// Company Size Options
// ============================================================

export const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

// ============================================================
// Review Cycle Options
// ============================================================

export const REVIEW_CYCLE_OPTIONS = [
  { value: 'annual', label: 'Annual' },
  { value: 'biannual', label: 'Bi-Annual (Twice a year)' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'monthly', label: 'Monthly' },
];

// ============================================================
// Date Format Options
// ============================================================

export const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY', example: '31-12-2024' },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY', example: '12-31-2024' },
];

// ============================================================
// Timezone Options
// ============================================================

export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC (Universal Time)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
];

// ============================================================
// Language Options
// ============================================================

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'de', label: 'German', flag: '🇩🇪' },
  { value: 'it', label: 'Italian', flag: '🇮🇹' },
  { value: 'pt', label: 'Portuguese', flag: '🇵🇹' },
  { value: 'nl', label: 'Dutch', flag: '🇳🇱' },
  { value: 'sw', label: 'Swahili', flag: '🇰🇪' },
  { value: 'ar', label: 'Arabic', flag: '🇸🇦' },
  { value: 'zh', label: 'Chinese', flag: '🇨🇳' },
  { value: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { value: 'ko', label: 'Korean', flag: '🇰🇷' },
];

// ============================================================
// Currency Options
// ============================================================

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'KES', label: 'KES - Kenyan Shilling', symbol: 'KSh' },
  { value: 'NGN', label: 'NGN - Nigerian Naira', symbol: '₦' },
  { value: 'ZAR', label: 'ZAR - South African Rand', symbol: 'R' },
  { value: 'AED', label: 'AED - UAE Dirham', symbol: 'د.إ' },
  { value: 'SAR', label: 'SAR - Saudi Riyal', symbol: '﷼' },
  { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
  { value: 'CNY', label: 'CNY - Chinese Yuan', symbol: '¥' },
  { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
  { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { value: 'CHF', label: 'CHF - Swiss Franc', symbol: 'Fr' },
];