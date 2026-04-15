/**
 * Organisation Permissions
 * Permission checking utilities for organisation features
 */

import { USER_ROLES } from './constants';

// ============================================================
// Role-Based Permissions
// ============================================================

/**
 * Check if user can manage organisation settings
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageOrganisationSettings = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.DASHBOARD_CHAMPION].includes(user?.role);
};

/**
 * Check if user can manage billing
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageBilling = (user) => {
  return [USER_ROLES.ADMIN].includes(user?.role);
};

/**
 * Check if user can manage users
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageUsers = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user?.role);
};

/**
 * Check if user can invite users
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canInviteUsers = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user?.role);
};

/**
 * Check if user can manage roles
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageRoles = (user) => {
  return [USER_ROLES.ADMIN].includes(user?.role);
};

/**
 * Check if user can manage departments
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageDepartments = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user?.role);
};

/**
 * Check if user can manage teams
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageTeams = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user?.role);
};

/**
 * Check if user can manage positions
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManagePositions = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user?.role);
};

/**
 * Check if user can manage domains
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageDomains = (user) => {
  return [USER_ROLES.ADMIN].includes(user?.role);
};

/**
 * Check if user can manage branding
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageBranding = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.DASHBOARD_CHAMPION].includes(user?.role);
};

/**
 * Check if user can view audit logs
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canViewAuditLogs = (user) => {
  return [USER_ROLES.ADMIN].includes(user?.role);
};

/**
 * Check if user can manage KPIs
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageKPIs = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.DASHBOARD_CHAMPION].includes(user?.role);
};

/**
 * Check if user can approve KPIs
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canApproveKPIs = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.DASHBOARD_CHAMPION].includes(user?.role);
};

/**
 * Check if user can view reports
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canViewReports = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.DASHBOARD_CHAMPION, USER_ROLES.VIEWER].includes(user?.role);
};

/**
 * Check if user can export data
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canExportData = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.DASHBOARD_CHAMPION].includes(user?.role);
};

/**
 * Check if user can import data
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canImportData = (user) => {
  return [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(user?.role);
};

/**
 * Check if user can manage API tokens
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageApiTokens = (user) => {
  return [USER_ROLES.ADMIN].includes(user?.role);
};

/**
 * Check if user can manage webhooks
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canManageWebhooks = (user) => {
  return [USER_ROLES.ADMIN].includes(user?.role);
};

// ============================================================
// Feature-Based Permissions
// ============================================================

/**
 * Check if feature is enabled for organisation
 * @param {Object} organisation - Organisation object
 * @param {string} featureName - Feature name
 * @returns {boolean}
 */
export const isFeatureEnabled = (organisation, featureName) => {
  if (!organisation?.features) return false;
  return organisation.features[featureName] === true;
};

/**
 * Check if organisation can access advanced reports
 * @param {Object} organisation - Organisation object
 * @returns {boolean}
 */
export const hasAdvancedReports = (organisation) => {
  return isFeatureEnabled(organisation, 'advanced_reports');
};

/**
 * Check if organisation can use API
 * @param {Object} organisation - Organisation object
 * @returns {boolean}
 */
export const hasApiAccess = (organisation) => {
  return isFeatureEnabled(organisation, 'api_access');
};

/**
 * Check if organisation has SSO
 * @param {Object} organisation - Organisation object
 * @returns {boolean}
 */
export const hasSSO = (organisation) => {
  return isFeatureEnabled(organisation, 'sso');
};

/**
 * Check if organisation has audit logs
 * @param {Object} organisation - Organisation object
 * @returns {boolean}
 */
export const hasAuditLogs = (organisation) => {
  return isFeatureEnabled(organisation, 'audit_logs');
};

/**
 * Check if organisation has white labeling
 * @param {Object} organisation - Organisation object
 * @returns {boolean}
 */
export const hasWhiteLabel = (organisation) => {
  return isFeatureEnabled(organisation, 'white_label');
};

// ============================================================
// Subscription-Based Permissions
// ============================================================

/**
 * Check if organisation has active subscription
 * @param {Object} subscription - Subscription object
 * @returns {boolean}
 */
export const hasActiveSubscription = (subscription) => {
  return subscription?.status === 'active' || subscription?.status === 'trialing';
};

/**
 * Check if subscription is expiring soon
 * @param {Object} subscription - Subscription object
 * @param {number} daysThreshold - Days threshold (default: 30)
 * @returns {boolean}
 */
export const isSubscriptionExpiringSoon = (subscription, daysThreshold = 30) => {
  if (!subscription?.end_date) return false;
  const daysLeft = subscription.days_until_expiry;
  return daysLeft !== null && daysLeft <= daysThreshold && daysLeft > 0;
};

/**
 * Check if organisation can add more users
 * @param {Object} subscription - Subscription object
 * @param {number} currentUsers - Current user count
 * @returns {boolean}
 */
export const canAddMoreUsers = (subscription, currentUsers) => {
  if (!subscription?.plan?.max_users) return true;
  return currentUsers < subscription.plan.max_users;
};