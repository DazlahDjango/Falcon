import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiRefreshCw, FiDownload, FiFilter } from 'react-icons/fi';
import AuditTable from './components/AuditTable';
import AuditFilters from './components/AuditFilters';
import AuditExport from './components/AuditExport';
import { fetchAuditLogs, resetFilters } from '../../../store/accounts/slice/auditSlice';
import { SkeletonLoader } from '../../common/Feedback/LoadingScreen';

const AuditLogs = () => {
    const dispatch = useDispatch();
    const { logs, pagination, filters, isLoading } = useSelector((state) => state.audit);
    const [showFilters, setShowFilters] = useState(false);
    const [showExport, setShowExport] = useState(false);
    useEffect(() => {
        dispatch(fetchAuditLogs(filters));
    }, [dispatch, filters]);
    const handleRefresh = () => {
        dispatch(fetchAuditLogs(filters));
    };
    const handlePageChange = (page) => {
        dispatch(fetchAuditLogs({ ...filters, page }));
    };
    const handleResetFilters = () => {
        dispatch(resetFilters());
    };
    return (
        <div className="audit-logs-page">
            <div className="page-header">
                <div>
                    <h1>Audit Logs</h1>
                    <p>View system activity and user actions</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={handleRefresh}>
                        <FiRefreshCw size={16} />
                        Refresh
                    </button>
                    <button className="btn btn-secondary" onClick={() => setShowExport(true)}>
                        <FiDownload size={16} />
                        Export
                    </button>
                    <button className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter size={16} />
                        Filters
                    </button>
                </div>
            </div>
            
            {showFilters && (
                <AuditFilters 
                    filters={filters}
                    onFilterChange={(newFilters) => dispatch(fetchAuditLogs(newFilters))}
                    onReset={handleResetFilters}
                />
            )}
            
            {isLoading && !logs.length ? (
                <SkeletonLoader type="table" />
            ) : (
                <AuditTable 
                    logs={logs}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            )}
            
            <AuditExport 
                isOpen={showExport}
                onClose={() => setShowExport(false)}
                filters={filters}
            />
        </div>
    );
};
export default AuditLogs;