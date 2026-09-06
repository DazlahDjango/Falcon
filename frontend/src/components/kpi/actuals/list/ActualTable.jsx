import React from 'react';
import { FiEye, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import ActualStatusBadge from './ActualStatusBadge';
import useKPIPermissions from '../../../../hooks/kpi/useKPIPermissions';

const ActualTable = ({ actuals, onRowClick, onStatusClick, canValidate }) => {
    const { user } = useKPIPermissions();

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return <FiCheckCircle size={14} color="var(--kpi-success)" />;
            case 'rejected': return <FiXCircle size={14} color="var(--kpi-danger)" />;
            case 'pending': return <FiClock size={14} color="var(--kpi-warning)" />;
            default: return null;
        }
    };

    return (
        <div className="kpi-actual-table-container">
            <table className="kpi-actual-table">
                <thead>
                    <tr>
                        <th>KPI</th>
                        <th>User</th>
                        <th>Period</th>
                        <th>Actual Value</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {actuals.map(actual => {
                        const isOwnRow = Boolean(actual && user && (
                            String(actual.user_id) === String(user.id) ||
                            String(actual.user?.id) === String(user.id) ||
                            (actual.user?.email && user.email && actual.user.email.toLowerCase() === user.email.toLowerCase()) ||
                            (actual.user_email && user.email && actual.user_email.toLowerCase() === user.email.toLowerCase())
                        ));

                        return (
                            <tr 
                                key={actual.id} 
                                className="kpi-actual-table-row"
                                onClick={() => onRowClick?.(actual)}
                            >
                                <td className="kpi-actual-table-kpi">
                                    {actual.kpi_name || actual.kpi?.name}
                                </td>
                                <td>{actual.user_email?.split('@')[0] || actual.user?.email?.split('@')[0]}</td>
                                <td>{actual.period || `${actual.year}-${String(actual.month).padStart(2, '0')}`}</td>
                                <td className="kpi-actual-table-value">{actual.actual_value}</td>
                                <td>
                                    <ActualStatusBadge status={actual.status} />
                                </td>
                                <td className="kpi-actual-table-date">
                                    {new Date(actual.submitted_at).toLocaleDateString()}
                                </td>
                                <td className="kpi-actual-table-actions">
                                    <button 
                                        className="kpi-actual-view-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRowClick?.(actual);
                                        }}
                                    >
                                        <FiEye size={14} />
                                        View
                                    </button>
                                    {canValidate && actual.status === 'PENDING' && !isOwnRow && (
                                        <button 
                                            className="kpi-actual-validate-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStatusClick?.(actual);
                                            }}
                                        >
                                            Validate
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ActualTable;