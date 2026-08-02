// ============================================
// apps/reportplt/selectors/report.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    reports: [],
    currentReport: null,
    loading: false,
    loadingDetails: false,
    submitting: false,
    generating: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { report_type: null, status: null, category: null, is_published: null, is_archived: null, search: '' },
    types: [],
    statuses: [],
    categories: [],
    formats: [],
    myReports: [],
    publicReports: [],
    generationStatus: null,
    generationProgress: 0,
};

export const selectReportState = (state) => {
    return state?.report?.report || state?.reportplt?.report || state?.reports?.report || (state?.report?.reports ? state.report : null) || state?.report || initialState;
};

export const selectReportRoot = (state) => state?.reportplt || state?.reports || {};

export const selectReports = createSelector(
    [selectReportState],
    (state) => state.reports || []
);

export const selectCurrentReport = createSelector(
    [selectReportState],
    (state) => state.currentReport || null
);

export const selectMyReports = createSelector(
    [selectReportState],
    (state) => state.myReports || []
);

export const selectPublicReports = createSelector(
    [selectReportState],
    (state) => state.publicReports || []
);

export const selectReportLoading = createSelector(
    [selectReportState],
    (state) => state.loading || false
);

export const selectReportDetailsLoading = createSelector(
    [selectReportState],
    (state) => state.loadingDetails || false
);

export const selectReportSubmitting = createSelector(
    [selectReportState],
    (state) => state.submitting || false
);

export const selectReportGenerating = createSelector(
    [selectReportState],
    (state) => state.generating || false
);

export const selectReportError = createSelector(
    [selectReportState],
    (state) => state.error || null
);

export const selectReportPagination = createSelector(
    [selectReportState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectReportPage = createSelector(
    [selectReportState],
    (state) => state.pagination?.page || 1
);

export const selectReportPageSize = createSelector(
    [selectReportState],
    (state) => state.pagination?.pageSize || 20
);

export const selectReportTotal = createSelector(
    [selectReportState],
    (state) => state.pagination?.total || 0
);

export const selectReportTotalPages = createSelector(
    [selectReportPagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectReportFilters = createSelector(
    [selectReportState],
    (state) => state.filters || { report_type: null, status: null, category: null, is_published: null, is_archived: null, search: '' }
);

export const selectReportById = createSelector(
    [selectReports, (state, id) => id],
    (reports, id) => reports.find(r => r.id === id) || null
);

export const selectReportsByType = createSelector(
    [selectReports, (state, type) => type],
    (reports, type) => reports.filter(r => r.report_type === type)
);

export const selectReportsByStatus = createSelector(
    [selectReports, (state, status) => status],
    (reports, status) => reports.filter(r => r.status === status)
);

export const selectReportsByCategory = createSelector(
    [selectReports, (state, category) => category],
    (reports, category) => reports.filter(r => r.category === category)
);

export const selectPublishedReports = createSelector(
    [selectReports],
    (reports) => reports.filter(r => r.is_published === true)
);

export const selectArchivedReports = createSelector(
    [selectReports],
    (reports) => reports.filter(r => r.is_archived === true)
);

export const selectActiveReports = createSelector(
    [selectReports],
    (reports) => reports.filter(r => r.is_archived === false && r.is_deleted === false)
);

export const selectReportCount = createSelector(
    [selectReports],
    (reports) => reports.length
);

export const selectPublishedReportCount = createSelector(
    [selectPublishedReports],
    (published) => published.length
);

export const selectHasReports = createSelector(
    [selectReports],
    (reports) => reports.length > 0
);

export const selectIsReportLoading = createSelector(
    [selectReportLoading],
    (loading) => loading
);

export const selectHasReportError = createSelector(
    [selectReportError],
    (error) => error !== null
);

export const selectReportGenerationStatus = createSelector(
    [selectReportState],
    (state) => state.generationStatus || null
);

export const selectReportGenerationProgress = createSelector(
    [selectReportState],
    (state) => state.generationProgress || 0
);

export const selectReportTypes = createSelector(
    [selectReportState],
    (state) => state.types || []
);

export const selectReportStatuses = createSelector(
    [selectReportState],
    (state) => state.statuses || []
);

export const selectReportCategories = createSelector(
    [selectReportState],
    (state) => state.categories || []
);

export const selectReportFormats = createSelector(
    [selectReportState],
    (state) => state.formats || []
);

// ============================================
// DOMAIN-SPECIFIC REPORT SELECTORS (7 APPS)
// ============================================

export const selectReportsByDomain = createSelector(
    [selectReports, (state, domain) => domain],
    (reports, domain) => {
        if (!domain) return reports;
        return reports.filter(r => {
            const type = (r.report_type || '').toLowerCase();
            const source = (r.data_source || '').toLowerCase();
            return type.startsWith(domain.toLowerCase() + '_') || source === domain.toLowerCase();
        });
    }
);

export const selectConfigsReports = createSelector(
    [selectReports],
    (reports) => reports.filter(r => (r.report_type || '').startsWith('configs_') || ['configs_system', 'backup_audit', 'dr_compliance', 'health_sla', 'maintenance_audit', 'kms_security', 'system_audit', 'tenant_quota', 'risk_matrix'].includes(r.report_type))
);

export const selectTenantReports = createSelector(
    [selectReports],
    (reports) => reports.filter(r => (r.report_type || '').startsWith('tenant_'))
);

export const selectKpiReports = createSelector(
    [selectReports],
    (reports) => reports.filter(r => (r.report_type || '').startsWith('kpi_') || r.report_type === 'kpi')
);

export const selectStructureReports = createSelector(
    [selectReports],
    (reports) => reports.filter(r => (r.report_type || '').startsWith('structure_'))
);

export const selectAccountsReports = createSelector(
    [selectReports],
    (reports) => reports.filter(r => (r.report_type || '').startsWith('accounts_'))
);

export const selectBillingReports = createSelector(
    [selectReports],
    (reports) => reports.filter(r => (r.report_type || '').startsWith('billing_'))
);

export const selectReviewsReports = createSelector(
    [selectReports],
    (reports) => reports.filter(r => (r.report_type || '').startsWith('reviews_'))
);