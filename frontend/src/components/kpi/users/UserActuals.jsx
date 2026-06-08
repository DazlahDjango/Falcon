import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiCalendar, FiFile, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { fetchUserActuals, selectUserActuals, selectActualLoading } from '../../../store/kpi';
import KPILoading from '../common/KPILoading';
import KPIEmptyState from '../common/KPIEmptyState';

const UserActuals = ({ userId }) => {
    const dispatch = useDispatch();
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    
    const actuals = useSelector(state => selectUserActuals(userId)(state));
    const loading = useSelector(selectActualLoading);
    
    useEffect(() => {
        if (userId) {
            dispatch(fetchUserActuals({ userId, params: { year: selectedYear, month: selectedMonth } }));
        }
    }, [dispatch, userId, selectedYear, selectedMonth]);
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];
    
    const getStatusIcon = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return <FiCheckCircle size={14} color="var(--kpi-success)" />;
            case 'REJECTED': return <FiXCircle size={14} color="var(--kpi-danger)" />;
            case 'PENDING': return <FiClock size={14} color="var(--kpi-warning)" />;
            default: return null;
        }
    };
    
    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return 'status-approved';
            case 'REJECTED': return 'status-rejected';
            case 'PENDING': return 'status-pending';
            default: return '';
        }
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Loading user actuals..." />;
    }
    
    if (!actuals || actuals.length === 0) {
        return (
            <KPIEmptyState 
                icon="📝"
                title="No Submissions"
                description="No actual data has been submitted for this period"
            />
        );
    }
    
    return (
        <div className="kpi-user-actuals">
            <div className="user-actuals-header">
                <h3>Actual Submissions</h3>
                <div className="period-selector">
                    <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="user-actuals-table">
                <table>
                    <thead>
                        <tr>
                            <th>KPI</th>
                            <th>Actual Value</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Evidence</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actuals.map(actual => (
                            <tr key={actual.id}>
                                <td className="actual-kpi-name">{actual.kpi_name}</td>
                                <td className="actual-value">{actual.actual_value}</td>
                                <td className={`actual-status ${getStatusClass(actual.status)}`}>
                                    {getStatusIcon(actual.status)}
                                    {actual.status}
                                </td>
                                <td className="actual-date">
                                    {new Date(actual.submitted_at).toLocaleDateString()}
                                </td>
                                <td className="actual-evidence">
                                    {actual.evidence_count > 0 && (
                                        <span className="evidence-count">
                                            <FiFile size={12} />
                                            {actual.evidence_count}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserActuals;