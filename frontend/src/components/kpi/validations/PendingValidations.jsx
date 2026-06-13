import React, { useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import ValidationList from './ValidationList';
import ValidationModal from './ValidationModal';
import PendingSummaryCard from './PendingSummaryCard';
import KPILoading from '../common/KPILoading';
import KPIError from '../common/KPIError';

const PendingValidations = ({ 
    validations, 
    summary, 
    loading, 
    error,
    onApprove,
    onReject,
    onRefresh,
    canValidate 
}) => {
    const [selectedValidation, setSelectedValidation] = useState(null);
    const [modalType, setModalType] = useState(null); // 'approve', 'reject'

    const handleApprove = (validation) => {
        setSelectedValidation(validation);
        setModalType('approve');
    };

    const handleReject = (validation) => {
        setSelectedValidation(validation);
        setModalType('reject');
    };

    const handleConfirm = async (data) => {
        if (modalType === 'approve') {
            await onApprove(selectedValidation.id, data.comment);
        } else if (modalType === 'reject') {
            await onReject(selectedValidation.id, data.reasonId, data.comment);
        }
        setSelectedValidation(null);
        setModalType(null);
        onRefresh();
    };

    if (loading) {
        return <KPILoading text="Loading pending validations..." />;
    }

    if (error) {
        return <KPIError message={error} onRetry={onRefresh} />;
    }

    return (
        <div className="kpi-validations-container">
            {summary && <PendingSummaryCard summary={summary} />}
            
            <ValidationList
                validations={validations}
                loading={loading}
                onApprove={handleApprove}
                onReject={handleReject}
                canValidate={canValidate}
            />
            
            <ValidationModal
                isOpen={!!modalType}
                type={modalType}
                validation={selectedValidation}
                onConfirm={handleConfirm}
                onClose={() => {
                    setSelectedValidation(null);
                    setModalType(null);
                }}
            />
        </div>
    );
};

export default PendingValidations;