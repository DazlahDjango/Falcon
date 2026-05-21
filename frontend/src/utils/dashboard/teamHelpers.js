// frontend/src/utils/dashboard/teamHelpers.js

/**
 * Team Helper Utilities for Manager Dashboard
 * Calculates team aggregates, sorting, and filtering
 */

/**
 * Calculate team summary statistics
 * @param {Array} teamMembers - List of team members
 * @returns {Object} Team summary statistics
 */
export const calculateTeamSummary = (teamMembers) => {
  if (!teamMembers || teamMembers.length === 0) {
    return {
      totalMembers: 0,
      averageScore: 0,
      greenCount: 0,
      yellowCount: 0,
      redCount: 0,
      submissionRate: 0
    };
  }

  const scores = teamMembers.map(m => m.overall_score || 0);
  const greenCount = teamMembers.filter(m => m.traffic_light === 'green').length;
  const yellowCount = teamMembers.filter(m => m.traffic_light === 'yellow').length;
  const redCount = teamMembers.filter(m => m.traffic_light === 'red').length;
  const submitted = teamMembers.filter(m => m.has_submitted !== false).length;

  return {
    totalMembers: teamMembers.length,
    averageScore: scores.reduce((a, b) => a + b, 0) / teamMembers.length,
    greenCount,
    yellowCount,
    redCount,
    submissionRate: (submitted / teamMembers.length) * 100
  };
};

/**
 * Sort team members by specified field
 * @param {Array} teamMembers - List of team members
 * @param {string} sortBy - Field to sort by (name, score, status)
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Array} Sorted team members
 */
export const sortTeamMembers = (teamMembers, sortBy = 'name', sortOrder = 'asc') => {
  const sorted = [...teamMembers];
  
  sorted.sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'score':
        aVal = a.overall_score || 0;
        bVal = b.overall_score || 0;
        break;
      case 'status':
        const statusOrder = { green: 0, yellow: 1, red: 2 };
        aVal = statusOrder[a.traffic_light] || 3;
        bVal = statusOrder[b.traffic_light] || 3;
        break;
      default:
        aVal = a.name || '';
        bVal = b.name || '';
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
  
  return sorted;
};

/**
 * Filter team members by search term
 * @param {Array} teamMembers - List of team members
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered team members
 */
export const filterTeamMembers = (teamMembers, searchTerm) => {
  if (!searchTerm) return teamMembers;
  
  const term = searchTerm.toLowerCase();
  return teamMembers.filter(member => 
    member.name?.toLowerCase().includes(term) ||
    member.email?.toLowerCase().includes(term) ||
    member.role?.toLowerCase().includes(term)
  );
};

/**
 * Get team member status distribution
 * @param {Array} teamMembers - List of team members
 * @returns {Object} Status distribution
 */
export const getTeamStatusDistribution = (teamMembers) => {
  const total = teamMembers.length;
  const green = teamMembers.filter(m => m.traffic_light === 'green').length;
  const yellow = teamMembers.filter(m => m.traffic_light === 'yellow').length;
  const red = teamMembers.filter(m => m.traffic_light === 'red').length;
  
  return {
    green,
    yellow,
    red,
    greenPercentage: total ? (green / total) * 100 : 0,
    yellowPercentage: total ? (yellow / total) * 100 : 0,
    redPercentage: total ? (red / total) * 100 : 0
  };
};

/**
 * Get top performers
 * @param {Array} teamMembers - List of team members
 * @param {number} limit - Number of top performers to return
 * @returns {Array} Top performers
 */
export const getTopPerformers = (teamMembers, limit = 5) => {
  return [...teamMembers]
    .filter(m => m.overall_score)
    .sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0))
    .slice(0, limit);
};

/**
 * Get bottom performers (needs improvement)
 * @param {Array} teamMembers - List of team members
 * @param {number} limit - Number of bottom performers to return
 * @returns {Array} Bottom performers
 */
export const getBottomPerformers = (teamMembers, limit = 5) => {
  return [...teamMembers]
    .filter(m => m.overall_score)
    .sort((a, b) => (a.overall_score || 0) - (b.overall_score || 0))
    .slice(0, limit);
};

/**
 * Calculate team health score
 * @param {Array} teamMembers - List of team members
 * @returns {number} Team health score (0-100)
 */
export const calculateTeamHealthScore = (teamMembers) => {
  if (!teamMembers.length) return 0;
  
  const avgScore = teamMembers.reduce((sum, m) => sum + (m.overall_score || 0), 0) / teamMembers.length;
  const greenRatio = teamMembers.filter(m => m.traffic_light === 'green').length / teamMembers.length;
  
  // Weight: 60% average score, 40% green ratio
  return (avgScore * 0.6) + (greenRatio * 100 * 0.4);
};

export default {
  calculateTeamSummary,
  sortTeamMembers,
  filterTeamMembers,
  getTeamStatusDistribution,
  getTopPerformers,
  getBottomPerformers,
  calculateTeamHealthScore
};