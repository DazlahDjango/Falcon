import React from 'react';
import { FiEye, FiCheckCircle, FiXCircle, FiClock, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ActualStatusBadge from './ActualStatusBadge';
import useKPIPermissions from '../../../../hooks/kpi/useKPIPermissions';

const MONTH_NAMES = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const formatPeriod = (actual) => {
    if (actual.year && actual.month) {
        const monthName = MONTH_NAMES[actual.month - 1] || `M${actual.month}`;
        return `${monthName} ${actual.year}`;
    }
    return actual.period || 'N/A';
};

const ActualTable = ({ 
    actuals, 
    onRowClick, 
    onStatusClick, 
    onEdit, 
    onDelete, 
    canValidate 
}) => {
    const { user, isSuperAdmin, isPlatformAdmin, isClientAdmin } = useKPIPermissions();
    const isAdmin = isSuperAdmin || isPlatformAdmin || isClientAdmin;

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
                        <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
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

                        const canEdit = (isOwnRow || isAdmin) && actual.status === 'PENDING';
                        const canDelete = (isOwnRow || isAdmin) && actual.status !== 'APPROVED';

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
                                <td style={{ fontWeight: 600, color: '#1e293b' }}>
                                    {formatPeriod(actual)}
                                </td>
                                <td className="kpi-actual-table-value">{actual.actual_value}</td>
                                <td>
                                    <ActualStatusBadge status={actual.status} />
                                </td>
                                <td className="kpi-actual-table-date">
                                    {actual.submitted_at ? new Date(actual.submitted_at).toLocaleDateString() : '-'}
                                </td>
                                <td className="kpi-actual-table-actions" style={{ justifyContent: 'flex-end', paddingRight: '1rem' }}>
                                    <button 
                                        className="kpi-actual-view-btn"
                                        title="View Details"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRowClick?.(actual);
                                        }}
                                    >
                                        <FiEye size={13} />
                                        View
                                    </button>

                                    {canEdit && onEdit && (
                                        <button 
                                            className="kpi-actual-edit-btn"
                                            title="Edit Submission"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit?.(actual);
                                            }}
                                        >
                                            <FiEdit2 size={13} />
                                            Edit
                                        </button>
                                    )}

                                    {canDelete && onDelete && (
                                        <button 
                                            className="kpi-actual-delete-btn"
                                            title="Withdraw / Delete Submission"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete?.(actual);
                                            }}
                                        >
                                            <FiTrash2 size={13} />
                                            Delete
                                        </button>
                                    )}

                                    {(canValidate || isAdmin) && (actual.status === 'PENDING' || actual.status === 'ESCALATED') && (
                                        <button 
                                            className="kpi-actual-validate-btn"
                                            title="Validate & Approve / Reject"
                                            style={{
                                                background: '#dcfce7',
                                                color: '#15803d',
                                                border: '1px solid #bbf7d0',
                                                fontWeight: 600
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStatusClick?.(actual);
                                            }}
                                        >
                                            <FiCheckCircle size={13} />
                                            Review / Validate
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