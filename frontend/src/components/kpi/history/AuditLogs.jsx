import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiRefreshCw, FiEye } from 'react-icons/fi';
import KPIHistoryTable from './KPIHistoryTable';
import ActualHistoryTable from './ActualHistoryTable';
import TargetHistoryTable from './TargetHistoryTable';
import HistoryFilters from './HistoryFilters';
import HistoryDetail from './HistoryDetail';
import KPILoading from '../common/KPILoading';

const AuditLogs = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('kpi');
    const [loading, setLoading] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState(null);
    
    const tabs = [
        { id: 'kpi', label: 'KPI Changes' },
        { id: 'actual', label: 'Actual Submissions' },
        { id: 'target', label: 'Target Changes' }
    ];
    
    const handleRefresh = () => {
        // Refresh logic would go here
        window.location.reload();
    };
    
    return (
        <div className="kpi-history-container">
            <div className="history-header">
                <h2>Audit Logs</h2>
                <p>Track all changes and activities across the KPI system</p>
            </div>
            
            <div className="history-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`history-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
                <button className="refresh-history-btn" onClick={handleRefresh}>
                    <FiRefreshCw size={14} />
                    Refresh
                </button>
            </div>
            
            <HistoryFilters />
            
            <div className="history-content">
                {activeTab === 'kpi' && (
                    <KPIHistoryTable onViewDetail={setSelectedHistory} />
                )}
                {activeTab === 'actual' && (
                    <ActualHistoryTable onViewDetail={setSelectedHistory} />
                )}
                {activeTab === 'target' && (
                    <TargetHistoryTable onViewDetail={setSelectedHistory} />
                )}
            </div>
            
            {selectedHistory && (
                <HistoryDetail 
                    history={selectedHistory}
                    onClose={() => setSelectedHistory(null)}
                />
            )}
        </div>
    );
};

export default AuditLogs;