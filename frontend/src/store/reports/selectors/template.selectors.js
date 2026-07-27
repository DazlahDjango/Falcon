// ============================================
// apps/reportplt/selectors/template.selectors.js
// ============================================

import { createSelector } from '@reduxjs/toolkit';

const initialState = {
    templates: [],
    currentTemplate: null,
    prebuiltTemplates: [],
    defaultTemplates: [],
    popularTemplates: [],
    loading: false,
    loadingDetails: false,
    submitting: false,
    error: null,
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    filters: { template_type: null, sector: null, category: null, is_published: null, is_system: null, is_default: null, search: '' },
    types: [],
};

export const selectTemplateState = (state) => {
    return state?.template || state?.reports?.template || state?.reportplt?.template || initialState;
};

export const selectTemplates = createSelector(
    [selectTemplateState],
    (state) => state.templates || []
);

export const selectCurrentTemplate = createSelector(
    [selectTemplateState],
    (state) => state.currentTemplate || null
);

export const selectPrebuiltTemplates = createSelector(
    [selectTemplateState],
    (state) => state.prebuiltTemplates || []
);

export const selectDefaultTemplates = createSelector(
    [selectTemplateState],
    (state) => state.defaultTemplates || []
);

export const selectPopularTemplates = createSelector(
    [selectTemplateState],
    (state) => state.popularTemplates || []
);

export const selectTemplateLoading = createSelector(
    [selectTemplateState],
    (state) => state.loading || false
);

export const selectTemplateDetailsLoading = createSelector(
    [selectTemplateState],
    (state) => state.loadingDetails || false
);

export const selectTemplateSubmitting = createSelector(
    [selectTemplateState],
    (state) => state.submitting || false
);

export const selectTemplateError = createSelector(
    [selectTemplateState],
    (state) => state.error || null
);

export const selectTemplatePagination = createSelector(
    [selectTemplateState],
    (state) => state.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 0 }
);

export const selectTemplatePage = createSelector(
    [selectTemplateState],
    (state) => state.pagination?.page || 1
);

export const selectTemplatePageSize = createSelector(
    [selectTemplateState],
    (state) => state.pagination?.pageSize || 20
);

export const selectTemplateTotal = createSelector(
    [selectTemplateState],
    (state) => state.pagination?.total || 0
);

export const selectTemplateTotalPages = createSelector(
    [selectTemplatePagination],
    ({ total, pageSize }) => Math.ceil(total / pageSize) || 1
);

export const selectTemplateFilters = createSelector(
    [selectTemplateState],
    (state) => state.filters || { template_type: null, sector: null, category: null, is_published: null, is_system: null, is_default: null, search: '' }
);

export const selectTemplateById = createSelector(
    [selectTemplates, (state, id) => id],
    (templates, id) => templates.find(t => t.id === id) || null
);

export const selectTemplatesByType = createSelector(
    [selectTemplates, (state, type) => type],
    (templates, type) => templates.filter(t => t.template_type === type)
);

export const selectTemplatesBySector = createSelector(
    [selectTemplates, (state, sector) => sector],
    (templates, sector) => templates.filter(t => t.sector === sector || t.sector === 'all')
);

export const selectSystemTemplates = createSelector(
    [selectTemplates],
    (templates) => templates.filter(t => t.is_system === true)
);

export const selectPublishedTemplates = createSelector(
    [selectTemplates],
    (templates) => templates.filter(t => t.is_published === true)
);

export const selectDefaultTemplatesList = createSelector(
    [selectTemplates],
    (templates) => templates.filter(t => t.is_default === true)
);

export const selectTemplateCount = createSelector(
    [selectTemplates],
    (templates) => templates.length
);

export const selectHasTemplates = createSelector(
    [selectTemplates],
    (templates) => templates.length > 0
);

export const selectIsTemplateLoading = createSelector(
    [selectTemplateLoading],
    (loading) => loading
);

export const selectHasTemplateError = createSelector(
    [selectTemplateError],
    (error) => error !== null
);

export const selectTemplateTypes = createSelector(
    [selectTemplateState],
    (state) => state.types || []
);