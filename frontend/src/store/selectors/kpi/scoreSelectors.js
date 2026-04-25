import { createSelector } from '@reduxjs/toolkit';

const selectScoreState = (state) => state.score;
const selectScoresState = (state) => state.score.scores;
const selectAggregatedState = (state) => state.score.aggregated;
const selectTrafficLightsState = (state) => state.score.trafficLights;
// Scores selectors
export const selectScores = createSelector(
    [selectScoresState],
    (scores) => scores.items
);
export const selectScoresLoading = createSelector(
    [selectScoresState],
    (scores) => scores.loading
);
export const selectScoresError = createSelector(
    [selectScoresState],
    (scores) => scores.error
);
export const selectScoreStatistics = createSelector(
    [selectScoresState],
    (scores) => scores.statistics
);
// Aggregated scores selectors
export const selectAggregatedScores = createSelector(
    [selectAggregatedState],
    (aggregated) => aggregated.items
);
export const selectOrganizationHealth = createSelector(
    [selectAggregatedState],
    (aggregated) => aggregated.organization
);
export const selectDepartmentScores = createSelector(
    [selectAggregatedState],
    (aggregated) => aggregated.departments
);
export const selectTeamScores = createSelector(
    [selectAggregatedState],
    (aggregated) => aggregated.teams
);
export const selectAggregatedLoading = createSelector(
    [selectAggregatedState],
    (aggregated) => aggregated.loading
);
// Traffic lights selectors
export const selectTrafficLights = createSelector(
    [selectTrafficLightsState],
    (lights) => lights.items
);
export const selectRedAlerts = createSelector(
    [selectTrafficLightsState],
    (lights) => lights.redAlerts
);
export const selectTrafficLightsLoading = createSelector(
    [selectTrafficLightsState],
    (lights) => lights.loading
);
// Computed selectors
export const selectScoresByPeriod = (year, month) => createSelector(
    [selectScores],
    (scores) => scores.filter(s => s.year === year && s.month === month)
);
export const selectScoresByKPI = (kpiId) => createSelector(
    [selectScores],
    (scores) => scores.filter(s => s.kpiId === kpiId)
);
export const selectScoresByUser = (userId) => createSelector(
    [selectScores],
    (scores) => scores.filter(s => s.userId === userId)
);
export const selectAverageScore = createSelector(
    [selectScores],
    (scores) => {
        if (!scores.length) return 0;
        const sum = scores.reduce((acc, s) => acc + s.score, 0);
        return sum / scores.length;
    }
);
export const selectScoreDistribution = createSelector(
    [selectScores],
    (scores) => {
        return {
            green: scores.filter(s => s.score >= 90).length,
            yellow: scores.filter(s => s.score >= 50 && s.score < 90).length,
            red: scores.filter(s => s.score < 50).length,
        };
    }
);
export const selectTopPerformers = (limit = 10) => createSelector(
    [selectScores],
    (scores) => {
        const userScores = scores.reduce((acc, s) => {
            if (!acc[s.userId]) acc[s.userId] = { userId: s.userId, scores: [], userName: s.userName };
            acc[s.userId].scores.push(s.score);
            return acc;
        }, {});
        
        const averages = Object.values(userScores).map(u => ({
            userId: u.userId,
            userName: u.userName,
            averageScore: u.scores.reduce((a, b) => a + b, 0) / u.scores.length
        }));
        
        return averages.sort((a, b) => b.averageScore - a.averageScore).slice(0, limit);
    }
);