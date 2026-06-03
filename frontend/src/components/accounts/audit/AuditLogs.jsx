// frontend/src/components/accounts/audit/AuditLogs.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiRefreshCw, FiDownload, FiFilter, FiCalendar, FiAlertCircle } from 'react-icons/fi';
import { useAudit } from '../../../store/accounts/hooks/useAudit';
import AuditTable from './components/AuditTable';
import AuditFilters from './components/AuditFilters';
import AuditExport from './components/AuditExport';
import AuditStats from './components/AuditStats';
import Spinner from '../../common/UI/Spinner';

const AuditLogs = () => {
    const {
        logs,
        pagination,
        filters,
        isLoading,
        loadAuditLogs,
        clearAuditFilters,
        goToAuditPage,
        getLastNDays,
        securityEvents,
        loadSecurityEvents,
    } = useAudit();

    const [showFilters, setShowFilters] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [activeTimeRange, setActiveTimeRange] = useState('7d');

    const timeRanges = [
        { label: 'Today', value: 'today', days: 0 },
        { label: 'Last 7 Days', value: '7d', days: 7 },
        { label: 'Last 30 Days', value: '30d', days: 30 },
        { label: 'Last 90 Days', value: '90d', days: 90 },
    ];

    const loadData = useCallback(() => {
        loadAuditLogs({ ...filters, page: pagination.current_page });
        loadSecurityEvents(30);
    }, [loadAuditLogs, loadSecurityEvents, filters, pagination.current_page]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleRefresh = () => {
        loadData();
    };

    const handlePageChange = (page) => {
        goToAuditPage(page);
        loadAuditLogs({ ...filters, page });
    };

    const handleResetFilters = () => {
        clearAuditFilters();
        setActiveTimeRange('7d');
        getLastNDays(7);
    };

    const handleTimeRangeChange = (range) => {
        setActiveTimeRange(range.value);
        if (range.value === 'today') {
            const today = new Date().toISOString().split('T')[0];
            loadAuditLogs({ ...filters, start_date: today, end_date: today });
        } else {
            getLastNDays(range.days);
        }
    };

    return (
        <div className="audit-logs-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Audit Logs</h1>
                    <p>Track system activity, user actions, and security events</p>
                </div>
                <div className="header-actions">
                    <button className="btn-icon" onClick={handleRefresh} title="Refresh">
                        <FiRefreshCw size={18} />
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowExport(true)}>
                        <FiDownload size={16} />
                        Export
                    </button>
                    <button
                        className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter size={16} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <AuditStats
                totalLogs={pagination.total_items}
                securityEvents={securityEvents?.length || 0}
                periodDays={filters.days || 30}
            />

            {/* Time Range Quick Filters */}
            <div className="time-range-filters">
                {timeRanges.map(range => (
                    <button
                        key={range.value}
                        className={`time-btn ${activeTimeRange === range.value ? 'active' : ''}`}
                        onClick={() => handleTimeRangeChange(range)}
                    >
                        <FiCalendar size={14} />
                        {range.label}
                    </button>
                ))}
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <AuditFilters
                    filters={filters}
                    onFilterChange={(newFilters) => loadAuditLogs({ ...newFilters, page: 1 })}
                    onReset={handleResetFilters}
                />
            )}

            {/* Audit Table */}
            {isLoading && !logs.length ? (
                <div className="audit-loading">
                    <Spinner size="lg" />
                    <p>Loading audit logs...</p>
                </div>
            ) : (
                <AuditTable
                    logs={logs}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onRefresh={handleRefresh}
                />
            )}

            {/* Export Modal */}
            <AuditExport
                isOpen={showExport}
                onClose={() => setShowExport(false)}
                filters={filters}
            />
        </div>
    );
};

export default AuditLogs;