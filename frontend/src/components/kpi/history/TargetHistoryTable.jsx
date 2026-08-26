import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye } from 'react-icons/fi';
import { fetchTargetHistory, selectTargetHistory, selectHistoryLoading, selectHistoryPagination } from '../../../store/kpi';
import KPILoading from '../common/KPILoading';
import KPIPagination from '../common/KPIPagination';

const TargetHistoryTable = ({ onViewDetail, filters = {} }) => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    
    const history = useSelector(selectTargetHistory);
    const loading = useSelector(selectHistoryLoading);
    const pagination = useSelector(selectHistoryPagination);
    
    useEffect(() => {
        dispatch(fetchTargetHistory({ ...filters, page, pageSize, page_size: pageSize }));
    }, [dispatch, page, pageSize, filters]);

    const handlePageSizeChange = (newSize) => {
        setPageSize(newSize);
        setPage(1);
    };
    
    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'success';
            case 'UPDATE': return 'info';
            case 'PHASE': return 'primary';
            case 'LOCK': return 'warning';
            case 'ADJUST': return 'danger';
            default: return 'default';
        }
    };
    
    if (loading && (!history || history.length === 0)) {
        return <KPILoading size="sm" text="Loading target history..." />;
    }
    
    return (
        <div className="history-table-container">
            <table className="history-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>KPI</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Old Value</th>
                        <th>New Value</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {history?.map(item => (
                        <tr key={item.id}>
                            <td>{new Date(item.performed_at).toLocaleString()}</td>
                            <td>{item.kpi_name}</td>
                            <td>{item.user_name}</td>
                            <td className={`action-${getActionColor(item.action)}`}>
                                {item.action}
                            </td>
                            <td>{item.old_value || '-'}</td>
                            <td>{item.new_value}</td>
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

export default TargetHistoryTable;