// ============================================
// frontend/src/contexts/reports/index.jsx
// ============================================

import React from 'react';
import { ReportUIProvider, useReportUI } from './ReportUIContext';
import { ReportFilterProvider, useReportFilterContext } from './ReportFilterContext';
import { ReportRealtimeProvider, useReportRealtimeContext } from './ReportRealtimeContext';
import { ReportBuilderProvider, useReportBuilder } from './ReportBuilderContext';

export {
    ReportUIProvider,
    useReportUI,
    ReportFilterProvider,
    useReportFilterContext,
    ReportRealtimeProvider,
    useReportRealtimeContext,
    ReportBuilderProvider,
    useReportBuilder,
};

/**
 * Composite ReportsProviders to wrap report module pages or routes
 */
export const ReportsProviders = ({ children }) => {
    return (
        <ReportRealtimeProvider>
            <ReportUIProvider>
                <ReportFilterProvider>
                    <ReportBuilderProvider>
                        {children}
                    </ReportBuilderProvider>
                </ReportFilterProvider>
            </ReportUIProvider>
        </ReportRealtimeProvider>
    );
};

export default ReportsProviders;
