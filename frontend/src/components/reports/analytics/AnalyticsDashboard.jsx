// frontend/src/components/reports/analytics/AnalyticsDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiTrendingUp,
    FiBarChart2,
    FiGitBranch,
    FiCpu,
    FiAlertTriangle,
    FiRefreshCw,
} from 'react-icons/fi';
import { useAnalytics, useReports } from '../../../hooks/reports';
import { ReportLoading, ReportError } from '../common';
import { AnalyticsFilters } from './AnalyticsFilters';
import { TrendAnalysis } from './TrendAnalysis';
import { PerformanceAnalysis } from './PerformanceAnalysis';
import { ComparativeAnalysis } from './ComparativeAnalysis';
import { PredictiveAnalysis } from './PredictiveAnalysis';
import { AnomalyDetection } from './AnomalyDetection';
import './analytics.css';

export const AnalyticsDashboard = () => {
    const navigate = useNavigate();
    const [selectedTab, setSelectedTab] = useState('trend');
    const [selectedReport, setSelectedReport] = useState('');

    const {
        fetchList: fetchReports,
        reports,
        loading: reportsLoading,
    } = useReports({ autoFetch: false });

    const {
        trend,
        performance,
        comparative,
        predictive,
        anomaly,
        loading,
        generating,
        error,
        runTrend,
        runPerformance,
        runComparative,
        runPredictive,
        runAnomaly,
        clearErrors,
    } = useAnalytics();

    const [filters, setFilters] = useState({
        period: 'monthly',
        metric: 'progress',
        compare_by: 'department',
        group_by: 'department',
        prediction_type: 'linear',
        periods_ahead: 3,
        confidence: 0.95,
        detection_type: 'zscore',
        threshold: 2.0,
        window_size: 30,
    });

    React.useEffect(() => {
        fetchReports({ pageSize: 100 });
    }, [fetchReports]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleAnalyze = () => {
        if (!selectedReport) return;

        const baseParams = {
            report_id: selectedReport,
            params: { period: filters.period },
        };

        switch (selectedTab) {
            case 'trend':
                runTrend({
                    ...baseParams,
                    metric: filters.metric,
                    compare_by: filters.compare_by,
                    periods: 12,
                });
                break;
            case 'performance':
                runPerformance({
                    ...baseParams,
                    metric: filters.metric,
                    group_by: filters.group_by,
                    threshold: 80,
                });
                break;
            case 'comparative':
                runComparative({
                    ...baseParams,
                    compare_type: filters.compare_by,
                    compare_ids: [],
                    metric: filters.metric,
                });
                break;
            case 'predictive':
                runPredictive({
                    ...baseParams,
                    prediction_type: filters.prediction_type,
                    periods_ahead: filters.periods_ahead,
                    confidence: filters.confidence,
                });
                break;
            case 'anomaly':
                runAnomaly({
                    ...baseParams,
                    detection_type: filters.detection_type,
                    threshold: filters.threshold,
                    window_size: filters.window_size,
                });
                break;
            default:
                break;
        }
    };

    const tabs = [
        { id: 'trend', label: 'Trend Analysis', icon: FiTrendingUp },
        { id: 'performance', label: 'Performance', icon: FiBarChart2 },
        { id: 'comparative', label: 'Comparative', icon: FiGitBranch },
        { id: 'predictive', label: 'Predictive', icon: FiCpu },
        { id: 'anomaly', label: 'Anomaly Detection', icon: FiAlertTriangle },
    ];

    const renderContent = () => {
        if (loading || generating) {
            return <ReportLoading variant="spinner" text="Analyzing data..." />;
        }

        if (error) {
            return (
                <ReportError
                    error={error}
                    onRetry={() => {
                        clearErrors();
                        handleAnalyze();
                    }}
                    title="Analysis failed"
                />
            );
        }

        switch (selectedTab) {
            case 'trend':
                return <TrendAnalysis data={trend} loading={loading} />;
            case 'performance':
                return <PerformanceAnalysis data={performance} loading={loading} />;
            case 'comparative':
                return <ComparativeAnalysis data={comparative} loading={loading} />;
            case 'predictive':
                return <PredictiveAnalysis data={predictive} loading={loading} />;
            case 'anomaly':
                return <AnomalyDetection data={anomaly} loading={loading} />;
            default:
                return null;
        }
    };

    return (
        <div className="analytics-dashboard">
            <div className="analytics-header">
                <h1 className="page-title">Analytics Dashboard</h1>
                <button
                    className="btn btn-outline"
                    onClick={() => {
                        if (selectedReport) handleAnalyze();
                    }}
                    disabled={!selectedReport || generating}
                >
                    <FiRefreshCw size={16} className={generating ? 'spinning' : ''} />
                    {generating ? 'Analyzing...' : 'Refresh'}
                </button>
            </div>

            <div className="analytics-tabs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`tab-btn ${selectedTab === tab.id ? 'active' : ''}`}
                            onClick={() => setSelectedTab(tab.id)}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <AnalyticsFilters
                filters={filters}
                reports={reports}
                selectedReport={selectedReport}
                onFilterChange={handleFilterChange}
                onReportChange={setSelectedReport}
                onAnalyze={handleAnalyze}
                tab={selectedTab}
                loading={reportsLoading}
            />

            <div className="analytics-content">
                {renderContent()}
            </div>
        </div>
    );
};