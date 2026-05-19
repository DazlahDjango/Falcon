// src/config/constants/reviewStatusConstants.js

// Review Cycle Status
export const REVIEW_CYCLE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
};

export const REVIEW_CYCLE_STATUS_LABELS = {
  [REVIEW_CYCLE_STATUS.DRAFT]: 'Draft',
  [REVIEW_CYCLE_STATUS.ACTIVE]: 'Active',
  [REVIEW_CYCLE_STATUS.COMPLETED]: 'Completed',
  [REVIEW_CYCLE_STATUS.ARCHIVED]: 'Archived',
};

export const REVIEW_CYCLE_STATUS_COLORS = {
  [REVIEW_CYCLE_STATUS.DRAFT]: 'gray',
  [REVIEW_CYCLE_STATUS.ACTIVE]: 'green',
  [REVIEW_CYCLE_STATUS.COMPLETED]: 'blue',
  [REVIEW_CYCLE_STATUS.ARCHIVED]: 'gray',
};

// Cycle Types
export const REVIEW_CYCLE_TYPES = {
  MID_YEAR: 'mid_year',
  END_YEAR: 'end_year',
  QUARTERLY: 'quarterly',
  PROBATION: 'probation',
  SPECIAL: 'special',
  PIP: 'pip',
};

export const REVIEW_CYCLE_TYPE_LABELS = {
  [REVIEW_CYCLE_TYPES.MID_YEAR]: 'Mid-Year Review',
  [REVIEW_CYCLE_TYPES.END_YEAR]: 'End-Year Review',
  [REVIEW_CYCLE_TYPES.QUARTERLY]: 'Quarterly Review',
  [REVIEW_CYCLE_TYPES.PROBATION]: 'Probation Review',
  [REVIEW_CYCLE_TYPES.SPECIAL]: 'Special Review',
  [REVIEW_CYCLE_TYPES.PIP]: 'PIP Review',
};

// Assessment Status
export const REVIEW_ASSESSMENT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const REVIEW_ASSESSMENT_STATUS_LABELS = {
  [REVIEW_ASSESSMENT_STATUS.DRAFT]: 'Draft',
  [REVIEW_ASSESSMENT_STATUS.SUBMITTED]: 'Submitted',
  [REVIEW_ASSESSMENT_STATUS.APPROVED]: 'Approved',
  [REVIEW_ASSESSMENT_STATUS.REJECTED]: 'Rejected',
};

export const REVIEW_ASSESSMENT_STATUS_COLORS = {
  [REVIEW_ASSESSMENT_STATUS.DRAFT]: 'gray',
  [REVIEW_ASSESSMENT_STATUS.SUBMITTED]: 'yellow',
  [REVIEW_ASSESSMENT_STATUS.APPROVED]: 'green',
  [REVIEW_ASSESSMENT_STATUS.REJECTED]: 'red',
};

// Final Rating Status
export const REVIEW_FINAL_RATING_STATUS = {
  PENDING: 'pending',
  CALIBRATED: 'calibrated',
  APPROVED: 'approved',
  LOCKED: 'locked',
  APPEALED: 'appealed',
  REVISED: 'revised',
};

export const REVIEW_FINAL_RATING_STATUS_LABELS = {
  [REVIEW_FINAL_RATING_STATUS.PENDING]: 'Pending Calibration',
  [REVIEW_FINAL_RATING_STATUS.CALIBRATED]: 'Calibrated',
  [REVIEW_FINAL_RATING_STATUS.APPROVED]: 'Approved',
  [REVIEW_FINAL_RATING_STATUS.LOCKED]: 'Locked (Final)',
  [REVIEW_FINAL_RATING_STATUS.APPEALED]: 'Appealed',
  [REVIEW_FINAL_RATING_STATUS.REVISED]: 'Revised',
};

// PIP Status
export const REVIEW_PIP_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const REVIEW_PIP_STATUS_LABELS = {
  [REVIEW_PIP_STATUS.DRAFT]: 'Draft',
  [REVIEW_PIP_STATUS.ACTIVE]: 'Active',
  [REVIEW_PIP_STATUS.COMPLETED]: 'Completed',
  [REVIEW_PIP_STATUS.FAILED]: 'Failed',
};

export const REVIEW_PIP_STATUS_COLORS = {
  [REVIEW_PIP_STATUS.DRAFT]: 'gray',
  [REVIEW_PIP_STATUS.ACTIVE]: 'yellow',
  [REVIEW_PIP_STATUS.COMPLETED]: 'green',
  [REVIEW_PIP_STATUS.FAILED]: 'red',
};

// PIP Severity
export const REVIEW_PIP_SEVERITY = {
  MINOR: 'minor',
  MODERATE: 'moderate',
  SEVERE: 'severe',
  CRITICAL: 'critical',
};

export const REVIEW_PIP_SEVERITY_LABELS = {
  [REVIEW_PIP_SEVERITY.MINOR]: 'Minor - Coaching Required',
  [REVIEW_PIP_SEVERITY.MODERATE]: 'Moderate - Formal PIP',
  [REVIEW_PIP_SEVERITY.SEVERE]: 'Severe - Final Warning',
  [REVIEW_PIP_SEVERITY.CRITICAL]: 'Critical - Possible Termination',
};

export const REVIEW_PIP_SEVERITY_COLORS = {
  [REVIEW_PIP_SEVERITY.MINOR]: 'blue',
  [REVIEW_PIP_SEVERITY.MODERATE]: 'yellow',
  [REVIEW_PIP_SEVERITY.SEVERE]: 'orange',
  [REVIEW_PIP_SEVERITY.CRITICAL]: 'red',
};

// PIP Action Status
export const REVIEW_PIP_ACTION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  MISSED: 'missed',
  WAIVED: 'waived',
};

export const REVIEW_PIP_ACTION_STATUS_LABELS = {
  [REVIEW_PIP_ACTION_STATUS.PENDING]: 'Pending',
  [REVIEW_PIP_ACTION_STATUS.IN_PROGRESS]: 'In Progress',
  [REVIEW_PIP_ACTION_STATUS.COMPLETED]: 'Completed',
  [REVIEW_PIP_ACTION_STATUS.MISSED]: 'Missed',
  [REVIEW_PIP_ACTION_STATUS.WAIVED]: 'Waived',
};

export const REVIEW_PIP_ACTION_STATUS_COLORS = {
  [REVIEW_PIP_ACTION_STATUS.PENDING]: 'gray',
  [REVIEW_PIP_ACTION_STATUS.IN_PROGRESS]: 'blue',
  [REVIEW_PIP_ACTION_STATUS.COMPLETED]: 'green',
  [REVIEW_PIP_ACTION_STATUS.MISSED]: 'red',
  [REVIEW_PIP_ACTION_STATUS.WAIVED]: 'gray',
};

// Feedback Status
export const REVIEW_FEEDBACK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
};

export const REVIEW_FEEDBACK_STATUS_LABELS = {
  [REVIEW_FEEDBACK_STATUS.PENDING]: 'Pending',
  [REVIEW_FEEDBACK_STATUS.COMPLETED]: 'Completed',
};

// Calibration Status
export const REVIEW_CALIBRATION_STATUS = {
  ACTIVE: 'active',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const REVIEW_CALIBRATION_STATUS_LABELS = {
  [REVIEW_CALIBRATION_STATUS.ACTIVE]: 'Active',
  [REVIEW_CALIBRATION_STATUS.IN_PROGRESS]: 'In Progress',
  [REVIEW_CALIBRATION_STATUS.COMPLETED]: 'Completed',
  [REVIEW_CALIBRATION_STATUS.CANCELLED]: 'Cancelled',
};

// Recommendation Types
export const REVIEW_RECOMMENDATION = {
  PROMOTE: 'promote',
  RETAIN: 'retain',
  PIP: 'pip',
  DEMOTE: 'demote',
  TERMINATE: 'terminate',
  NOT_RECOMMENDED: 'not_recommended',
};

export const REVIEW_RECOMMENDATION_LABELS = {
  [REVIEW_RECOMMENDATION.PROMOTE]: 'Promote',
  [REVIEW_RECOMMENDATION.RETAIN]: 'Retain',
  [REVIEW_RECOMMENDATION.PIP]: 'Performance Improvement Plan',
  [REVIEW_RECOMMENDATION.DEMOTE]: 'Demote',
  [REVIEW_RECOMMENDATION.TERMINATE]: 'Terminate',
  [REVIEW_RECOMMENDATION.NOT_RECOMMENDED]: 'Not Recommended',
};

// Bonus Recommendation
export const REVIEW_BONUS_RECOMMENDATION = {
  EXCEPTIONAL: 'exceptional',
  STANDARD: 'standard',
  REDUCED: 'reduced',
  NONE: 'none',
};

export const REVIEW_BONUS_RECOMMENDATION_LABELS = {
  [REVIEW_BONUS_RECOMMENDATION.EXCEPTIONAL]: 'Exceptional Bonus',
  [REVIEW_BONUS_RECOMMENDATION.STANDARD]: 'Standard Bonus',
  [REVIEW_BONUS_RECOMMENDATION.REDUCED]: 'Reduced Bonus',
  [REVIEW_BONUS_RECOMMENDATION.NONE]: 'No Bonus',
};

// Traffic Light Colors
export const REVIEW_TRAFFIC_LIGHT = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
  GRAY: 'gray',
};

export const REVIEW_TRAFFIC_LIGHT_LABELS = {
  [REVIEW_TRAFFIC_LIGHT.GREEN]: 'Good',
  [REVIEW_TRAFFIC_LIGHT.YELLOW]: 'Warning',
  [REVIEW_TRAFFIC_LIGHT.RED]: 'Critical',
  [REVIEW_TRAFFIC_LIGHT.GRAY]: 'Not Rated',
};