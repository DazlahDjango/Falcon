// src/components/reviews/reviewAnalytics/ReviewAnalyticsFilters.jsx
import React from 'react';
import './analytics.css';
import { ANALYTICS_PERIODS, ANALYTICS_PERIOD_LABELS } from '@/config/constants/reviewConstants';

const ReviewAnalyticsFilters = ({
    selectedPeriod = 'month',
    selectedCycle = '',
    selectedDepartment = '',
    cycles = [],
    departments = [],
    onPeriodChange,
    onCycleChange,
    onDepartmentChange,
    onRefresh,
    loading = false,
}) => {
    const periodOptions = [
        { value: ANALYTICS_PERIODS.WEEK, label: ANALYTICS_PERIOD_LABELS[ANALYTICS_PERIODS.WEEK] },
        { value: ANALYTICS_PERIODS.MONTH, label: ANALYTICS_PERIOD_LABELS[ANALYTICS_PERIODS.MONTH] },
        { value: ANALYTICS_PERIODS.QUARTER, label: ANALYTICS_PERIOD_LABELS[ANALYTICS_PERIODS.QUARTER] },
        { value: ANALYTICS_PERIODS.YEAR, label: ANALYTICS_PERIOD_LABELS[ANALYTICS_PERIODS.YEAR] },
    ];

    return (
        <div className="analytics-filters">
            <select
                value={selectedPeriod}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="filter-select"
            >
                {periodOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <select
                value={selectedCycle}
                onChange={(e) => onCycleChange(e.target.value)}
                className="filter-select"
            >
                <option value="">All Cycles</option>
                {cycles.map(cycle => (
                    <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                ))}
            </select>

            <select
                value={selectedDepartment}
                onChange={(e) => onDepartmentChange(e.target.value)}
                className="filter-select"
            >
                <option value="">All Departments</option>
                {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
            </select>

            <button
                onClick={onRefresh}
                disabled={loading}
                className="filter-button"
            >
                {loading ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>
    );
};

export default ReviewAnalyticsFilters;