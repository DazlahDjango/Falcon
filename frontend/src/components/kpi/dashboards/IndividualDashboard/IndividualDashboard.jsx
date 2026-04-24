import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import IndividualDashboardHeader from './IndividualDashboardHeader';
import IndividualScoreCard from './IndividualScoreCard';
import IndividualKPISection from './IndividualKPISection';
import IndividualRecentActivity from './IndividualRecentActivity';
import PeriodSelector from '../../common/PeriodSelector';
import { ScoreGauge } from '../../common';
import styles from './IndividualDashboard.module.css';

const IndividualDashboard = ({
    userId,
    initialData,
    isLoading,
    onPeriodChange,
    onRefresh
}) => {
    const [dashboardData, setDashboardData] = useState(initialData || null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        if (initialData) {
            setDashboardData(initialData);
        }
    }, [initialData]);
    const handlePeriodChange = (year, month) => {
        setSelectedYear(year);
        setSelectedMonth(month);
        if (onPeriodChange) {
            onPeriodChange(year, month);
        }
    };
    const handleRefresh = async () => {
        setRefreshing(true);
        if (onRefresh) {
            await onRefresh(selectedYear, selectedMonth);
        }
        setRefreshing(false);
    };
    if (isLoading && !dashboardData) {
        return (
            <div className={styles.emptyContainer}>
                <p>No data available for the selected period.</p>
                <button onClick={handleRefresh} className={styles.refreshButton}>
                    Refresh
                </button>
            </div>
        );
    }
    const { overallScore, kpis, recentActivity } = dashboardData;
    return (
        <div className={styles.dashboard}>
            <IndividualDashboardHeader 
                userName={dashboardData.userName}
                period={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                onRefresh={handleRefresh}
                refreshing={refreshing}
            />

            <div className={styles.periodSelector}>
                <PeriodSelector
                    year={selectedYear}
                    month={selectedMonth}
                    onChange={handlePeriodChange}
                    minYear={2020}
                    maxYear={new Date().getFullYear() + 2}
                />
            </div>

            <div className={styles.scoreSection}>
                <IndividualScoreCard 
                    overallScore={overallScore}
                    kpiCount={kpis?.length || 0}
                />
                <div className={styles.gaugeWrapper}>
                    <ScoreGauge 
                        score={overallScore || 0}
                        title="Overall Performance"
                        size="lg"
                        showDetails={true}
                    />
                </div>
            </div>

            <div className={styles.kpiSection}>
                <IndividualKPISection 
                    kpis={kpis || []}
                    onKpiClick={(kpiId) => {
                        // Handle KPI click - navigate to detail
                        console.log('KPI clicked:', kpiId);
                    }}
                />
            </div>

            <div className={styles.activitySection}>
                <IndividualRecentActivity 
                    activities={recentActivity || []}
                />
            </div>
        </div>
    );
};
IndividualDashboard.propTypes = {
    userId: PropTypes.string.isRequired,
    initialData: PropTypes.shape({
        userName: PropTypes.string,
        overallScore: PropTypes.number,
        kpis: PropTypes.array,
        recentActivity: PropTypes.array,
    }),
    isLoading: PropTypes.bool,
    onPeriodChange: PropTypes.func,
    onRefresh: PropTypes.func,
}
IndividualDashboard.defaultProps = {
    isLoading: false,
};
export default IndividualDashboard;