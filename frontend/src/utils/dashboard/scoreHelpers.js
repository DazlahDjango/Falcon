// frontend/src/utils/dashboard/scoreHelpers.js
/**
 * Score calculation utility functions for dashboard
 */

/**
 * Calculate percentage score
 * @param {number} actual - Actual value
 * @param {number} target - Target value
 * @param {boolean} higherIsBetter - Whether higher is better
 * @returns {number} Score (0-100)
 */
export const calculateScore = (actual, target, higherIsBetter = true) => {
  if (actual === null || actual === undefined) return 0;
  if (!target || target === 0) return 0;
  
  let score;
  if (higherIsBetter) {
    score = (actual / target) * 100;
  } else {
    score = (target / actual) * 100;
  }
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Calculate weighted average score
 * @param {Array} items - Items with score and weight
 * @param {string} scoreKey - Key for score value
 * @param {string} weightKey - Key for weight value
 * @returns {number} Weighted average score
 */
export const calculateWeightedScore = (items, scoreKey = 'score', weightKey = 'weight') => {
  if (!items || !items.length) return 0;
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const item of items) {
    const score = item[scoreKey];
    const weight = item[weightKey];
    
    if (score !== null && score !== undefined && weight) {
      weightedSum += score * weight;
      totalWeight += weight;
    }
  }
  
  if (totalWeight === 0) return 0;
  return weightedSum / totalWeight;
};

/**
 * Calculate aggregate score for team
 * @param {Array} members - Team members with scores
 * @param {string} scoreKey - Key for score value
 * @returns {number} Average team score
 */
export const calculateTeamAverage = (members, scoreKey = 'score') => {
  if (!members || !members.length) return 0;
  
  const scores = members
    .map(m => m[scoreKey])
    .filter(s => s !== null && s !== undefined);
  
  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

/**
 * Calculate variance between two scores
 * @param {number} current - Current score
 * @param {number} previous - Previous score
 * @returns {Object} Variance amount and percentage
 */
export const calculateVariance = (current, previous) => {
  if (current === null || current === undefined) return { amount: 0, percentage: 0 };
  if (previous === null || previous === undefined) return { amount: current, percentage: 100 };
  
  const amount = current - previous;
  const percentage = previous === 0 ? (current > 0 ? 100 : 0) : (amount / previous) * 100;
  
  return {
    amount: parseFloat(amount.toFixed(2)),
    percentage: parseFloat(percentage.toFixed(2))
  };
};

/**
 * Calculate completion rate
 * @param {number} completed - Completed items
 * @param {number} total - Total items
 * @returns {number} Completion percentage
 */
export const calculateCompletionRate = (completed, total) => {
  if (!total || total === 0) return 0;
  return (completed / total) * 100;
};

/**
 * Calculate growth rate
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Growth percentage
 */
export const calculateGrowthRate = (current, previous) => {
  if (previous === null || previous === undefined || previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * Calculate trend direction
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {string} 'up', 'down', or 'stable'
 */
export const calculateTrend = (current, previous) => {
  if (current === null || previous === null) return 'stable';
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'stable';
};

/**
 * Calculate rolling average
 * @param {Array} values - Array of numbers
 * @param {number} window - Window size
 * @returns {Array} Rolling averages
 */
export const calculateRollingAverage = (values, window = 3) => {
  if (!values || values.length < window) return values;
  
  const result = [];
  for (let i = 0; i < values.length; i++) {
    if (i < window - 1) {
      result.push(null);
    } else {
      const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / window);
    }
  }
  return result;
};

/**
 * Normalize score to 0-100 range
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum possible value
 * @param {number} max - Maximum possible value
 * @returns {number} Normalized score
 */
export const normalizeScore = (value, min, max) => {
  if (value === null || value === undefined) return 0;
  if (min === max) return 100;
  return ((value - min) / (max - min)) * 100;
};