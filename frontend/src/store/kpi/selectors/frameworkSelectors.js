// frontend/src/store/kpi/selectors/frameworkSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// ============================================
// Base Selectors
// ============================================
export const selectFrameworkState = (state) => state.framework || {
    sectors: { items: [], loading: false, error: null },
    frameworks: { items: [], loading: false, error: null },
    categories: { items: [], loading: false, error: null },
    templates: { items: [], loading: false, error: null },
    adminOverview: { data: null, loading: false, error: null },
    current: { framework: null, category: null, sector: null, template: null },
};

// ============================================
// Sectors
// ============================================
export const selectSectors = (state) => selectFrameworkState(state).sectors?.items || [];
export const selectSectorsLoading = (state) => selectFrameworkState(state).sectors?.loading || false;
export const selectSectorsError = (state) => selectFrameworkState(state).sectors?.error || null;

// ============================================
// Frameworks
// ============================================
export const selectFrameworks = (state) => selectFrameworkState(state).frameworks?.items || [];
export const selectFrameworksLoading = (state) => selectFrameworkState(state).frameworks?.loading || false;
export const selectFrameworksError = (state) => selectFrameworkState(state).frameworks?.error || null;

export const selectPublishedFrameworks = createSelector(
    [selectFrameworks],
    (frameworks) => frameworks.filter(fw => fw.status === 'PUBLISHED')
);

export const selectDraftFrameworks = createSelector(
    [selectFrameworks],
    (frameworks) => frameworks.filter(fw => fw.status === 'DRAFT')
);

export const selectArchivedFrameworks = createSelector(
    [selectFrameworks],
    (frameworks) => frameworks.filter(fw => fw.status === 'ARCHIVED')
);

export const selectFrameworksBySector = createSelector(
    [selectFrameworks, (state, sectorId) => sectorId],
    (frameworks, sectorId) => frameworks.filter(fw => fw.sector === sectorId)
);

// ============================================
// Categories
// ============================================
export const selectCategories = (state) => selectFrameworkState(state).categories?.items || [];
export const selectCategoriesLoading = (state) => selectFrameworkState(state).categories?.loading || false;
export const selectCategoriesError = (state) => selectFrameworkState(state).categories?.error || null;

export const selectCategoriesByFramework = createSelector(
    [selectCategories, (state, frameworkId) => frameworkId],
    (categories, frameworkId) => categories.filter(cat => cat.framework === frameworkId)
);

export const selectRootCategories = createSelector(
    [selectCategories],
    (categories) => categories.filter(cat => !cat.parent)
);

export const selectCategoryTree = createSelector(
    [selectCategories],
    (categories) => {
        const categoryMap = new Map();
        const roots = [];

        // First, map all categories by ID
        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        // Build the tree
        categories.forEach(cat => {
            const node = categoryMap.get(cat.id);
            if (cat.parent && categoryMap.has(cat.parent)) {
                categoryMap.get(cat.parent).children.push(node);
            } else {
                roots.push(node);
            }
        });

        return roots;
    }
);

// ============================================
// Templates
// ============================================
export const selectTemplates = (state) => selectFrameworkState(state).templates?.items || [];
export const selectTemplatesLoading = (state) => selectFrameworkState(state).templates?.loading || false;
export const selectTemplatesError = (state) => selectFrameworkState(state).templates?.error || null;

export const selectTemplatesBySector = createSelector(
    [selectTemplates, (state, sectorId) => sectorId],
    (templates, sectorId) => templates.filter(t => t.sector === sectorId)
);

export const selectPublishedTemplates = createSelector(
    [selectTemplates],
    (templates) => templates.filter(t => t.is_published)
);

// ============================================
// Current Selections
// ============================================
export const selectCurrentFramework = (state) => selectFrameworkState(state).current?.framework || null;
export const selectCurrentCategory = (state) => selectFrameworkState(state).current?.category || null;
export const selectCurrentSector = (state) => selectFrameworkState(state).current?.sector || null;
export const selectCurrentTemplate = (state) => selectFrameworkState(state).current?.template || null;

// ============================================
// Admin Overview
// ============================================
export const selectAdminOverview = (state) => selectFrameworkState(state).adminOverview?.data || null;
export const selectAdminOverviewLoading = (state) => selectFrameworkState(state).adminOverview?.loading || false;
export const selectAdminOverviewError = (state) => selectFrameworkState(state).adminOverview?.error || null;

// ============================================
// Derived Statistics
// ============================================
export const selectFrameworkStatistics = createSelector(
    [selectFrameworks],
    (frameworks) => ({
        total: frameworks.length,
        published: frameworks.filter(f => f.status === 'PUBLISHED').length,
        draft: frameworks.filter(f => f.status === 'DRAFT').length,
        archived: frameworks.filter(f => f.status === 'ARCHIVED').length,
    })
);

export const selectCategoryStatistics = createSelector(
    [selectCategories],
    (categories) => ({
        total: categories.length,
        withChildren: categories.filter(c => c.children_count > 0).length,
        rootLevel: categories.filter(c => !c.parent).length,
    })
);

export const selectTemplateStatistics = createSelector(
    [selectTemplates],
    (templates) => ({
        total: templates.length,
        published: templates.filter(t => t.is_published).length,
        totalUsage: templates.reduce((sum, t) => sum + (t.usage_count || 0), 0),
        avgUsage: templates.length > 0
            ? templates.reduce((sum, t) => sum + (t.usage_count || 0), 0) / templates.length
            : 0,
    })
);