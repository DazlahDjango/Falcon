import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChampionDashboardHeader from './ChampionDashboardHeader'; // Changed to default import
import DashboardConfigPanel from './DashboardConfigPanel'; // Changed to default import
import KPIAssignmentPanel from './KPIAssignmentPanel'; // Changed to default import
import TargetSettingsPanel from './TargetSettingsPanel'; // Changed to default import
import TemplateLibrary from './TemplateLibrary'; // Changed to default import
import BulkAssignPanel from './BulkAssignPanel'; // Changed to default import
import { useChampionDashboard } from '../../../hooks/dashboard/useChampionDashboard';
import {
    fetchEditableDashboard,
    fetchAvailableKPIs,
    fetchAssignedKPIs,
    fetchTemplates,
    setActiveDashboard
} from '../../../store/dashboard';
import { fetchUsers } from '../../../store/accounts/slice/userSlice';

const ChampionDashboard = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedUser, setSelectedUser] = useState(null);

    const {
        dashboardData,
        availableKPIs,
        assignedKPIs,
        templates,
        targetUserId,
        period,
        loading,
        refreshDashboard,
        loadAvailableKPIs,
        loadAssignedKPIs,
        loadTemplates,
        updateConfig,
        addKPI,
        removeKPI,
        updateWeights,
        updateTargets,
        createTemplate,
        applyTemplate,
        setTargetUser,
        setPeriod
    } = useChampionDashboard({ autoFetch: true });

    // FIXED: Correct selector for users
    const users = useSelector((state) => state.users?.users || []); // Changed from 'list' to 'users'

    useEffect(() => {
        dispatch(setActiveDashboard('champion'));
        dispatch(fetchEditableDashboard({ targetUserId, period }));
        if (targetUserId) {
            dispatch(fetchAvailableKPIs(targetUserId));
            dispatch(fetchAssignedKPIs(targetUserId));
        }
        dispatch(fetchTemplates());
        dispatch(fetchUsers()); // This is correct - fetchUsers is a named export
    }, [dispatch, targetUserId, period]);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'kpi_assignment', label: 'KPI Assignment', icon: '🎯' },
        { id: 'targets', label: 'Target Settings', icon: '🎪' },
        { id: 'templates', label: 'Templates', icon: '📋' },
        { id: 'bulk_assign', label: 'Bulk Assign', icon: '👥' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <DashboardConfigPanel
                        data={dashboardData}
                        loading={loading}
                        onRefresh={refreshDashboard}
                        onSave={updateConfig}
                        targetUser={users.find(u => u.id === targetUserId)}
                    />
                );

            case 'kpi_assignment':
                return (
                    <KPIAssignmentPanel
                        assignedKPIs={assignedKPIs}
                        availableKPIs={availableKPIs}
                        loading={loading}
                        onRefresh={() => {
                            loadAvailableKPIs();
                            loadAssignedKPIs();
                        }}
                        onAssign={addKPI}
                        onUnassign={removeKPI}
                        onUpdateWeight={updateWeights}
                        targetUser={users.find(u => u.id === targetUserId)}
                    />
                );

            case 'targets':
                return (
                    <TargetSettingsPanel
                        assignedKPIs={assignedKPIs}
                        loading={loading}
                        onRefresh={refreshDashboard}
                        onUpdateTarget={updateTargets}
                        targetUser={users.find(u => u.id === targetUserId)}
                    />
                );

            case 'templates':
                return (
                    <TemplateLibrary
                        templates={templates}
                        loading={loading}
                        onRefresh={loadTemplates}
                        onCreateTemplate={createTemplate}
                        onApplyTemplate={applyTemplate}
                    />
                );

            case 'bulk_assign':
                return (
                    <BulkAssignPanel
                        users={users}
                        availableKPIs={availableKPIs}
                        loading={loading}
                        onRefresh={() => {
                            loadAvailableKPIs();
                            loadAssignedKPIs();
                        }}
                        onBulkAssign={(data) => {
                            console.log('Bulk assign:', data);
                        }}
                        targetUser={users.find(u => u.id === targetUserId)}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="champion-dashboard">
            <ChampionDashboardHeader
                targetUserId={targetUserId}
                setTargetUserId={setTargetUser}
                period={period}
                setPeriod={setPeriod}
                onRefresh={refreshDashboard}
                onExport={() => console.log('Export dashboard')}
                loading={loading}
                users={users}
            />

            <div className="champion-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="champion-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default ChampionDashboard;