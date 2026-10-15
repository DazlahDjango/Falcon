// ============================================
// frontend/src/providers/ReportProviders.jsx
// ============================================

import React from 'react';
import { ReportRealtimeProvider } from '../contexts/reports/ReportRealtimeContext';
import { ReportUIProvider } from '../contexts/reports/ReportUIContext';
import { ReportFilterProvider } from '../contexts/reports/ReportFilterContext';
import { ReportBuilderProvider } from '../contexts/reports/ReportBuilderContext';

/**
 * Self-contained reports providers — wire in reports.routes or root provider as needed.
 */
export const ReportProviders = ({ children }) => (
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

export const ReportsProviders = ReportProviders;

export default ReportProviders;
