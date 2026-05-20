// frontend/src/utils/dashboard/chartHelpers.js
/**
 * Chart utility functions for dashboard visualizations
 */

/**
 * Format data for trend charts
 * @param {Array} data - Raw trend data
 * @param {string} valueKey - Key for value field
 * @param {string} labelKey - Key for label field
 * @returns {Object} Formatted chart data
 */
export const formatTrendChartData = (data, valueKey = 'value', labelKey = 'label') => {
  if (!data || !data.length) {
    return { labels: [], datasets: [] };
  }

  const labels = data.map(item => item[labelKey] || item.month || item.period);
  const values = data.map(item => item[valueKey] || item.value || item.actual || 0);

  return {
    labels,
    datasets: [{
      data: values,
      label: 'Performance',
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };
};

/**
 * Format comparison chart data
 * @param {Object} comparisonData - Comparison results
 * @returns {Object} Formatted comparison chart data
 */
export const formatComparisonChartData = (comparisonData) => {
  if (!comparisonData) return null;

  return {
    labels: [comparisonData.previous_period_display, comparisonData.current_period_display],
    datasets: [{
      label: 'Score',
      data: [comparisonData.previous_score || 0, comparisonData.current_score || 0],
      backgroundColor: ['#94a3b8', '#3b82f6'],
      borderRadius: 8
    }]
  };
};

/**
 * Format department heatmap data
 * @param {Array} departments - Department performance data
 * @returns {Array} Formatted heatmap data
 */
export const formatHeatmapData = (departments) => {
  if (!departments || !departments.length) return [];

  return departments.map(dept => ({
    x: dept.name,
    y: dept.average_score || 0,
    status: dept.status,
    employeeCount: dept.employee_count,
    value: Math.round(dept.average_score || 0)
  }));
};

/**
 * Get chart color based on value and thresholds
 * @param {number} value - Value to evaluate
 * @param {number} greenThreshold - Threshold for green (default: 90)
 * @param {number} yellowThreshold - Threshold for yellow (default: 50)
 * @returns {string} CSS color
 */
export const getChartColor = (value, greenThreshold = 90, yellowThreshold = 50) => {
  if (value >= greenThreshold) return '#10b981';
  if (value >= yellowThreshold) return '#f59e0b';
  return '#ef4444';
};

/**
 * Get gradient colors for charts
 * @param {string} status - Status (green, yellow, red)
 * @returns {string} CSS gradient
 */
export const getChartGradient = (status) => {
  const gradients = {
    green: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    yellow: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    red: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
  };
  return gradients[status] || gradients.green;
};

/**
 * Calculate y-axis domain for charts
 * @param {Array} data - Data values
 * @param {number} padding - Padding percentage (default: 0.1)
 * @returns {Object} Min and max values
 */
export const calculateChartDomain = (data, padding = 0.1) => {
  if (!data || !data.length) return { min: 0, max: 100 };
  
  const values = data.map(d => d.value || d.actual || d.score || 0);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 100);
  const range = max - min;
  
  return {
    min: Math.max(0, min - range * padding),
    max: Math.min(100, max + range * padding)
  };
};

/**
 * Format tooltip for charts
 * @param {Object} tooltipItem - Tooltip item from chart.js
 * @returns {string} Formatted tooltip text
 */
export const formatChartTooltip = (tooltipItem) => {
  const value = tooltipItem.raw;
  const label = tooltipItem.label;
  
  if (typeof value === 'number') {
    return `${label}: ${Math.round(value)}%`;
  }
  return `${label}: ${value}`;
};