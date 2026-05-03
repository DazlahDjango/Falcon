// frontend/src/pages/tenant/TenantAuditPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AuditLogTable, AuditLogFilter, AuditLogDetailModal } from '../../components/tenant/audit';
import { fetchAuditLogs, exportAuditLogs, setAuditPage, setAuditPageSize, setAuditFilters, clearAuditFilters, setSelectedLog, selectAuditLogs, selectAuditTotal, selectAuditPage, selectAuditPageSize, selectAuditFilters, selectSelectedAuditLog, selectTenantLoading } from '../../store/tenant';

export const TenantAuditPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const logs = useSelector(selectAuditLogs);
    const total = useSelector(selectAuditTotal);
    const page = useSelector(selectAuditPage);
    const pageSize = useSelector(selectAuditPageSize);
    const filters = useSelector(selectAuditFilters);
    const selectedLog = useSelector(selectSelectedAuditLog);
    const loading = useSelector(selectTenantLoading);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchAuditLogs({ tenantId: id, params: { page, page_size: pageSize, ...filters } }));
        }
    }, [dispatch, id, page, pageSize, filters]);

    const handlePageChange = (newPage) => {
        dispatch(setAuditPage(newPage));
    };

    const handlePageSizeChange = (newSize) => {
        dispatch(setAuditPageSize(newSize));
    };

    const handleFilterChange = (newFilters) => {
        dispatch(setAuditFilters(newFilters));
    };

    const handleResetFilters = () => {
        dispatch(clearAuditFilters());
    };

    const handleExport = async () => {
        setExporting(true);
        await dispatch(exportAuditLogs({ tenantId: id, format: 'csv', filters }));
        setExporting(false);
    };

    const handleViewDetails = (log) => {
        dispatch(setSelectedLog(log));
    };

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                <p className="text-sm text-gray-500 mt-1">Track all tenant activities and changes</p>
            </div>

            <AuditLogFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                onExport={handleExport}
            />

            <div className="mt-6">
                <AuditLogTable
                    logs={logs}
                    onViewDetails={handleViewDetails}
                    loading={loading}
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    totalPages={totalPages}
                />
            </div>

            <AuditLogDetailModal
                isOpen={!!selectedLog}
                onClose={() => dispatch(setSelectedLog(null))}
                log={selectedLog}
            />
        </div>
    );
};