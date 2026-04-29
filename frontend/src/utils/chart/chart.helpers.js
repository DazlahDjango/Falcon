import { CHART_COLORS, TRAFFIC_LIGHT } from '../kpi/constants';

/**
 * Get color for score
 * @param {number} score - Score value
 * @returns {string} Color code
 */
export const getScoreColor = (score) => {
    if (score >= 90) return TRAFFIC_LIGHT.GREEN.color;
    if (score >= 50) return TRAFFIC_LIGHT.YELLOW.color;
    return TRAFFIC_LIGHT.RED.color;
};

/**
 * Generate gradient for chart
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} startColor - Start color
 * @param {string} endColor - End color
 * @returns {CanvasGradient} Gradient
 */
export const generateGradient = (ctx, startColor, endColor) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
};

/**
 * Prepare dataset for line chart
 * @param {Array} data - Data points
 * @param {string} label - Dataset label
 * @param {string} color - Line color
 * @param {boolean} fill - Whether to fill area
 * @returns {Object} Dataset object
 */
export const prepareLineDataset = (data, label, color = CHART_COLORS.PRIMARY, fill = false) => {
    return {
        label,
        data,
        borderColor: color,
        backgroundColor: fill ? generateGradient(ctx, color, `${color}20`) : 'transparent',
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: fill
    };
};

/**
 * Prepare dataset for bar chart
 * @param {Array} data - Data points
 * @param {string} label - Dataset label
 * @param {string} color - Bar color
 * @returns {Object} Dataset object
 */
export const prepareBarDataset = (data, label, color = CHART_COLORS.PRIMARY) => {
    return {
        label,
        data,
        backgroundColor: color,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8
    };
};

/**
 * Prepare dataset for pie chart
 * @param {Array} data - Data points
 * @param {Array} labels - Labels
 * @param {Array} colors - Colors
 * @returns {Object} Dataset object
 */
export const preparePieDataset = (data, labels, colors) => {
    return {
        labels,
        datasets: [{
            data,
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 5
        }]
    };
};

/**
 * Get status distribution data
 * @param {Object} distribution - Status counts
 * @returns {Object} Chart data
 */
export const getStatusDistributionData = (distribution) => {
    return {
        labels: ['On Track', 'At Risk', 'Off Track'],
        data: [distribution.GREEN || 0, distribution.YELLOW || 0, distribution.RED || 0],
        colors: [TRAFFIC_LIGHT.GREEN.color, TRAFFIC_LIGHT.YELLOW.color, TRAFFIC_LIGHT.RED.color]
    };
};

/**
 * Get score trend data
 * @param {Array} scores - Score history
 * @returns {Object} Chart data
 */
export const getScoreTrendData = (scores) => {
    return {
        labels: scores.map(s => s.period),
        datasets: [{
            label: 'Performance Score',
            data: scores.map(s => s.score),
            borderColor: CHART_COLORS.PRIMARY,
            backgroundColor: `${CHART_COLORS.PRIMARY}20`,
            fill: true,
            tension: 0.3
        }]
    };
};

/**
 * Get department comparison data
 * @param {Array} departments - Department data
 * @returns {Object} Chart data
 */
export const getDepartmentComparisonData = (departments) => {
    return {
        labels: departments.map(d => d.name),
        datasets: [{
            label: 'Performance Score (%)',
            data: departments.map(d => d.score),
            backgroundColor: CHART_COLORS.PRIMARY
        }]
    };
};