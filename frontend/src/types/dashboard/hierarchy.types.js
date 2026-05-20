// frontend/src/types/dashboard/hierarchy.types.js
/**
 * Hierarchy and Organization Structure type definitions
 */

// Hierarchy Types
/**
 * @typedef {Object} TeamMember
 * @property {string} id - User ID
 * @property {string} email - Email address
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} role - User role
 * @property {string} title - Job title
 * @property {string} managerId - Manager's user ID
 * @property {number} aggregatedScore - Aggregated performance score
 * @property {string} trafficLight - Status (green, yellow, red)
 * @property {string} department - Department name
 * @property {boolean} isManager - Whether user is a manager
 * @property {number} directReportCount - Number of direct reports
 * @property {string} avatar - Avatar URL (optional)
 * @property {string} phoneNumber - Phone number (optional)
 * @property {string} location - Location (optional)
 * @property {string} joinedAt - Join date (optional)
 */

/**
 * @typedef {Object} TeamAggregate
 * @property {number} totalMembers - Total team members
 * @property {number} greenCount - Members with green status
 * @property {number} yellowCount - Members with yellow status
 * @property {number} redCount - Members with red status
 * @property {number} averageScore - Average team score
 * @property {number} submissionRate - Data submission rate
 * @property {number} greenPercentage - Percentage of green members
 * @property {number} redPercentage - Percentage of red members
 * @property {number} pendingReviews - Pending reviews count
 * @property {number} previousAverageScore - Previous period average score
 */

/**
 * @typedef {Object} OrgTreeNode
 * @property {string} id - Node ID (user ID)
 * @property {string} email - Email address
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} role - User role
 * @property {string} title - Job title
 * @property {number} aggregatedScore - Performance score
 * @property {string} trafficLight - Status
 * @property {string} department - Department
 * @property {boolean} isManager - Whether user is manager
 * @property {number} directReportCount - Direct reports count
 * @property {OrgTreeNode[]} children - Child nodes
 * @property {boolean} truncated - Whether tree is truncated
 */

/**
 * @typedef {Object} ReportingChain
 * @property {TeamMember[]} chain - Chain of managers
 */

// Hierarchy Filter Types
/**
 * @typedef {Object} HierarchyFilter
 * @property {string} userId - User ID to fetch team for
 * @property {boolean} includeSelf - Include self in results
 * @property {string} rootUserId - Root user for org tree
 */

// Drill Down Types
/**
 * @typedef {Object} DrillDownResult
 * @property {TeamMember} user - Drilled down user data
 * @property {TeamAggregate} teamAggregate - Team aggregate for drilled user
 */