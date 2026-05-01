import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { usePermissionContext } from "../../contexts/accounts/PermissionContext";
import { useIndividualDashboard, useManagerDashboard, useExecutiveDashboard, useChampionDashboard } from '../../hooks/kpi';
import { IndividualDashboard, ManagerDashboard, ExecutiveDashboard, ChampionDashboard } from '../../components/kpi/dashboards';
import { PeriodSelector } from '../../components/kpi/common';
import { fetchDashboardPeriod, refreshDashboard } from '../../store/kpi/slice/kpi/dashboardSlice';
import styles from './Pages.module.css';

const KPIDashboardPage = () => {
    const dispatch = useDispatch();
    const { user, hasRole, hasAnyRole } = usePermissionContext();
    const period = useSelector(state => state.kpiDashboard?.period) || { 
        year: new Date().getFullYear(), 
        month: new Date().getMonth() + 1 
    };
    
    const [dashboardType, fetchDashboardType] = useState('individual');
    
    useEffect(() => {
        // Use correct role names from your backend
        if (hasAnyRole(['executive', 'super_admin', 'client_admin'])) {
            fetchDashboardType('executive');
        } else if (hasRole('dashboard_champion')) {
            fetchDashboardType('champion');
        } else if (hasRole('supervisor')) {  // ✅ FIXED: 'supervisor' not 'manager'
            fetchDashboardType('manager');
        } else {
            fetchDashboardType('individual');
        }
    }, [user, hasRole, hasAnyRole]);
    
    // Rest of your component remains the same...
    const individualDashboard = useIndividualDashboard(period.year, period.month);
    const managerDashboard = useManagerDashboard(period.year, period.month);
    const executiveDashboard = useExecutiveDashboard(period.year, period.month);
    const championDashboard = useChampionDashboard(period.year, period.month);
    
    const handlePeriodChange = (year, month) => {
        dispatch(fetchDashboardPeriod({ year, month }));
        dispatch(refreshDashboard(dashboardType));
    };
    
    const handleRefresh = () => {
        dispatch(refreshDashboard(dashboardType));
    };
    
    const renderDashboard = () => {
        switch (dashboardType) {
            case 'executive':
                return (
                    <ExecutiveDashboard
                        tenantId={user?.tenantId}
                        initialData={executiveDashboard.dashboard}
                        isLoading={executiveDashboard.isLoading}
                        onPeriodChange={handlePeriodChange}
                        onRefresh={handleRefresh}
                    />
                );
            case 'champion':
                return (
                    <ChampionDashboard
                        championId={user?.id}
                        initialData={championDashboard.dashboard}
                        isLoading={championDashboard.isLoading}
                        onPeriodChange={handlePeriodChange}
                        onRefresh={handleRefresh}
                        onResolveEscalation={(id) => console.log('Resolve escalation:', id)}
                    />
                );
            case 'manager':
                return (
                    <ManagerDashboard
                        managerId={user?.id}
                        initialData={managerDashboard.dashboard}
                        isLoading={managerDashboard.isLoading}
                        onPeriodChange={handlePeriodChange}
                        onRefresh={handleRefresh}
                        onValidate={() => console.log('Validate')}
                        onApprove={(id) => console.log('Approve:', id)}
                        onReject={(id) => console.log('Reject:', id)}
                    />
                );
            default:
                return (
                    <IndividualDashboard
                        userId={user?.id}
                        initialData={individualDashboard.dashboard}
                        isLoading={individualDashboard.isLoading}
                        onPeriodChange={handlePeriodChange}
                        onRefresh={handleRefresh}
                    />
                );
        }
    };
    
    return (
        <div className={styles.page}>
            {renderDashboard()}
        </div>
    );
};

export default KPIDashboardPage;
