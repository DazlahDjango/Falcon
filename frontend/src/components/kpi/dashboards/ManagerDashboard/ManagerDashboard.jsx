import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ManagerDashboardHeader from './ManagerDashboardHeader';
import TeamSummary from './TeamSummary';
import TeamMemberList from './TeamMemberList';
import TeamPerformanceChart from './TeamPerformanceChart';
import PendingValidations from './PendingValidations';
import PeriodSelector from '../../common/PeriodSelector';
import styles from './ManagerDashboard.module.css';

const ManagerDashboard = ({
    managerId,
    initialData,
    isLoading,
    onPeriodChange,
    onRefresh,
    onValidate,
    onApprove,
    onReject
}) => {
    const [dashboardData, setDashboardData] = useEffect(initialData || null);
    const [selectedYear, setSelectedYear] = useEffect(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useEffect(new Date().getMonth() + 1);
    const [refreshing, setRefreshing] = useState(false);
    useEffect(() => {
        if (initialData) {
            setDashboardData(initialData);
        }
    }, [initialData]);
    const handlePeriodChange = (year, month) => {
        setselectedYear(year);
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
            <div className={styles.loadingContainer}>
                <div className={styles.spinner} />
                <p>Loading team dashboard...</p>
            </div>
        );
    }
    if (!dashboardData) {
        return (
            <div className={styles.emptyContainer}>
                <p>No team data available for the selected period.</p>
                <button onClick={handleRefresh} className={styles.refreshButton}>
                    Refresh
                </button>
            </div>
        );
    }
    const {
        managerScore,
        teamSize,
        teamAvgScore,
        statusDistribution,
        pendingValidations,
        missingSubmissions,
        teamMembers
    } = dashboardData;
    return (
        <div className={styles.dashboard}>
            <ManagerDashboardHeader 
                managerName={dashboardData.managerName}
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

            <TeamSummary
                managerScore={managerScore}
                teamSize={teamSize}
                teamAvgScore={teamAvgScore}
                statusDistribution={statusDistribution}
            />

            <div className={styles.dashboardGrid}>
                <div className={styles.chartColumn}>
                    <TeamPerformanceChart teamMembers={teamMembers} />
                </div>
                <div className={styles.validationsColumn}>
                    <PendingValidations
                        pendingValidations={pendingValidations}
                        missingSubmissions={missingSubmissions}
                        onValidate={onValidate}
                        onApprove={onApprove}
                        onReject={onReject}
                    />
                </div>
            </div>

            <TeamMemberList 
                teamMembers={teamMembers}
                onMemberClick={(memberId) => {
                    console.log('Member clicked:', memberId);
                }}
            />
        </div>
    );
};
ManagerDashboard.propTypes = {
    managerId: PropTypes.string.isRequired,
    initialData: PropTypes.shape({
        managerName: PropTypes.string,
        managerScore: PropTypes.number,
        teamSize: PropTypes.number,
        teamAvgScore: PropTypes.number,
        statusDistribution: PropTypes.object,
        pendingValidations: PropTypes.array,
        missingSubmissions: PropTypes.number,
        teamMembers: PropTypes.array,
    }),
    isLoading: PropTypes.bool,
    onPeriodChange: PropTypes.func,
    onRefresh: PropTypes.func,
    onValidate: PropTypes.func,
    onApprove: PropTypes.func,
    onReject: PropTypes.func,
};
ManagerDashboard.defaultProps = {
    isLoading: false,
};
export default ManagerDashboard;