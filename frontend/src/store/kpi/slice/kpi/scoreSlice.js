import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    scores: {
        items: [],
        pagination: {
            count: 0,
            next: null,
            previous: null,
        },
        filters: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            kpi: '',
            user: '',
        },
        loading: false,
        error: null,
        statistics: {
            avgScore: 0,
            minScore: 0,
            maxScore: 0,
            greenCount: 0,
            yellowCount: 0,
            redCount: 0,
        },
    },
    aggregated: {
        items: [],
        organization: null,
        departments: [],
        teams: [],
        loading: false,
        error: null,
    },
    trafficLights: {
        items: [],
        redAlerts: [],
        loading: false,
    },
    myScores: {
        items: [],
        loading: false,
    },
    teamScores: {
        items: [],
        loading: false,
    },
};
const scoreSlice = createSlice({
    name: 'score',
    initialState,
    reducers: {
        // Scores
        fetchScoresStart: (state) => {
            state.scores.loading = true;
            state.scores.error = null;
        },
        fetchScoresSuccess: (state, action) => {
            state.scores.loading = false;
            state.scores.items = action.payload.results;
            state.scores.pagination = {
                count: action.payload.count,
                next: action.payload.next,
                previous: action.payload.previous,
            };
        },
        fetchScoresFailure: (state, action) => {
            state.scores.loading = false;
            state.scores.error = action.payload;
        },
        setScoreFilters: (state, action) => {
            state.scores.filters = { ...state.scores.filters, ...action.payload };
        },
        setScoreStatistics: (state, action) => {
            state.scores.statistics = action.payload;
        },
        // Aggregated scores
        fetchAggregatedScoresStart: (state) => {
            state.aggregated.loading = true;
        },
        fetchAggregatedScoresSuccess: (state, action) => {
            state.aggregated.loading = false;
            state.aggregated.items = action.payload;
            state.aggregated.organization = action.payload.find(s => s.level === 'ORGANIZATION');
            state.aggregated.departments = action.payload.filter(s => s.level === 'DEPARTMENT');
            state.aggregated.teams = action.payload.filter(s => s.level === 'TEAM');
        },
        fetchAggregatedScoresFailure: (state, action) => {
            state.aggregated.loading = false;
            state.aggregated.error = action.payload;
        },
        // Traffic lights
        fetchTrafficLightsStart: (state) => {
            state.trafficLights.loading = true;
        },
        fetchTrafficLightsSuccess: (state, action) => {
            state.trafficLights.loading = false;
            state.trafficLights.items = action.payload;
            state.trafficLights.redAlerts = action.payload.filter(
                t => t.status === 'RED' && t.consecutive_red_count >= 2
            );
        },
        fetchTrafficLightsFailure: (state) => {
            state.trafficLights.loading = false;
        },
        // My scores
        fetchMyScoresStart: (state) => {
            state.myScores.loading = true;
        },
        fetchMyScoresSuccess: (state, action) => {
            state.myScores.loading = false;
            state.myScores.items = action.payload;
        },
        fetchMyScoresFailure: (state) => {
            state.myScores.loading = false;
        },
        // Team scores
        fetchTeamScoresStart: (state) => {
            state.teamScores.loading = true;
        },
        fetchTeamScoresSuccess: (state, action) => {
            state.teamScores.loading = false;
            state.teamScores.items = action.payload;
        },
        fetchTeamScoresFailure: (state) => {
            state.teamScores.loading = false;
        },
        // Clear
        clearScores: (state) => {
            state.scores.items = [];
            state.scores.statistics = initialState.scores.statistics;
        },
        clearAggregated: (state) => {
            state.aggregated.items = [];
            state.aggregated.organization = null;
            state.aggregated.departments = [];
            state.aggregated.teams = [];
        },
    },
});
export const {
    fetchScoresStart,
    fetchScoresSuccess,
    fetchScoresFailure,
    setScoreFilters,
    setScoreStatistics,
    fetchAggregatedScoresStart,
    fetchAggregatedScoresSuccess,
    fetchAggregatedScoresFailure,
    fetchTrafficLightsStart,
    fetchTrafficLightsSuccess,
    fetchTrafficLightsFailure,
    fetchMyScoresStart,
    fetchMyScoresSuccess,
    fetchMyScoresFailure,
    fetchTeamScoresStart,
    fetchTeamScoresSuccess,
    fetchTeamScoresFailure,
    clearScores,
    clearAggregated,
} = scoreSlice.actions;
export default scoreSlice.reducer;