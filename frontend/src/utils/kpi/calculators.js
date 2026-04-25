import { CALCULATION_LOGIC } from './constants';

/**
 * Calculate KPI score based on actual and target values
 * @param {number} actual - Actual value
 * @param {number} target - Target value
 * @param {string} logic - Calculation logic (HIGHER_IS_BETTER or LOWER_IS_BETTER)
 * @returns {number} Calculated score (0-100)
 */
export const calculateScore = (actual, target, logic) => {
    if (actual === null || target === null || target === 0) {
        return 0;
    }
    
    const formula = CALCULATION_LOGIC[logic]?.formulaFn || CALCULATION_LOGIC.HIGHER_IS_BETTER.formulaFn;
    let score = formula(actual, target);
    
    // Clamp between 0 and 100
    return Math.min(100, Math.max(0, score));
};

/**
 * Calculate cumulative score over multiple periods
 * @param {Array} actuals - Array of actual values
 * @param {Array} targets - Array of target values
 * @param {string} logic - Calculation logic
 * @returns {number} Cumulative score
 */
export const calculateCumulativeScore = (actuals, targets, logic) => {
    if (!actuals?.length || !targets?.length || actuals.length !== targets.length) {
        return 0;
    }
    
    const totalActual = actuals.reduce((sum, val) => sum + val, 0);
    const totalTarget = targets.reduce((sum, val) => sum + val, 0);
    
    if (totalTarget === 0) return 0;
    
    return calculateScore(totalActual, totalTarget, logic);
};

/**
 * Calculate weighted average score
 * @param {Array} scores - Array of scores
 * @param {Array} weights - Array of weights
 * @returns {number} Weighted average
 */
export const calculateWeightedAverage = (scores, weights) => {
    if (!scores?.length || !weights?.length || scores.length !== weights.length) {
        return 0;
    }
    
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    if (totalWeight === 0) return 0;
    
    const weightedSum = scores.reduce((sum, score, idx) => sum + (score * weights[idx]), 0);
    return weightedSum / totalWeight;
};

/**
 * Calculate trend direction
 * @param {Array} scores - Array of scores over time
 * @returns {Object} Trend analysis
 */
export const calculateTrend = (scores) => {
    if (!scores?.length || scores.length < 2) {
        return { direction: 'STABLE', slope: 0, confidence: 0 };
    }
    
    // Calculate linear regression slope
    const n = scores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = scores;
    
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
        numerator += (x[i] - xMean) * (y[i] - yMean);
        denominator += Math.pow(x[i] - xMean, 2);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    
    let direction = 'STABLE';
    if (slope > 2) direction = 'IMPROVING';
    else if (slope < -2) direction = 'DECLINING';
    else if (Math.abs(slope) > 5) direction = 'VOLATILE';
    
    const confidence = Math.min(0.9, Math.abs(slope) / 20);
    
    return { direction, slope, confidence };
};

/**
 * Calculate percentage change between two values
 * @param {number} oldValue - Previous value
 * @param {number} newValue - Current value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (oldValue, newValue) => {
    if (oldValue === 0) {
        return newValue > 0 ? 100 : 0;
    }
    return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Calculate achievement rate
 * @param {number} actual - Actual value
 * @param {number} target - Target value
 * @returns {number} Achievement percentage
 */
export const calculateAchievement = (actual, target) => {
    if (target === 0) return 0;
    return Math.min(100, (actual / target) * 100);
};

/**
 * Calculate variance
 * @param {number} actual - Actual value
 * @param {number} target - Target value
 * @returns {number} Variance (actual - target)
 */
export const calculateVariance = (actual, target) => {
    return actual - target;
};

/**
 * Calculate percentage variance
 * @param {number} actual - Actual value
 * @param {number} target - Target value
 * @returns {number} Percentage variance
 */
export const calculatePercentageVariance = (actual, target) => {
    if (target === 0) return 0;
    return ((actual - target) / target) * 100;
};