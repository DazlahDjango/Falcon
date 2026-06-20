// src/components/reviews/reviewAnalytics/ReviewAnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import './analytics.css';
import ReviewAnalyticsFilters from './ReviewAnalyticsFilters';
import ReviewCompanyAnalytics from './ReviewCompanyAnalytics';
import ReviewScoreTrendChart from './ReviewScoreTrendChart';
import ReviewRatingDistributionChart from './ReviewRatingDistributionChart';
import ReviewDepartmentComparison from './ReviewDepartmentComparison';
import ReviewManagerAnalytics from './ReviewManagerAnalytics';
import ReviewHighRiskList from './ReviewHighRiskList';
import ReviewInsightsPanel from './ReviewInsightsPanel';
import { useAnalytics, useInsights, usePredictions } from '@/hooks/reviews';
import { useCycles } from '@/hooks/reviews';
import { ANALYTICS_PERIODS } from '@/config/constants/reviewConstants';

const ReviewAnalyticsDashboard = ({ onNavigate, tenantId }) => {
    const [selectedPeriod, setSelectedPeriod] = useState(ANALYTICS_PERIODS.MONTH);
    const [selectedCycle, setSelectedCycle] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // Fetch cycles for filter
    const { cycles, loading: cyclesLoading } = useCycles({ autoFetch: true });

    // Analytics hooks
    const {
        loading: analyticsLoading,
        companyAnalytics,
        departmentsAnalytics,
        managersAnalytics,
        trends,
        fetchCompanyAnalytics,
        fetchDepartmentsAnalytics,
        fetchManagersAnalytics,
        fetchTrends,
        refreshAll,
    } = useAnalytics({ autoFetch: false });

    // Insights hook
    const {
        loading: insightsLoading,
        insights,
        generating,
        generateInsights,
        dismissInsight,
    } = useInsights({ autoFetch: true, limit: 10 });

    // Predictions hook
    const {
        loading: predictionsLoading,
        highRiskEmployees,
        fetchHighRiskEmployees,
    } = usePredictions({ autoFetch: false });

    // Fetch all data
    const fetchAllData = async () => {
        const params = {
            period: selectedPeriod,
            cycle_id: selectedCycle || undefined,
            department_id: selectedDepartment || undefined,
        };
        
        await Promise.all([
            fetchCompanyAnalytics(params),
            fetchDepartmentsAnalytics(params),
            fetchManagersAnalytics(params),
            fetchTrends(params),
            fetchHighRiskEmployees(params),
        ]);
    };

    // Refresh on filter change
    useEffect(() => {
        fetchAllData();
    }, [selectedPeriod, selectedCycle, selectedDepartment]);

    // Initial load
    useEffect(() => {
        fetchAllData();
    }, []);

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
    };

    const handleCycleChange = (cycleId) => {
        setSelectedCycle(cycleId);
    };

    const handleDepartmentChange = (deptId) => {
        setSelectedDepartment(deptId);
    };

    const handleRefresh = () => {
        refreshAll();
        fetchHighRiskEmployees();
    };

    const handleInsightClick = (insight) => {
        // Mark as read and navigate if needed
        dismissInsight(insight.id);
        if (insight.action_url && onNavigate) {
            onNavigate(insight.action_url);
        }
    };

    const handleGenerateInsights = () => {
        generateInsights({
            period: selectedPeriod,
            cycle_id: selectedCycle || undefined,
        });
    };

    const isLoading = analyticsLoading || insightsLoading || predictionsLoading;

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <div>
                    <h1 className="analytics-title">Analytics Dashboard</h1>
                    <p className="analytics-subtitle">Company-wide performance insights and trends</p>
                </div>
            </div>

            <ReviewAnalyticsFilters
                selectedPeriod={selectedPeriod}
                selectedCycle={selectedCycle}
                selectedDepartment={selectedDepartment}
                cycles={cycles}
                departments={departmentsAnalytics}
                onPeriodChange={handlePeriodChange}
                onCycleChange={handleCycleChange}
                onDepartmentChange={handleDepartmentChange}
                onRefresh={handleRefresh}
                loading={isLoading}
            />

            <ReviewCompanyAnalytics
                analytics={companyAnalytics}
                loading={analyticsLoading}
            />

            <div className="analytics-charts-grid">
                <ReviewScoreTrendChart
                    data={trends?.data || []}
                    title="Average Score Trend"
                    loading={analyticsLoading}
                />
                <ReviewRatingDistributionChart
                    distribution={companyAnalytics?.rating_distribution}
                    title="Rating Distribution"
                    loading={analyticsLoading}
                />
            </div>

            <div className="analytics-charts-grid">
                <ReviewDepartmentComparison
                    departments={departmentsAnalytics}
                    onDepartmentClick={(deptId) => onNavigate?.(`/reviews/analytics/departments/${deptId}`)}
                    loading={analyticsLoading}
                />
                <ReviewManagerAnalytics
                    managers={managersAnalytics}
                    onManagerClick={(managerId) => onNavigate?.(`/reviews/analytics/managers/${managerId}`)}
                    loading={analyticsLoading}
                />
            </div>

            <div className="analytics-charts-grid">
                <ReviewHighRiskList
                    employees={highRiskEmployees}
                    onEmployeeClick={(empId) => onNavigate?.(`/reviews/pips?employee=${empId}`)}
                    loading={predictionsLoading}
                />
                <ReviewInsightsPanel
                    insights={insights}
                    onInsightClick={handleInsightClick}
                    onGenerate={handleGenerateInsights}
                    loading={insightsLoading}
                    generating={generating}
                />
            </div>
        </div>
    );
};

export default ReviewAnalyticsDashboard;