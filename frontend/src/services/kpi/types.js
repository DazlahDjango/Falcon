/**
 * KPI Module Type Definitions (JSDoc)
 * 
 * @module KPI Types
 */

/**
 * @typedef {Object} BaseEntity
 * @property {string} id - Unique identifier
 * @property {string} tenantId - Tenant identifier
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 * @property {string} [createdBy] - Creator user ID
 * @property {string} [updatedBy] - Last updater user ID
 */

/**
 * @typedef {Object} KPI
 * @property {string} name - KPI name
 * @property {string} code - KPI code
 * @property {string} description - Description
 * @property {('COUNT'|'PERCENTAGE'|'FINANCIAL'|'MILESTONE'|'TIME'|'IMPACT')} kpiType - Type of KPI
 * @property {('HIGHER_IS_BETTER'|'LOWER_IS_BETTER')} calculationLogic - Calculation logic
 * @property {('CUMULATIVE'|'NON_CUMULATIVE')} measureType - Measure type
 * @property {string} unit - Unit of measurement
 * @property {number} decimalPlaces - Decimal places for display
 * @property {number} [targetMin] - Minimum target value
 * @property {number} [targetMax] - Maximum target value
 * @property {Object} [formula] - Custom formula configuration
 * @property {string} frameworkId - Framework ID
 * @property {string} [categoryId] - Category ID
 * @property {string} sectorId - Sector ID
 * @property {string} ownerId - Owner user ID
 * @property {string} [departmentId] - Department ID
 * @property {boolean} isActive - Whether KPI is active
 * @property {string} [activationDate] - Activation date
 * @property {string} [deactivationDate] - Deactivation date
 * @property {string} [strategicObjective] - Strategic objective
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} KPIWeight
 * @property {string} kpiId - KPI ID
 * @property {string} userId - User ID
 * @property {number} weight - Weight percentage (0-100)
 * @property {string} effectiveFrom - Effective from date
 * @property {string} [effectiveTo] - Effective to date
 * @property {boolean} isActive - Whether weight is active
 * @property {string} [reason] - Reason for weight assignment
 */

/**
 * @typedef {Object} AnnualTarget
 * @property {string} kpiId - KPI ID
 * @property {string} userId - User ID
 * @property {number} year - Year
 * @property {number} targetValue - Target value
 * @property {string} [approvedById] - Approver user ID
 * @property {string} [approvedAt] - Approval timestamp
 * @property {string} [notes] - Notes
 */

/**
 * @typedef {Object} MonthlyPhasing
 * @property {string} annualTargetId - Annual target ID
 * @property {number} month - Month (1-12)
 * @property {number} targetValue - Target value for month
 * @property {boolean} isLocked - Whether locked
 * @property {string} [lockedAt] - Lock timestamp
 * @property {string} [lockedById] - Locked by user ID
 */

/**
 * @typedef {Object} MonthlyActual
 * @property {string} kpiId - KPI ID
 * @property {string} userId - User ID
 * @property {number} year - Year
 * @property {number} month - Month
 * @property {number} actualValue - Actual value
 * @property {('PENDING'|'APPROVED'|'REJECTED'|'ADJUSTED')} status - Status
 * @property {string} [submittedAt] - Submission timestamp
 * @property {string} [submittedById] - Submitter user ID
 * @property {string} [notes] - Notes
 */

/**
 * @typedef {Object} Score
 * @property {string} kpiId - KPI ID
 * @property {string} userId - User ID
 * @property {number} year - Year
 * @property {number} month - Month
 * @property {number} score - Calculated score (0-100)
 * @property {number} actualValue - Actual value used
 * @property {number} targetValue - Target value used
 * @property {string} formulaUsed - Formula used for calculation
 * @property {string} calculatedAt - Calculation timestamp
 * @property {string} calculatedBy - Calculator (system or user)
 */

/**
 * @typedef {Object} TrafficLight
 * @property {string} scoreId - Score ID
 * @property {('GREEN'|'YELLOW'|'RED')} status - Status
 * @property {number} scoreValue - Score value
 * @property {number} greenThreshold - Green threshold
 * @property {number} yellowThreshold - Yellow threshold
 * @property {number} consecutiveRedCount - Consecutive red months count
 * @property {string} calculatedAt - Calculation timestamp
 */

/**
 * @typedef {Object} AggregatedScore
 * @property {('INDIVIDUAL'|'TEAM'|'DEPARTMENT'|'ORGANIZATION')} level - Aggregation level
 * @property {string} entityId - Entity identifier
 * @property {string} entityName - Entity name
 * @property {number} year - Year
 * @property {number} month - Month
 * @property {number} aggregatedScore - Aggregated score
 * @property {number} memberCount - Number of members
 * @property {number} kpiCount - Number of KPIs
 * @property {string} calculationMethod - Method used
 * @property {string} calculatedAt - Calculation timestamp
 */

/**
 * @typedef {Object} PaginatedResponse
 * @template T
 * @property {number} count - Total count
 * @property {string|null} next - Next page URL
 * @property {string|null} previous - Previous page URL
 * @property {T[]} results - Results array
 */

/**
 * @typedef {Object} BulkUploadResult
 * @property {number} totalRows - Total rows processed
 * @property {number} created - Number created
 * @property {number} updated - Number updated
 * @property {Array<{row: number, error: string}>} errors - Errors
 * @property {boolean} dryRun - Whether dry run
 */

/**
 * @typedef {Object} CalculationStatus
 * @property {string} taskId - Task ID
 * @property {('PENDING'|'PROGRESS'|'SUCCESS'|'FAILED')} status - Status
 * @property {Object} [result] - Result data
 * @property {string} [error] - Error message
 * @property {string} [startedAt] - Start timestamp
 * @property {string} [completedAt] - Completion timestamp
 */

// Export empty object for module compatibility
export default {};