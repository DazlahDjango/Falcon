import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye } from 'react-icons/fi';
import { fetchKPIHistory, selectKPIHistory, selectHistoryLoading } from '../../../store/kpi';
import KPILoading from '../common/KPILoading';

const KPIHistoryTable = ({ onViewDetail }) => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    
    const history = useSelector(selectKPIHistory);
    const loading = useSelector(selectHistoryLoading);
    
    useEffect(() => {
        dispatch(fetchKPIHistory({ page, page_size: 20 }));
    }, [dispatch, page]);
    
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
    
    if (loading) {
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
        </div>
    );
};

export default KPIHistoryTable;