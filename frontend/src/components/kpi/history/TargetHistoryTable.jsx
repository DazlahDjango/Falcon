import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiEye } from 'react-icons/fi';
import { fetchTargetHistory, selectTargetHistory, selectHistoryLoading } from '../../../store/kpi';
import KPILoading from '../common/KPILoading';

const TargetHistoryTable = ({ onViewDetail, filters = {} }) => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    
    const history = useSelector(selectTargetHistory);
    const loading = useSelector(selectHistoryLoading);
    
    useEffect(() => {
        dispatch(fetchTargetHistory({ ...filters, page, page_size: 20 }));
    }, [dispatch, page, filters]);
    
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
    
    if (loading) {
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
        </div>
    );
};

export default TargetHistoryTable;