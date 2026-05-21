// frontend/src/types/dashboard/staff.types.js

/**
 * Staff Dashboard type definitions
 */

// Staff Dashboard Data Types
/**
 * @typedef {Object} StaffDashboardData
 * @property {string} dashboardType - Dashboard type identifier
 * @property {string} period - Current period
 * @property {StaffUserInfo} user - Staff user information
 * @property {StaffKPICard[]} kpis - Staff's KPIs
 * @property {number|null} overallScore - Overall performance score
 * @property {string} trafficLight - Traffic light status
 * @property {number} greenCount - Number of green KPIs
 * @property {number} yellowCount - Number of yellow KPIs
 * @property {number} redCount - Number of red KPIs
 * @property {PendingSubmission[]} pendingSubmissions - Submissions awaiting approval
 * @property {string} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} StaffUserInfo
 * @property {string} id - User ID
 * @property {string} name - User full name
 * @property {string} email - User email
 * @property {string} role - User role
 * @property {string} department - User department
 * @property {SupervisorInfo|null} supervisor - Supervisor information
 */

/**
 * @typedef {Object} SupervisorInfo
 * @property {string} id - Supervisor ID
 * @property {string} name - Supervisor name
 * @property {string} email - Supervisor email
 */

/**
 * @typedef {Object} StaffKPICard
 * @property {string} id - KPI ID
 * @property {string} name - KPI name
 * @property {number|null} target - Target value
 * @property {number|null} actual - Actual value
 * @property {number|null} score - Score percentage
 * @property {string} trafficLight - Traffic light status
 * @property {string} unit - Unit of measurement
 * @property {number} weight - KPI weight
 * @property {string} status - Submission status (pending, approved, rejected, not_submitted, submitted)
 */

/**
 * @typedef {Object} PendingSubmission
 * @property {string} id - Submission ID
 * @property {string} kpiId - KPI ID
 * @property {string} kpiName - KPI name
 * @property {number} actualValue - Submitted actual value
 * @property {string|null} submittedAt - Submission timestamp
 */

// Mission Status Types
/**
 * @typedef {Object} MissionStatusReport
 * @property {string} id - Report ID
 * @property {string} userId - User ID
 * @property {string} period - Report period
 * @property {string} status - Report status (draft, submitted, approved)
 * @property {Object} sections - Report sections by KPI
 * @property {MissionCommentary} commentary - Overall commentary
 * @property {string|null} submittedAt - Submission timestamp
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} MissionSection
 * @property {string} kpiId - KPI ID
 * @property {string} kpiName - KPI name
 * @property {string} trafficLight - Current traffic light
 * @property {string} performanceAnalysis - Performance analysis text
 * @property {string} keyChallenges - Key challenges text
 * @property {string} actionsPlanned - Planned actions text
 */

/**
 * @typedef {Object} MissionCommentary
 * @property {string} overallReflection - Overall reflection text
 * @property {string} commitments - Commitments for next period
 */

// Task Types
/**
 * @typedef {Object} Task
 * @property {string} id - Task ID
 * @property {string} title - Task title
 * @property {string} description - Task description
 * @property {string|null} dueDate - Due date
 * @property {string} status - Task status (pending, ongoing, completed, late, cancelled, postponed)
 * @property {string} priority - Task priority (low, medium, high)
 * @property {string} kpiId - Associated KPI ID (optional)
 */

// Submission Types
/**
 * @typedef {Object} KPISubmission
 * @property {string} kpiId - KPI ID
 * @property {number} value - Actual value
 * @property {string} comments - Submission comments
 */

// Submission History Types
/**
 * @typedef {Object} SubmissionHistory
 * @property {string} id - Submission ID
 * @property {string} kpiId - KPI ID
 * @property {string} kpiName - KPI name
 * @property {number} actualValue - Actual value
 * @property {string} status - Submission status
 * @property {string} submittedAt - Submission timestamp
 * @property {string|null} approvedAt - Approval timestamp
 * @property {string|null} rejectedAt - Rejection timestamp
 * @property {string|null} comments - Submission comments
 * @property {string|null} feedback - Approval/rejection feedback
 */

// Performance Trend Types
/**
 * @typedef {Object} PerformanceTrend
 * @property {string} month - Month label (YYYY-MM)
 * @property {number} score - Performance score
 * @property {string} trafficLight - Traffic light status
 */