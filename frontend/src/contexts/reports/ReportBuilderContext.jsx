// ============================================
// frontend/src/contexts/reports/ReportBuilderContext.jsx
// ============================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ReportBuilderContext = createContext(null);

const initialDraftState = {
    title: '',
    description: '',
    report_type: '',
    domain: 'general',
    category: 'operational',
    default_format: 'pdf',
    sensitivity_level: 'internal',
    parameters: {},
    selected_columns: [],
    aggregations: [],
    group_by: [],
    sort_fields: [],
    chart_config: {
        type: 'bar',
        xAxis: '',
        yAxis: '',
        colorScheme: 'default',
    },
    filter_rules: [],
    is_public: false,
    tags: [],
};

export const ReportBuilderProvider = ({ children, initialDraft = null }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [draft, setDraft] = useState(initialDraft ? { ...initialDraftState, ...initialDraft } : initialDraftState);
    const [isDirty, setIsDirty] = useState(false);
    const [errors, setErrors] = useState({});

    const updateField = useCallback((field, value) => {
        setDraft(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        if (errors[field]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    }, [errors]);

    const updateSection = useCallback((section, data) => {
        setDraft(prev => ({
            ...prev,
            [section]: {
                ...(typeof prev[section] === 'object' && !Array.isArray(prev[section]) ? prev[section] : {}),
                ...data,
            }
        }));
        setIsDirty(true);
    }, []);

    const toggleColumn = useCallback((columnId) => {
        setDraft(prev => {
            const exists = prev.selected_columns.includes(columnId);
            const selected_columns = exists
                ? prev.selected_columns.filter(c => c !== columnId)
                : [...prev.selected_columns, columnId];
            return { ...prev, selected_columns };
        });
        setIsDirty(true);
    }, []);

    const setColumns = useCallback((columns) => {
        setDraft(prev => ({ ...prev, selected_columns: columns }));
        setIsDirty(true);
    }, []);

    const addFilterRule = useCallback((rule) => {
        setDraft(prev => ({
            ...prev,
            filter_rules: [...prev.filter_rules, rule]
        }));
        setIsDirty(true);
    }, []);

    const removeFilterRule = useCallback((index) => {
        setDraft(prev => ({
            ...prev,
            filter_rules: prev.filter_rules.filter((_, i) => i !== index)
        }));
        setIsDirty(true);
    }, []);

    const nextStep = useCallback(() => {
        setCurrentStep(prev => prev + 1);
    }, []);

    const prevStep = useCallback(() => {
        setCurrentStep(prev => Math.max(1, prev - 1));
    }, []);

    const goToStep = useCallback((step) => {
        setCurrentStep(step);
    }, []);

    const resetDraft = useCallback(() => {
        setDraft(initialDraftState);
        setCurrentStep(1);
        setIsDirty(false);
        setErrors({});
    }, []);

    const loadDraft = useCallback((existingReport) => {
        setDraft({ ...initialDraftState, ...existingReport });
        setCurrentStep(1);
        setIsDirty(false);
        setErrors({});
    }, []);

    const validateStep = useCallback((step) => {
        const stepErrors = {};
        if (step === 1) {
            if (!draft.title?.trim()) stepErrors.title = 'Report title is required';
            if (!draft.report_type) stepErrors.report_type = 'Report type is required';
        }
        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    }, [draft]);

    const value = useMemo(() => ({
        currentStep,
        draft,
        isDirty,
        errors,
        updateField,
        updateSection,
        toggleColumn,
        setColumns,
        addFilterRule,
        removeFilterRule,
        nextStep,
        prevStep,
        goToStep,
        resetDraft,
        loadDraft,
        validateStep,
    }), [
        currentStep,
        draft,
        isDirty,
        errors,
        updateField,
        updateSection,
        toggleColumn,
        setColumns,
        addFilterRule,
        removeFilterRule,
        nextStep,
        prevStep,
        goToStep,
        resetDraft,
        loadDraft,
        validateStep,
    ]);

    return (
        <ReportBuilderContext.Provider value={value}>
            {children}
        </ReportBuilderContext.Provider>
    );
};

export const useReportBuilder = () => {
    const context = useContext(ReportBuilderContext);
    if (!context) {
        throw new Error('useReportBuilder must be used within a ReportBuilderProvider');
    }
    return context;
};

export default ReportBuilderContext;
