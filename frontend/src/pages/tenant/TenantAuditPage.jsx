import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuditLogTable, AuditLogFilter, AuditLogDetailModal } from '../../components/tenant/audit';
import { fetchAuditLogs, exportAuditLogs, setAuditPage, setAuditPageSize, setAuditFilters, clearAuditFilters, setSelectedLog, selectAuditLogs, selectAuditTotal, selectAuditPage, selectAuditPageSize, selectAuditFilters, selectSelectedAuditLog, selectAuditLoading, selectTenantLoading } from '../../store/tenant/slice';

export const TenantAuditPage = () => {
    const { tenantId } = useParams();
    const dispatch = useDispatch();
    const logs = useSelector(selectAuditLogs);
    const total = useSelector(selectAuditTotal);
    const page = useSelector(selectAuditPage);
    const pageSize = useSelector(selectAuditPageSize);
    const filters = useSelector(selectAuditFilters);
    const selectedLog = useSelector(selectSelectedAuditLog);
    const loading = useSelector(selectAuditLoading);
    const tenantLoading = useSelector(selectTenantLoading);
    
    const [detailModalOpen, setDetailModalOpen] = useState(false);

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchAuditLogs({ tenantId, params: { page, page_size: pageSize, ...filters } }));
        }
    }, [dispatch, tenantId, page, pageSize, filters]);

    useEffect(() => {
        if (tenantId) {
            dispatch({ type: 'tenant/initializeWebSocket', payload: { tenantId } });
        }
        return () => {
            dispatch({ type: 'tenant/closeWebSocket' });
        };
    }, [dispatch, tenantId]);

    const handlePageChange = (newPage) => {
        dispatch(setAuditPage(newPage));
    };

    const handlePageSizeChange = (newSize) => {
        dispatch(setAuditPageSize(newSize));
    };

    const handleFilterChange = (newFilters) => {
        dispatch(setAuditFilters(newFilters));
    };

    const handleClearFilters = () => {
        dispatch(clearAuditFilters());
    };

    const handleViewDetails = (logId) => {
        const log = logs.find(l => l.id === logId);
        dispatch(setSelectedLog(log));
        setDetailModalOpen(true);
    };

    const handleExport = async (format) => {
        await dispatch(exportAuditLogs({ tenantId, format, filters }));
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Audit Logs</h1>
                <p className="text-gray-500 mt-1">Track all tenant activities and changes</p>
            </div>

            <AuditLogFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleClearFilters}
                onExport={handleExport}
                loading={loading}
            />

            <AuditLogTable
                logs={logs}
                loading={loading}
                onViewDetails={handleViewDetails}
            />

            <AuditLogDetailModal
                isOpen={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    dispatch(setSelectedLog(null));
                }}
                log={selectedLog}
            />
        </div>
    );
};

export default TenantAuditPage;
