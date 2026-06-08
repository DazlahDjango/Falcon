import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiClock, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { fetchCalculationHistory, selectCalculationHistory, selectCalculationLoading } from '../../../store/kpi';
import KPILoading from '../common/KPILoading';

const CalculationHistory = () => {
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    
    const history = useSelector(selectCalculationHistory);
    const loading = useSelector(selectCalculationLoading);
    
    useEffect(() => {
        dispatch(fetchCalculationHistory({ page, page_size: 20 }));
    }, [dispatch, page]);
    
    const getStatusIcon = (status) => {
        switch (status) {
            case 'SUCCESS': return <FiCheckCircle size={14} color="var(--kpi-success)" />;
            case 'FAILED': return <FiXCircle size={14} color="var(--kpi-danger)" />;
            default: return <FiClock size={14} color="var(--kpi-warning)" />;
        }
    };
    
    if (loading) {
        return <KPILoading text="Loading calculation history..." />;
    }
    
    return (
        <div className="kpi-calculations-container">
            <div className="calculations-header">
                <h2>Calculation History</h2>
                <p>View previous score calculation runs</p>
            </div>
            
            <div className="history-table-container">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>Triggered At</th>
                            <th>Period</th>
                            <th>Status</th>
                            <th>Duration</th>
                            <th>Records</th>
                            <th>Triggered By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history?.map(item => (
                            <tr key={item.id}>
                                <td>{new Date(item.triggered_at).toLocaleString()}</td>
                                <td>{item.period_year}-{String(item.period_month).padStart(2, '0')}</td>
                                <td className={`status-${item.status?.toLowerCase()}`}>
                                    {getStatusIcon(item.status)}
                                    {item.status}
                                </td>
                                <td>{item.duration_ms}ms</td>
                                <td>{item.records_affected}</td>
                                <td>{item.triggered_by}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CalculationHistory;