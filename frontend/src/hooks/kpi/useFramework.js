import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    // Sectors
    fetchSectors,
    fetchSectorById,
    createSector,
    updateSector,
    deleteSector,
    // Frameworks
    fetchFrameworks,
    fetchFrameworkById,
    createFramework,
    updateFramework,
    deleteFramework,
    publishFramework,
    archiveFramework,
    duplicateFramework,
    // Categories
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    reorderCategories,
    // Templates
    fetchTemplates,
    fetchTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    publishTemplate,
    useTemplate,
    // Admin Overview
    fetchAdminOverview,
    // Selectors
    setCurrentFramework,
    setCurrentCategory,
    setCurrentSector,
    setCurrentTemplate,
    clearCurrent,
} from '../../store/kpi/slice/kpi/frameworkSlice';
import {
    selectSectors,
    selectSectorsLoading,
    selectSectorsError,
    selectFrameworks,
    selectFrameworksLoading,
    selectFrameworksError,
    selectCategories,
    selectCategoriesLoading,
    selectCategoriesError,
    selectTemplates,
    selectTemplatesLoading,
    selectTemplatesError,
    selectCurrentFramework,
    selectCurrentCategory,
    selectCurrentSector,
    selectPublishedFrameworks,
    selectDraftFrameworks,
    selectArchivedFrameworks,
    selectCategoriesByFramework,
    selectCategoryTree,
    selectPublishedTemplates,
    selectAdminOverview,
    selectAdminOverviewLoading,
} from '../../store/kpi/selectors/frameworkSelectors';

// ============ SECTORS HOOK ============
export const useSectors = (autoFetch = true) => {
    const dispatch = useDispatch();
    const sectors = useSelector(selectSectors);
    const loading = useSelector(selectSectorsLoading);
    const error = useSelector(selectSectorsError);
    const currentSector = useSelector(selectCurrentSector);

    const fetchAll = useCallback(() => {
        return dispatch(fetchSectors()).unwrap();
    }, [dispatch]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchSectorById(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createSector(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateSector({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteSector(id)).unwrap();
    }, [dispatch]);

    const setCurrent = useCallback((sector) => {
        dispatch(setCurrentSector(sector));
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchAll();
        }
    }, [autoFetch, fetchAll]);

    return {
        sectors,
        loading,
        error,
        currentSector,
        fetchAll,
        fetchById,
        create,
        update,
        delete: remove,
        setCurrent,
    };
};

// ============ FRAMEWORKS HOOK ============
export const useFrameworks = (autoFetch = true, initialParams = {}) => {
    const dispatch = useDispatch();
    const frameworks = useSelector(selectFrameworks);
    const loading = useSelector(selectFrameworksLoading);
    const error = useSelector(selectFrameworksError);
    const currentFramework = useSelector(selectCurrentFramework);
    const publishedFrameworks = useSelector(selectPublishedFrameworks);
    const draftFrameworks = useSelector(selectDraftFrameworks);
    const archivedFrameworks = useSelector(selectArchivedFrameworks);

    const fetchAll = useCallback((params = {}) => {
        return dispatch(fetchFrameworks(params)).unwrap();
    }, [dispatch]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchFrameworkById(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createFramework(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateFramework({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteFramework(id)).unwrap();
    }, [dispatch]);

    const publish = useCallback((id) => {
        return dispatch(publishFramework(id)).unwrap();
    }, [dispatch]);

    const archive = useCallback((id) => {
        return dispatch(archiveFramework(id)).unwrap();
    }, [dispatch]);

    const duplicate = useCallback((id) => {
        return dispatch(duplicateFramework(id)).unwrap();
    }, [dispatch]);

    const setCurrent = useCallback((framework) => {
        dispatch(setCurrentFramework(framework));
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchAll(initialParams);
        }
    }, [autoFetch, fetchAll, initialParams]);

    return {
        frameworks,
        loading,
        error,
        currentFramework,
        publishedFrameworks,
        draftFrameworks,
        archivedFrameworks,
        fetchAll,
        fetchById,
        create,
        update,
        delete: remove,
        publish,
        archive,
        duplicate,
        setCurrent,
    };
};

// ============ CATEGORIES HOOK ============
export const useCategories = (autoFetch = true, initialParams = {}) => {
    const dispatch = useDispatch();
    const categories = useSelector(selectCategories);
    const loading = useSelector(selectCategoriesLoading);
    const error = useSelector(selectCategoriesError);
    const currentCategory = useSelector(selectCurrentCategory);
    const categoryTree = useSelector(selectCategoryTree);

    const fetchAll = useCallback((params = {}) => {
        return dispatch(fetchCategories(params)).unwrap();
    }, [dispatch]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchCategoryById(id)).unwrap();
    }, [dispatch]);

    const fetchByFramework = useCallback((frameworkId) => {
        return dispatch(fetchCategories({ framework: frameworkId })).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createCategory(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateCategory({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteCategory(id)).unwrap();
    }, [dispatch]);

    const move = useCallback((id, parentId) => {
        return dispatch(moveCategory({ id, parentId })).unwrap();
    }, [dispatch]);

    const reorder = useCallback((categories) => {
        return dispatch(reorderCategories(categories)).unwrap();
    }, [dispatch]);

    const setCurrent = useCallback((category) => {
        dispatch(setCurrentCategory(category));
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchAll(initialParams);
        }
    }, [autoFetch, fetchAll, initialParams]);

    return {
        categories,
        loading,
        error,
        currentCategory,
        categoryTree,
        fetchAll,
        fetchById,
        fetchByFramework,
        create,
        update,
        delete: remove,
        move,
        reorder,
        setCurrent,
    };
};

// ============ TEMPLATES HOOK ============
export const useTemplates = (autoFetch = true, initialParams = {}) => {
    const dispatch = useDispatch();
    const templates = useSelector(selectTemplates);
    const loading = useSelector(selectTemplatesLoading);
    const error = useSelector(selectTemplatesError);
    const currentTemplate = useSelector((state) => state.framework?.current?.template);
    const publishedTemplates = useSelector(selectPublishedTemplates);

    const fetchAll = useCallback((params = {}) => {
        return dispatch(fetchTemplates(params)).unwrap();
    }, [dispatch]);

    const fetchById = useCallback((id) => {
        return dispatch(fetchTemplateById(id)).unwrap();
    }, [dispatch]);

    const create = useCallback((data) => {
        return dispatch(createTemplate(data)).unwrap();
    }, [dispatch]);

    const update = useCallback((id, data) => {
        return dispatch(updateTemplate({ id, data })).unwrap();
    }, [dispatch]);

    const remove = useCallback((id) => {
        return dispatch(deleteTemplate(id)).unwrap();
    }, [dispatch]);

    const publish = useCallback((id) => {
        return dispatch(publishTemplate(id)).unwrap();
    }, [dispatch]);

    const use = useCallback((id, frameworkId) => {
        return dispatch(useTemplate({ id, frameworkId })).unwrap();
    }, [dispatch]);

    const setCurrent = useCallback((template) => {
        dispatch(setCurrentTemplate(template));
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchAll(initialParams);
        }
    }, [autoFetch, fetchAll, initialParams]);

    return {
        templates,
        loading,
        error,
        currentTemplate,
        publishedTemplates,
        fetchAll,
        fetchById,
        create,
        update,
        delete: remove,
        publish,
        use,
        setCurrent,
    };
};

// ============ ADMIN OVERVIEW HOOK ============
export const useAdminOverview = (autoFetch = true) => {
    const dispatch = useDispatch();
    const data = useSelector(selectAdminOverview);
    const loading = useSelector(selectAdminOverviewLoading);
    const error = useSelector((state) => state.framework?.adminOverview?.error);

    const fetchOverview = useCallback(() => {
        return dispatch(fetchAdminOverview()).unwrap();
    }, [dispatch]);

    useEffect(() => {
        if (autoFetch) {
            fetchOverview();
        }
    }, [autoFetch, fetchOverview]);

    return {
        data,
        loading,
        error,
        fetchOverview,
    };
};

// ============ COMBINED ADMIN HOOK ============
export const useFrameworkAdmin = () => {
    const sectors = useSectors(false);
    const frameworks = useFrameworks(false);
    const categories = useCategories(false);
    const templates = useTemplates(false);
    const adminOverview = useAdminOverview(false);

    const refreshAll = useCallback(async () => {
        await Promise.all([
            sectors.fetchAll(),
            frameworks.fetchAll(),
            categories.fetchAll(),
            templates.fetchAll(),
        ]);
    }, [sectors, frameworks, categories, templates]);

    const refreshBySector = useCallback(async (sectorId) => {
        await Promise.all([
            frameworks.fetchAll({ sector: sectorId }),
            templates.fetchAll({ sector: sectorId }),
        ]);
    }, [frameworks, templates]);

    const refreshByFramework = useCallback(async (frameworkId) => {
        await Promise.all([
            categories.fetchAll({ framework: frameworkId }),
            frameworks.fetchById(frameworkId),
        ]);
    }, [categories, frameworks]);

    return {
        sectors,
        frameworks,
        categories,
        templates,
        adminOverview,
        refreshAll,
        refreshBySector,
        refreshByFramework,
    };
};

// Re-export selectors for convenience
export {
    selectSectors,
    selectFrameworks,
    selectCategories,
    selectTemplates,
    selectPublishedFrameworks,
    selectDraftFrameworks,
    selectArchivedFrameworks,
    selectCategoryTree,
    selectPublishedTemplates,
};