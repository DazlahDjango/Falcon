import React, { useState } from 'react';
import { FiTarget, FiTrendingUp, FiCheckCircle, FiClock, FiAward } from 'react-icons/fi';
import UserKPIs from './UserKPIs';
import UserTargets from './UserTargets';
import UserScores from './UserScores';
import UserActuals from './UserActuals';

const UserProfileKPISection = ({ userId, userName }) => {
    const [activeTab, setActiveTab] = useState('kpis');
    
    const tabs = [
        { id: 'kpis', label: 'KPIs', icon: <FiTarget size={14} /> },
        { id: 'targets', label: 'Targets', icon: <FiTrendingUp size={14} /> },
        { id: 'scores', label: 'Scores', icon: <FiCheckCircle size={14} /> },
        { id: 'actuals', label: 'Actuals', icon: <FiClock size={14} /> }
    ];
    
    const stats = {
        totalKPIs: 0,
        avgScore: 0,
        completedTargets: 0,
        pendingValidations: 0
    };
    
    return (
        <div className="kpi-user-profile-section">
            <div className="profile-kpi-header">
                <h3>KPI Performance</h3>
                <p>Track {userName}'s key performance indicators</p>
            </div>
            
            <div className="profile-kpi-stats">
                <div className="stat-card">
                    <FiTarget size={20} />
                    <div className="stat-info">
                        <div className="stat-value">{stats.totalKPIs}</div>
                        <div className="stat-label">Total KPIs</div>
                    </div>
                </div>
                <div className="stat-card">
                    <FiTrendingUp size={20} />
                    <div className="stat-info">
                        <div className="stat-value">{stats.avgScore}%</div>
                        <div className="stat-label">Avg Score</div>
                    </div>
                </div>
                <div className="stat-card">
                    <FiAward size={20} />
                    <div className="stat-info">
                        <div className="stat-value">{stats.completedTargets}</div>
                        <div className="stat-label">Targets Met</div>
                    </div>
                </div>
                <div className="stat-card">
                    <FiClock size={20} />
                    <div className="stat-info">
                        <div className="stat-value">{stats.pendingValidations}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
            </div>
            
            <div className="profile-kpi-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div className="profile-kpi-content">
                {activeTab === 'kpis' && <UserKPIs userId={userId} />}
                {activeTab === 'targets' && <UserTargets userId={userId} />}
                {activeTab === 'scores' && <UserScores userId={userId} />}
                {activeTab === 'actuals' && <UserActuals userId={userId} />}
            </div>
        </div>
    );
};

export default UserProfileKPISection;