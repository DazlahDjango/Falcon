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

// Export empty object for module compatibility
export default {};