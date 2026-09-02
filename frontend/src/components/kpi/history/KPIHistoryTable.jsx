import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye } from 'react-icons/fi';
import { fetchKPIHistory, selectKPIHistory, selectHistoryLoading, selectHistoryPagination } from '../../../store/kpi';
import KPILoading from '../common/KPILoading';
import KPIPagination from '../common/KPIPagination';

const KPIHistoryTable = ({ onViewDetail, filters = {} }) => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    
    const history = useSelector(selectKPIHistory);
    const loading = useSelector(selectHistoryLoading);
    const pagination = useSelector(selectHistoryPagination);
    
    useEffect(() => {
        dispatch(fetchKPIHistory({ ...filters, page, pageSize, page_size: pageSize }));
    }, [dispatch, page, pageSize, filters]);
    
    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setPage(1);
    };
    
    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'info';
            case 'ACTIVATE': return 'success';
            case 'DEACTIVATE': return 'warning';
            case 'ARCHIVE': return 'danger';
            default: return 'default';
        }
    };
    
    if (loading && (!history || history.length === 0)) {
        return <KPILoading size="sm" text="Loading KPI history..." />;
    }
    
    return (
        <div className="history-table-container">
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>KPI</th>
                        <th>Action</th>
                        <th>Performed By</th>
                        <th>Changes</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {history?.map(item => (
                        <tr key={item.id}>
                            <td>{new Date(item.performed_at).toLocaleString()}</td>
                            <td>{item.kpi_name}</td>
                            <td className={`action-${getActionColor(item.action)}`}>
                                {item.action}
                            </td>
                            <td>{item.performed_by_email || 'System'}</td>
                            <td>
                                {item.changes && Object.keys(item.changes).length > 0 && (
                                    <span className="changes-count">
                                        {Object.keys(item.changes).length} change(s)
                                    </span>
                                )}
                            </td>
                            <td>
                                <button 
                                    className="view-detail-btn"
                                    onClick={() => onViewDetail(item)}
                                >
                                    <FiEye size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {history && history.length > 0 && (
                <KPIPagination
                    currentPage={page}
                    pageSize={pageSize}
                    total={pagination.total || history.length}
                    totalPages={pagination.totalPages || 1}
                    itemCount={history.length}
                    isLoading={loading}
                    onPageChange={setPage}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}
        </div>
    );
};

export default KPIHistoryTable;