// frontend/src/types/dashboard/superAdmin.types.js
/**
 * Super Admin Dashboard type definitions
 */

// Super Admin Dashboard Data Types
/**
 * @typedef {Object} SuperAdminDashboardData
 * @property {PlatformOverview} platformOverview - Platform-wide metrics
 * @property {TenantSummary[]} tenantSummaries - List of tenant summaries
 * @property {SystemHealth} systemHealth - System health status
 * @property {SubscriptionAlert[]} subscriptionAlerts - Subscription alerts
 * @property {PlatformMetrics} platformMetrics - Platform usage metrics
 * @property {string} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} PlatformOverview
 * @property {number} totalTenants - Total number of tenants
 * @property {number} activeTenants - Active tenants count
 * @property {number} trialTenants - Trial tenants count
 * @property {Object} totalRevenue - Revenue summary
 * @property {number} totalRevenue.monthlyRecurring - Monthly recurring revenue
 * @property {number} totalRevenue.annualRecurring - Annual recurring revenue
 * @property {number} totalRevenue.totalActiveSubscriptions - Active subscriptions count
 */

/**
 * @typedef {Object} TenantSummary
 * @property {string} clientId - Client/tenant ID
 * @property {string} clientName - Client name
 * @property {string} subscriptionStatus - Subscription status
 * @property {string} subscriptionPlan - Subscription plan
 * @property {string} subscriptionExpiresAt - Subscription expiry date
 * @property {number} totalUsers - Total users
 * @property {number} activeUsers - Active users
 * @property {number} totalKpis - Total KPIs
 * @property {number} kpiGreenCount - Green KPIs count
 * @property {number} kpiYellowCount - Yellow KPIs count
 * @property {number} kpiRedCount - Red KPIs count
 * @property {number} avgIndividualScore - Average individual score
 * @property {number} dataSubmissionRate - Data submission rate
 * @property {number} healthScore - Tenant health score
 * @property {number} daysUntilExpiry - Days until subscription expiry
 */

/**
 * @typedef {Object} SystemHealth
 * @property {string} apiStatus - API status (operational, degraded, down)
 * @property {string} databaseStatus - Database status
 * @property {string} cacheStatus - Cache service status
 * @property {string} websocketStatus - WebSocket status
 * @property {string} lastIncident - Last incident description
 * @property {number} uptimePercentage - System uptime percentage
 */

/**
 * @typedef {Object} SubscriptionAlert
 * @property {string} tenantId - Tenant ID
 * @property {string} tenantName - Tenant name
 * @property {string} alertType - Alert type (subscription_expiring, payment_failed)
 * @property {string} expiresAt - Expiry date
 * @property {number} daysRemaining - Days remaining
 * @property {string} severity - Severity (critical, warning)
 */

/**
 * @typedef {Object} PlatformMetrics
 * @property {number} totalUsersPlatform - Total users across platform
 * @property {number} totalKpisPlatform - Total KPIs across platform
 * @property {number} submissionsLast30d - Submissions in last 30 days
 * @property {number} avgTenantsPerDay - Average new tenants per day
 * @property {Object} revenueTrend - Revenue trend data
 */

/**
 * @typedef {Object} BillingOverview
 * @property {number} monthlyRecurring - Monthly recurring revenue
 * @property {number} annualRecurring - Annual recurring revenue
 * @property {number} totalActiveSubscriptions - Active subscriptions count
 * @property {string} growthTrend - Growth trend (up, down)
 * @property {number} growthPercentage - Growth percentage
 */

// Super Admin Filter Types
/**
 * @typedef {Object} TenantFilter
 * @property {string} subscriptionStatus - Filter by subscription status
 * @property {string} subscriptionPlan - Filter by subscription plan
 * @property {string} search - Search by tenant name
 * @property {number} minHealthScore - Minimum health score
 * @property {number} maxHealthScore - Maximum health score
 * @property {boolean} hasRedKpis - Filter tenants with red KPIs
 * @property {boolean} lowSubmissionRate - Filter low submission rate tenants
 */

// Super Admin Action Types
/**
 * @typedef {Object} TenantSnapshotRefreshResult
 * @property {string} clientId - Client ID
 * @property {string} snapshotDate - Snapshot date
 * @property {boolean} created - Whether new snapshot was created
 */