// ============================================
// frontend/src/contexts/reports/ReportUIContext.jsx
// ============================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ReportUIContext = createContext(null);

export const ReportUIProvider = ({ children }) => {
    // Modal states
    const [exportModal, setExportModal] = useState({ isOpen: false, report: null, defaultFormat: 'pdf' });
    const [shareModal, setShareModal] = useState({ isOpen: false, report: null });
    const [scheduleModal, setScheduleModal] = useState({ isOpen: false, report: null });
    const [distributionModal, setDistributionModal] = useState({ isOpen: false, report: null });
    const [presetModal, setPresetModal] = useState({ isOpen: false, report: null, preset: null });
    const [filterDrawer, setFilterDrawer] = useState({ isOpen: false });
    const [previewDrawer, setPreviewDrawer] = useState({ isOpen: false, report: null, execution: null });
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, itemType: 'report', onConfirm: null });

    // View Preferences
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'cards'
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

    // Modal handlers
    const openExportModal = useCallback((report, defaultFormat = 'pdf') => {
        setExportModal({ isOpen: true, report, defaultFormat });
    }, []);

    const closeExportModal = useCallback(() => {
        setExportModal({ isOpen: false, report: null, defaultFormat: 'pdf' });
    }, []);

    const openShareModal = useCallback((report) => {
        setShareModal({ isOpen: true, report });
    }, []);

    const closeShareModal = useCallback(() => {
        setShareModal({ isOpen: false, report: null });
    }, []);

    const openScheduleModal = useCallback((report) => {
        setScheduleModal({ isOpen: true, report });
    }, []);

    const closeScheduleModal = useCallback(() => {
        setScheduleModal({ isOpen: false, report: null });
    }, []);

    const openDistributionModal = useCallback((report) => {
        setDistributionModal({ isOpen: true, report });
    }, []);

    const closeDistributionModal = useCallback(() => {
        setDistributionModal({ isOpen: false, report: null });
    }, []);

    const openPresetModal = useCallback((report, preset = null) => {
        setPresetModal({ isOpen: true, report, preset });
    }, []);

    const closePresetModal = useCallback(() => {
        setPresetModal({ isOpen: false, report: null, preset: null });
    }, []);

    const openFilterDrawer = useCallback(() => setFilterDrawer({ isOpen: true }), []);
    const closeFilterDrawer = useCallback(() => setFilterDrawer({ isOpen: false }), []);
    const toggleFilterDrawer = useCallback(() => setFilterDrawer(prev => ({ isOpen: !prev.isOpen })), []);

    const openPreviewDrawer = useCallback((report, execution = null) => {
        setPreviewDrawer({ isOpen: true, report, execution });
    }, []);

    const closePreviewDrawer = useCallback(() => {
        setPreviewDrawer({ isOpen: false, report: null, execution: null });
    }, []);

    const openDeleteModal = useCallback((item, itemType = 'report', onConfirm = null) => {
        setDeleteModal({ isOpen: true, item, itemType, onConfirm });
    }, []);

    const closeDeleteModal = useCallback(() => {
        setDeleteModal({ isOpen: false, item: null, itemType: 'report', onConfirm: null });
    }, []);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev);
    }, []);

    const value = useMemo(() => ({
        // Modal states
        exportModal,
        shareModal,
        scheduleModal,
        distributionModal,
        presetModal,
        filterDrawer,
        previewDrawer,
        deleteModal,

        // View preferences
        viewMode,
        isFullscreen,
        activeTab,

        // Modal triggers
        openExportModal,
        closeExportModal,
        openShareModal,
        closeShareModal,
        openScheduleModal,
        closeScheduleModal,
        openDistributionModal,
        closeDistributionModal,
        openPresetModal,
        closePresetModal,
        openFilterDrawer,
        closeFilterDrawer,
        toggleFilterDrawer,
        openPreviewDrawer,
        closePreviewDrawer,
        openDeleteModal,
        closeDeleteModal,

        // View triggers
        setViewMode,
        setIsFullscreen,
        toggleFullscreen,
        setActiveTab,
    }), [
        exportModal,
        shareModal,
        scheduleModal,
        distributionModal,
        presetModal,
        filterDrawer,
        previewDrawer,
        deleteModal,
        viewMode,
        isFullscreen,
        activeTab,
        openExportModal,
        closeExportModal,
        openShareModal,
        closeShareModal,
        openScheduleModal,
        closeScheduleModal,
        openDistributionModal,
        closeDistributionModal,
        openPresetModal,
        closePresetModal,
        openFilterDrawer,
        closeFilterDrawer,
        toggleFilterDrawer,
        openPreviewDrawer,
        closePreviewDrawer,
        openDeleteModal,
        closeDeleteModal,
        toggleFullscreen,
    ]);

    return (
        <ReportUIContext.Provider value={value}>
            {children}
        </ReportUIContext.Provider>
    );
};

export const useReportUI = () => {
    const context = useContext(ReportUIContext);
    if (!context) {
        throw new Error('useReportUI must be used within a ReportUIProvider');
    }
    return context;
};

export default ReportUIContext;
