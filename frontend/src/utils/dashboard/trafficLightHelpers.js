// frontend/src/utils/dashboard/trafficLightHelpers.js
/**
 * Traffic light status utility functions
 */

import { TRAFFIC_LIGHT, SCORE_THRESHOLDS } from '../../config/constants/dashboardConstants';

/**
 * Get traffic light status based on score
 * @param {number} score - Score (0-100)
 * @returns {string} Traffic light status (green, yellow, red)
 */
export const getTrafficLightByScore = (score) => {
  if (score === null || score === undefined) return TRAFFIC_LIGHT.YELLOW;
  
  if (score >= SCORE_THRESHOLDS.GREEN_MIN) {
    return TRAFFIC_LIGHT.GREEN;
  }
  if (score >= SCORE_THRESHOLDS.YELLOW_MIN) {
    return TRAFFIC_LIGHT.YELLOW;
  }
  return TRAFFIC_LIGHT.RED;
};

/**
 * Get traffic light status for variance
 * @param {number} variance - Variance percentage
 * @returns {string} Traffic light status
 */
export const getTrafficLightByVariance = (variance) => {
  if (variance === null || variance === undefined) return TRAFFIC_LIGHT.YELLOW;
  
  if (variance >= 5) return TRAFFIC_LIGHT.GREEN;
  if (variance >= -5) return TRAFFIC_LIGHT.YELLOW;
  return TRAFFIC_LIGHT.RED;
};

/**
 * Get traffic light status for target achievement
 * @param {number} actual - Actual value
 * @param {number} target - Target value
 * @param {boolean} higherIsBetter - Whether higher is better
 * @returns {string} Traffic light status
 */
export const getTrafficLightByTarget = (actual, target, higherIsBetter = true) => {
  if (actual === null || target === null || target === 0) {
    return TRAFFIC_LIGHT.YELLOW;
  }
  
  const ratio = actual / target;
  let score;
  
  if (higherIsBetter) {
    score = ratio * 100;
  } else {
    score = (target / actual) * 100;
  }
  
  return getTrafficLightByScore(score);
};

/**
 * Get traffic light status for submission compliance
 * @param {number} submissionRate - Submission rate percentage
 * @returns {string} Traffic light status
 */
export const getTrafficLightBySubmission = (submissionRate) => {
  if (submissionRate === null || submissionRate === undefined) {
    return TRAFFIC_LIGHT.YELLOW;
  }
  
  if (submissionRate >= 90) return TRAFFIC_LIGHT.GREEN;
  if (submissionRate >= 70) return TRAFFIC_LIGHT.YELLOW;
  return TRAFFIC_LIGHT.RED;
};

/**
 * Get traffic light CSS class
 * @param {string} status - Traffic light status
 * @returns {string} CSS class name
 */
export const getTrafficLightClass = (status) => {
  const classes = {
    green: 'traffic-light-green',
    yellow: 'traffic-light-yellow',
    red: 'traffic-light-red'
  };
  return classes[status] || 'traffic-light-default';
};

/**
 * Get traffic light text label
 * @param {string} status - Traffic light status
 * @returns {string} Human readable label
 */
export const getTrafficLightLabel = (status) => {
  const labels = {
    green: 'On Track',
    yellow: 'At Risk',
    red: 'Off Track'
  };
  return labels[status] || 'Unknown';
};

/**
 * Get traffic light priority order
 * @returns {Object} Priority order mapping
 */
export const getTrafficLightPriority = () => {
  return {
    [TRAFFIC_LIGHT.RED]: 1,
    [TRAFFIC_LIGHT.YELLOW]: 2,
    [TRAFFIC_LIGHT.GREEN]: 3
  };
};

/**
 * Sort items by traffic light priority (red first)
 * @param {Array} items - Items with status field
 * @param {string} statusKey - Key for status field
 * @returns {Array} Sorted items
 */
export const sortByTrafficLightPriority = (items, statusKey = 'status') => {
  const priority = getTrafficLightPriority();
  return [...items].sort((a, b) => {
    return (priority[a[statusKey]] || 999) - (priority[b[statusKey]] || 999);
  });
};

/**
 * Get traffic light icon
 * @param {string} status - Traffic light status
 * @returns {string} Emoji or text icon
 */
export const getTrafficLightIcon = (status) => {
  const icons = {
    green: '✅',
    yellow: '⚠️',
    red: '🔴'
  };
  return icons[status] || '⚪';
};