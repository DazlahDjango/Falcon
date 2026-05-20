// frontend/src/types/dashboard/clientAdmin.types.js
/**
 * Client Admin Dashboard type definitions
 */

// Client Admin Dashboard Data Types
/**
 * @typedef {Object} ClientAdminDashboardData
 * @property {TenantInfo} tenantInfo - Tenant information
 * @property {TenantOverview} tenantOverview - Tenant overview metrics
 * @property {ComplianceStatus} complianceStatus - Compliance metrics
 * @property {PendingApproval[]} pendingApprovals - Pending approval list
 * @property {MissingDataAlert[]} missingDataAlerts - Missing data alerts
 * @property {KpiBreakdown} kpiPerformance - KPI breakdown
 * @property {UserActivity} userActivity - User activity metrics
 * @property {string} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} TenantInfo
 * @property {string} id - Tenant ID
 * @property {string} name - Tenant name
 * @property {string} subscriptionStatus - Subscription status
 * @property {string} subscriptionPlan - Subscription plan
 */

/**
 * @typedef {Object} TenantOverview
 * @property {number} totalUsers - Total users
 * @property {number} activeUsers - Active users (last 30 days)
 * @property {number} userEngagement - User engagement percentage
 * @property {number} totalKpis - Total KPIs
 * @property {number} greenKpis - Green KPIs count
 * @property {number} redKpis - Red KPIs count
 * @property {number} healthScore - Overall health score
 */

/**
 * @typedef {Object} ComplianceStatus
 * @property {number} dataSubmissionRate - Data submission rate percentage
 * @property {number} reviewCompletionRate - Review completion rate percentage
 * @property {number} pendingReviews - Number of pending reviews
 * @property {number} overdueSubmissions - Number of overdue submissions
 * @property {number} usersMissingData - Users with missing data
 */

/**
 * @typedef {Object} PendingApproval
 * @property {string} id - Submission ID
 * @property {string} userName - Submitter name
 * @property {string} kpiName - KPI name
 * @property {number} actualValue - Submitted actual value
 * @property {number} targetValue - Target value
 * @property {string} unit - Unit of measurement
 * @property {string} submittedAt - Submission timestamp
 * @property {number} pendingDays - Days pending
 * @property {string} comments - Additional comments
 */

/**
 * @typedef {Object} MissingDataAlert
 * @property {string} userId - User ID
 * @property {string} userName - User name
 * @property {string} kpiId - KPI ID
 * @property {string} kpiName - KPI name
 * @property {string} dueDate - Due date
 */

/**
 * @typedef {Object} KpiBreakdown
 * @property {Array<DepartmentKpiBreakdown>} byDepartment - Breakdown by department
 * @property {Array<CategoryKpiBreakdown>} byCategory - Breakdown by category
 */

/**
 * @typedef {Object} DepartmentKpiBreakdown
 * @property {string} department - Department name
 * @property {number} kpiCount - Total KPIs
 * @property {number} greenCount - Green KPIs count
 * @property {number} yellowCount - Yellow KPIs count
 * @property {number} redCount - Red KPIs count
 * @property {number} averageScore - Average score
 */

/**
 * @typedef {Object} CategoryKpiBreakdown
 * @property {string} category - Category name
 * @property {number} count - KPI count
 * @property {number} avgScore - Average score
 */

/**
 * @typedef {Object} UserActivity
 * @property {number} activeUsers30d - Active users in last 30 days
 * @property {number} inactiveUsers - Inactive users
 * @property {number} newUsers30d - New users in last 30 days
 * @property {number} totalLogins30d - Total logins in last 30 days
 */

// Client Admin Settings Types
/**
 * @typedef {Object} TenantSettings
 * @property {boolean} kpiValidationRequired - Whether KPI validation is required
 * @property {boolean} supervisorApprovalRequired - Whether supervisor approval is required
 * @property {boolean} mfaRequired - Whether MFA is required
 * @property {number} sessionTimeout - Session timeout in minutes
 * @property {string} defaultLanguage - Default language
 * @property {string} defaultTimezone - Default timezone
 * @property {string} dateFormat - Date format
 * @property {string} numberFormat - Number format (comma, dot)
 */