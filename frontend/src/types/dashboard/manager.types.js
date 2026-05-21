// frontend/src/types/dashboard/manager.types.js

/**
 * Manager Dashboard type definitions
 */

// Manager Dashboard Data Types
/**
 * @typedef {Object} ManagerDashboardData
 * @property {string} dashboardType - Dashboard type identifier
 * @property {string} period - Current period
 * @property {ManagerUserInfo} user - Manager user information
 * @property {KPICard[]} personalKpis - Manager's personal KPIs
 * @property {number|null} personalScore - Manager's overall score
 * @property {string} personalTrafficLight - Personal traffic light status (green, yellow, red)
 * @property {number} pendingApprovals - Number of pending approvals
 * @property {TeamMemberCard[]} teamMembers - List of team members (optional)
 * @property {TeamSummary} teamSummary - Team summary statistics (optional)
 * @property {string} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} ManagerUserInfo
 * @property {string} id - User ID
 * @property {string} name - User full name
 * @property {string} email - User email
 * @property {string} role - User role
 * @property {string} department - User department
 */

/**
 * @typedef {Object} KPICard
 * @property {string} id - KPI ID
 * @property {string} name - KPI name
 * @property {number|null} target - Target value
 * @property {number|null} actual - Actual value
 * @property {number|null} score - Score percentage
 * @property {string} trafficLight - Traffic light status (green, yellow, red)
 * @property {string} unit - Unit of measurement
 * @property {number} weight - KPI weight
 */

/**
 * @typedef {Object} TeamMemberCard
 * @property {string} userId - User ID
 * @property {string} name - Member name
 * @property {string} email - Member email
 * @property {string} role - Member role
 * @property {string} department - Member department
 * @property {number} greenCount - Number of green KPIs
 * @property {number} yellowCount - Number of yellow KPIs
 * @property {number} redCount - Number of red KPIs
 * @property {number|null} overallScore - Overall performance score
 * @property {string} trafficLight - Traffic light status
 * @property {boolean} hasPendingApproval - Whether member has pending approval
 */

/**
 * @typedef {Object} TeamSummary
 * @property {number} totalMembers - Total team members
 * @property {number|null} averageScore - Average team score
 * @property {number} totalGreen - Total green KPIs across team
 * @property {number} totalYellow - Total yellow KPIs across team
 * @property {number} totalRed - Total red KPIs across team
 */

// Manager Filter Types
/**
 * @typedef {Object} ManagerFilter
 * @property {string} period - Time period (current, monthly, quarterly, yearly)
 * @property {boolean} includeTeam - Whether to include team data
 * @property {string|null} userId - User ID for drill-down
 * @property {string|null} department - Department filter
 * @property {string|null} status - Status filter
 */

// Pending Approval Types
/**
 * @typedef {Object} PendingApproval
 * @property {string} id - Submission ID
 * @property {string} userId - Staff user ID
 * @property {string} userName - Staff name
 * @property {string} kpiId - KPI ID
 * @property {string} kpiName - KPI name
 * @property {number} actualValue - Submitted actual value
 * @property {string} submittedAt - Submission timestamp
 * @property {number} pendingDays - Days pending
 */

// Approval Action Types
/**
 * @typedef {Object} ApprovalAction
 * @property {string} submissionId - Submission ID
 * @property {string} comments - Approval/rejection comments
 */

// Drill Down Types
/**
 * @typedef {Object} DrillDownData
 * @property {string} userId - Target user ID
 * @property {string} name - User name
 * @property {string} role - User role
 * @property {string} department - User department
 * @property {KPICard[]} kpis - User's KPIs
 * @property {number|null} overallScore - User's overall score
 * @property {string} trafficLight - User's traffic light status
 */

// Team Performance Types
/**
 * @typedef {Object} TeamPerformanceTrend
 * @property {string} month - Month label
 * @property {number|null} averageScore - Average team score for month
 * @property {number} dataPoints - Number of data points
 */

/**
 * @typedef {Object} TeamHealthMetrics
 * @property {number} averageScore - Average team score
 * @property {number} greenPercentage - Percentage of green KPIs
 * @property {number} submissionRate - Data submission rate
 * @property {number} pendingApprovals - Number of pending approvals
 * @property {string} healthStatus - Health status (healthy, warning, critical)
 */