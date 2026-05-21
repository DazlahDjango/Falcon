// frontend/src/types/dashboard/champion.types.js

/**
 * Champion Dashboard type definitions
 */

// Champion Dashboard Data Types
/**
 * @typedef {Object} ChampionDashboardData
 * @property {ChampionTargetUser} targetUser - Target user information
 * @property {string} period - Current period
 * @property {boolean} isEditable - Whether dashboard is editable
 * @property {AssignedKPI[]} assignedKpis - KPIs assigned to target user
 * @property {AvailableKPI[]} availableKpis - KPIs available for assignment
 * @property {ChampionDashboardConfig} dashboardConfig - Dashboard configuration
 * @property {string} lastUpdated - Last update timestamp
 */

/**
 * @typedef {Object} ChampionTargetUser
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} role - User role
 * @property {string} department - User department
 */

/**
 * @typedef {Object} AssignedKPI
 * @property {string} id - KPI ID
 * @property {string} name - KPI name
 * @property {string} description - KPI description
 * @property {number|null} target - Target value
 * @property {number|null} actual - Actual value
 * @property {number} weight - KPI weight
 * @property {boolean} isActive - Whether KPI is active
 * @property {string} category - KPI category
 */

/**
 * @typedef {Object} AvailableKPI
 * @property {string} id - KPI ID
 * @property {string} name - KPI name
 * @property {string} description - KPI description
 * @property {number|null} target - Target value
 * @property {string} category - KPI category
 */

/**
 * @typedef {Object} ChampionDashboardConfig
 * @property {Object} layout - Dashboard layout configuration
 * @property {Object} filters - Default filters
 * @property {Array} widgets - Widget configurations
 */

// Configuration Update Types
/**
 * @typedef {Object} ConfigUpdate
 * @property {string} userId - Target user ID
 * @property {Object} config - Configuration changes
 * @property {Array} config.kpiAssignments - KPI assignment changes (optional)
 * @property {Object} config.weights - Weight updates (optional)
 * @property {Object} config.targets - Target updates (optional)
 * @property {string} config.period - Period for targets (optional)
 */

/**
 * @typedef {Object} KPIAssignment
 * @property {string} kpiId - KPI ID
 * @property {string} action - Action (add, remove)
 * @property {number} weight - KPI weight (for add action)
 */

// Template Types
/**
 * @typedef {Object} Template
 * @property {string} id - Template ID
 * @property {string} name - Template name
 * @property {string} description - Template description
 * @property {string} category - Template category (sales, finance, hr, operations, marketing, custom)
 * @property {Object} savedConfiguration - Saved dashboard configuration
 * @property {number} usageCount - Number of times template has been used
 * @property {boolean} isTemplate - Whether this is a template
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} TemplateCreate
 * @property {string} name - Template name
 * @property {string} description - Template description
 * @property {string} category - Template category
 * @property {Object} configuration - Dashboard configuration to save
 */

// Bulk Assignment Types
/**
 * @typedef {Object} BulkAssignment
 * @property {string[]} userIds - Array of user IDs
 * @property {string[]} kpiIds - Array of KPI IDs
 * @property {number} weight - Default weight for all assignments
 */

// Weight Update Types
/**
 * @typedef {Object} WeightUpdate
 * @property {string} userId - Target user ID
 * @property {Object<string, number>} weights - Map of KPI IDs to weights
 */

// Target Update Types
/**
 * @typedef {Object} TargetUpdate
 * @property {string} userId - Target user ID
 * @property {Object<string, number>} targets - Map of KPI IDs to targets
 * @property {string} period - Period for targets
 */