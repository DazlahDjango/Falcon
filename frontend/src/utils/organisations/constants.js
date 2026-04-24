// Organisation Constants
// Centralised constants for organisation-related features

export const ORGANISATION_ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLIENT_ADMIN: 'client_admin',
  DASHBOARD_CHAMPION: 'dashboard_champion',
  MANAGER: 'manager',
  STAFF: 'staff',
};

export const ORGANISATION_PERMISSIONS = {
  // Organisation management
  MANAGE_ORGANISATION: 'manage_organisation',
  VIEW_ORGANISATION: 'view_organisation',

  // User management
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  INVITE_USERS: 'invite_users',

  // Department management
  MANAGE_DEPARTMENTS: 'manage_departments',
  VIEW_DEPARTMENTS: 'view_departments',

  // Team management
  MANAGE_TEAMS: 'manage_teams',
  VIEW_TEAMS: 'view_teams',

  // Position management
  MANAGE_POSITIONS: 'manage_positions',
  VIEW_POSITIONS: 'view_positions',

  // KPI management
  MANAGE_KPIS: 'manage_kpis',
  VIEW_KPIS: 'view_kpis',

  // Reporting
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',

  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_SETTINGS: 'view_settings',

  // Branding
  MANAGE_BRANDING: 'manage_branding',
  VIEW_BRANDING: 'view_branding',

  // Billing
  MANAGE_BILLING: 'manage_billing',
  VIEW_BILLING: 'view_billing',

  // API access
  MANAGE_API_TOKENS: 'manage_api_tokens',
  VIEW_API_TOKENS: 'view_api_tokens',

  // Audit
  VIEW_AUDIT_LOGS: 'view_audit_logs',

  // Approvals
  MANAGE_APPROVALS: 'manage_approvals',
  VIEW_APPROVALS: 'view_approvals',
};

export const ORGANISATION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIALING: 'trialing',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  UNPAID: 'unpaid',
};

export const SUBSCRIPTION_PLANS = {
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
  CUSTOM: 'custom',
};

export const CONTACT_TYPES = {
  BILLING: 'billing',
  TECHNICAL: 'technical',
  PRIMARY: 'primary',
  EMERGENCY: 'emergency',
};

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const KPI_STATUS = {
  ON_TRACK: 'on_track',
  AT_RISK: 'at_risk',
  OFF_TRACK: 'off_track',
};

export const DEPARTMENT_NESTING_LEVELS = {
  MAX_DEPTH: 3,
  MIN_DEPTH: 1,
};

export const TEAM_SIZE_LIMITS = {
  MIN_MEMBERS: 1,
  MAX_MEMBERS: 50,
  RECOMMENDED_MAX: 20,
};

export const API_TOKEN_PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  ADMIN: 'admin',
};

export const EXPORT_FORMATS = {
  PDF: 'pdf',
  CSV: 'csv',
  EXCEL: 'xlsx',
  JSON: 'json',
};

export const IMPORT_TYPES = {
  USERS: 'users',
  DEPARTMENTS: 'departments',
  TEAMS: 'teams',
  POSITIONS: 'positions',
  KPIS: 'kpis',
};

export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  IN_APP: 'in_app',
  SMS: 'sms',
  WEBHOOK: 'webhook',
};

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

export const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'KES', label: 'KES - Kenyan Shilling', symbol: 'KSh' },
  { value: 'NGN', label: 'NGN - Nigerian Naira', symbol: '₦' },
  { value: 'ZAR', label: 'ZAR - South African Rand', symbol: 'R' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
];

export const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Kolkata', label: 'India' },
  { value: 'Africa/Nairobi', label: 'Nairobi' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

export default {
  ORGANISATION_ROLES,
  ORGANISATION_PERMISSIONS,
  ORGANISATION_STATUS,
  SUBSCRIPTION_STATUS,
  SUBSCRIPTION_PLANS,
  CONTACT_TYPES,
  APPROVAL_STATUS,
  KPI_STATUS,
  DEPARTMENT_NESTING_LEVELS,
  TEAM_SIZE_LIMITS,
  API_TOKEN_PERMISSIONS,
  EXPORT_FORMATS,
  IMPORT_TYPES,
  NOTIFICATION_TYPES,
  THEME_MODES,
  CURRENCIES,
  TIMEZONES,
};