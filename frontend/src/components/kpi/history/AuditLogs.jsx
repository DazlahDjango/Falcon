import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { FiRefreshCw } from 'react-icons/fi';
import {
    fetchKPIHistory,
    fetchActualHistory,
    fetchTargetHistory,
} from '../../../store/kpi';
import KPIHistoryTable from './KPIHistoryTable';
import ActualHistoryTable from './ActualHistoryTable';
import TargetHistoryTable from './TargetHistoryTable';
import HistoryFilters from './HistoryFilters';
import HistoryDetail from './HistoryDetail';

const TABS = [
    { id: 'kpi', label: 'KPI Changes', thunk: fetchKPIHistory },
    { id: 'actual', label: 'Actual Submissions', thunk: fetchActualHistory },
    { id: 'target', label: 'Target Changes', thunk: fetchTargetHistory },
];

const AuditLogs = () => {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('kpi');
    const [filters, setFilters] = useState({});
    const [selectedHistory, setSelectedHistory] = useState(null);

    const getActiveThunk = () => TABS.find(t => t.id === activeTab)?.thunk;

    const handleFilter = useCallback((newFilters) => {
        setFilters(newFilters);
        const thunk = getActiveThunk();
        if (thunk) {
            dispatch(thunk({ ...newFilters, page: 1, page_size: 20 }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, dispatch]);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setFilters({});
        const thunk = TABS.find(t => t.id === tabId)?.thunk;
        if (thunk) {
            dispatch(thunk({ page: 1, page_size: 20 }));
        }
    };

    const handleRefresh = () => {
        const thunk = getActiveThunk();
        if (thunk) {
            dispatch(thunk({ ...filters, page: 1, page_size: 20 }));
        }
    };

    return (
        <div className="kpi-history-container">
            <div className="history-header">
                <h2>Audit Logs</h2>
                <p>Track all changes and activities across the KPI system</p>
            </div>

            <div className="history-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        className={`history-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
                <button className="refresh-history-btn" onClick={handleRefresh}>
                    <FiRefreshCw size={14} />
                    Refresh
                </button>
            </div>

            <HistoryFilters onFilter={handleFilter} />

            <div className="history-content">
                {activeTab === 'kpi' && (
                    <KPIHistoryTable
                        filters={filters}
                        onViewDetail={setSelectedHistory}
                    />
                )}
                {activeTab === 'actual' && (
                    <ActualHistoryTable
                        filters={filters}
                        onViewDetail={setSelectedHistory}
                    />
                )}
                {activeTab === 'target' && (
                    <TargetHistoryTable
                        filters={filters}
                        onViewDetail={setSelectedHistory}
                    />
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