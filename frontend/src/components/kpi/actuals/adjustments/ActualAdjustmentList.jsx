import React, { useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiUser } from 'react-icons/fi';
import ActualAdjustmentForm from './ActualAdjustmentForm';
import ActualAdjustmentApprove from './ActualAdjustmentApprove';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPILoading from '../../common/KPILoading';

import useKPIPermissions from '../../../../hooks/kpi/useKPIPermissions';

const ActualAdjustmentList = ({ 
    adjustments, 
    loading, 
    onApprove,
    canApprove 
}) => {
    const { user } = useKPIPermissions();
    const [selectedAdjustment, setSelectedAdjustment] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);

    if (loading) {
        return <KPILoading text="Loading adjustments..." />;
    }

    if (!adjustments || adjustments.length === 0) {
        return (
            <KPIEmptyState 
                icon={<FiAlertCircle size={40} />}
                title="No Adjustments"
                description="No adjustment requests found."
            />
        );
    }

    const getStatusIcon = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return <FiCheckCircle size={14} color="var(--kpi-success)" />;
            case 'REJECTED': return <FiAlertCircle size={14} color="var(--kpi-danger)" />;
            default: return <FiClock size={14} color="var(--kpi-warning)" />;
        }
    };

    const getStatusClass = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return 'approved';
            case 'REJECTED': return 'rejected';
            default: return 'pending';
        }
    };

    return (
        <div className="kpi-adjustment-list">
            <div className="kpi-adjustment-list-header">
                <h3>Adjustment Requests</h3>
                <span className="kpi-adjustment-list-count">{adjustments.length} requests</span>
            </div>
            
            <div className="kpi-adjustment-items">
                {adjustments.map(adjustment => {
                    const isOwnAdjustment = Boolean(adjustment && user && (
                        String(adjustment.requested_by_id) === String(user.id) ||
                        String(adjustment.user_id) === String(user.id) ||
                        (adjustment.requested_by_email && user.email && adjustment.requested_by_email.toLowerCase() === user.email.toLowerCase())
                    ));

                    return (
                        <div key={adjustment.id} className="kpi-adjustment-item">
                            <div className="kpi-adjustment-item-header">
                                <div className="kpi-adjustment-item-title">
                                    {adjustment.kpi_name}
                                </div>
                                <div className={`kpi-adjustment-status ${getStatusClass(adjustment.status)}`}>
                                    {getStatusIcon(adjustment.status)}
                                    {adjustment.status}
                                </div>
                            </div>
                            
                            <div className="kpi-adjustment-item-details">
                                <div className="kpi-adjustment-detail">
                                    <span className="kpi-adjustment-label">Original:</span>
                                    <span className="kpi-adjustment-value original">{adjustment.original_value}</span>
                                </div>
                                <div className="kpi-adjustment-detail">
                                    <span className="kpi-adjustment-label">Adjusted:</span>
                                    <span className="kpi-adjustment-value adjusted">{adjustment.adjusted_value}</span>
                                </div>
                                <div className="kpi-adjustment-detail">
                                    <FiUser size={12} />
                                    <span>{adjustment.requested_by_email}</span>
                                </div>
                            </div>
                            
                            <div className="kpi-adjustment-item-reason">
                                <strong>Reason:</strong> {adjustment.reason}
                            </div>
                            
                            {canApprove && adjustment.status === 'PENDING' && !isOwnAdjustment && (
                                <div className="kpi-adjustment-item-actions">
                                    <button 
                                        className="kpi-adjustment-approve-btn"
                                        onClick={() => {
                                            setSelectedAdjustment(adjustment);
                                            setShowApproveModal(true);
                                        }}
                                    >
                                        <FiCheckCircle size={14} />
                                        Approve
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {showApproveModal && selectedAdjustment && (
                <ActualAdjustmentApprove 
                    adjustment={selectedAdjustment}
                    onConfirm={async (comment) => {
                        await onApprove(selectedAdjustment.id, comment);
                        setShowApproveModal(false);
                        setSelectedAdjustment(null);
                    }}
                    onClose={() => {
                        setShowApproveModal(false);
                        setSelectedAdjustment(null);
                    }}
                />
            )}
        </div>
    );
};

export default ActualAdjustmentList;