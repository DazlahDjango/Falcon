// src/store/reviews/selectors/combined.selectors.js
import { createSelector } from '@reduxjs/toolkit';
import {
  selectAllCycles,
  selectCycleById,
  selectCycleProgress,
} from './cycle.selectors';
import {
  selectAllSelfAssessments,
} from './';
import {
  selectAllSupervisorReviews,
} from './';
import {
  selectAllFinalRatings,
  selectRatingDistribution,
} from './';
import {
  selectAllPIPs,
} from './';
import {
  selectAllPromotions,
} from './';
import {
  selectAllCalibrationSessions,
} from './';

// Cycle with Progress
export const selectCycleWithProgress = createSelector(
  [selectCycleById, selectCycleProgress],
  (cycle, progress) => cycle ? { ...cycle, progress } : null
);

// Employee Review Status
export const selectEmployeeReviewStatus = createSelector(
  [
    selectAllSelfAssessments,
    selectAllSupervisorReviews,
    selectAllFinalRatings,
    (state, employeeId) => employeeId,
    (state, employeeId, cycleId) => cycleId,
  ],
  (selfAssessments, supervisorReviews, finalRatings, employeeId, cycleId) => {
    const selfAssessment = selfAssessments.find(
      (item) => item.employee === employeeId && item.review_cycle === cycleId
    );
    const supervisorReview = supervisorReviews.find(
      (item) => item.employee === employeeId && item.review_cycle === cycleId
    );
    const finalRating = finalRatings.find(
      (item) => item.employee === employeeId && item.review_cycle === cycleId
    );
    return {
      selfAssessment,
      supervisorReview,
      finalRating,
      hasSelfAssessment: !!selfAssessment,
      hasSupervisorReview: !!supervisorReview,
      hasFinalRating: !!finalRating,
      isComplete: !!(selfAssessment && supervisorReview && finalRating),
    };
  }
);

// Performance Metrics
export const selectPerformanceMetrics = createSelector(
  [
    selectAllFinalRatings,
    selectAllPIPs,
    selectAllPromotions,
    (state, employeeId) => employeeId,
  ],
  (ratings, pips, promotions, employeeId) => {
    const employeeRatings = ratings.filter((item) => item.employee === employeeId);
    const employeePIPs = pips.filter((item) => item.employee === employeeId);
    const employeePromotions = promotions.filter((item) => item.employee === employeeId);
    
    const scores = employeeRatings.filter(r => r.final_score !== null).map(r => r.final_score);
    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;
    
    return {
      ratings: employeeRatings,
      pips: employeePIPs,
      promotions: employeePromotions,
      averageScore,
      totalRatings: employeeRatings.length,
      totalPIPs: employeePIPs.length,
      totalPromotions: employeePromotions.length,
      latestRating: employeeRatings.length > 0 ? employeeRatings[employeeRatings.length - 1] : null,
      latestPIP: employeePIPs.length > 0 ? employeePIPs[employeePIPs.length - 1] : null,
      latestPromotion: employeePromotions.length > 0 ? employeePromotions[employeePromotions.length - 1] : null,
    };
  }
);

// Cycle Completion Status
export const selectCycleCompletionStatus = createSelector(
  [
    selectCycleById,
    selectAllSelfAssessments,
    selectAllSupervisorReviews,
    selectAllFinalRatings,
    (state, cycleId) => cycleId,
  ],
  (cycle, selfAssessments, supervisorReviews, finalRatings, cycleId) => {
    if (!cycle) return null;
    
    const cycleSelfAssessments = selfAssessments.filter((item) => item.review_cycle === cycleId);
    const cycleSupervisorReviews = supervisorReviews.filter((item) => item.review_cycle === cycleId);
    const cycleFinalRatings = finalRatings.filter((item) => item.review_cycle === cycleId);
    
    const total = cycle.participants_count || cycleSelfAssessments.length || 1;
    const submittedSA = cycleSelfAssessments.filter((item) => item.status === 'submitted').length;
    const approvedSR = cycleSupervisorReviews.filter((item) => item.status === 'approved').length;
    const lockedFR = cycleFinalRatings.filter((item) => item.status === 'locked').length;
    
    return {
      total,
      selfAssessment: {
        submitted: submittedSA,
        pending: total - submittedSA,
        percentage: total > 0 ? (submittedSA / total) * 100 : 0,
      },
      supervisorReview: {
        approved: approvedSR,
        pending: total - approvedSR,
        percentage: total > 0 ? (approvedSR / total) * 100 : 0,
      },
      finalRating: {
        locked: lockedFR,
        pending: total - lockedFR,
        percentage: total > 0 ? (lockedFR / total) * 100 : 0,
      },
      overall: {
        completed: lockedFR,
        pending: total - lockedFR,
        percentage: total > 0 ? (lockedFR / total) * 100 : 0,
      },
    };
  }
);

// Calibration Readiness
export const selectCalibrationReadiness = createSelector(
  [
    selectCycleById,
    selectAllFinalRatings,
    selectAllCalibrationSessions,
    (state, cycleId) => cycleId,
  ],
  (cycle, finalRatings, calibrationSessions, cycleId) => {
    if (!cycle) return null;
    
    const cycleRatings = finalRatings.filter((item) => item.review_cycle === cycleId);
    const cycleSessions = calibrationSessions.filter((item) => item.review_cycle === cycleId);
    
    const lockedRatings = cycleRatings.filter((item) => item.status === 'locked');
    const calibratedRatings = cycleRatings.filter((item) => item.status === 'calibrated');
    const pendingCalibration = cycleRatings.filter((item) => item.status === 'pending');
    
    return {
      totalRatings: cycleRatings.length,
      locked: lockedRatings.length,
      calibrated: calibratedRatings.length,
      pendingCalibration: pendingCalibration.length,
      sessions: cycleSessions.length,
      completedSessions: cycleSessions.filter((s) => s.status === 'completed').length,
      readiness: {
        isReady: lockedRatings.length > 0,
        percentage: cycleRatings.length > 0 
          ? (lockedRatings.length / cycleRatings.length) * 100 
          : 0,
        needsCalibration: pendingCalibration.length > 0,
      },
    };
  }
);

// Selector Factories
export const createCompetencySelector = (competencyId) => 
  createSelector(
    [(state) => state.reviews.competencies.items],
    (competencies) => competencies.find((item) => item.id === competencyId)
  );

export const createCycleSelector = (cycleId) =>
  createSelector(
    [selectAllCycles],
    (cycles) => cycles.find((item) => item.id === cycleId)
  );

export const createPIPSelector = (pipId) =>
  createSelector(
    [selectAllPIPs],
    (pips) => pips.find((item) => item.id === pipId)
  );

export const createRatingDistributionSelector = (cycleId) =>
  createSelector(
    [selectRatingDistribution],
    (distribution) => distribution?.filter((item) => item.cycle_id === cycleId) || []
  );