import React from 'react';
import { FiInbox } from 'react-icons/fi';
import ValidationCard from './ValidationCard';
import KPIEmptyState from '../common/KPIEmptyState';
import KPILoading from '../common/KPILoading';

const ValidationList = ({ 
    validations, 
    loading, 
    onApprove, 
    onReject, 
    onEscalate,
    canValidate 
}) => {
    if (loading) {
        return <KPILoading text="Loading validations..." />;
    }

    if (!validations || validations.length === 0) {
        return (
            <KPIEmptyState 
                icon={<FiInbox size={40} />}
                title="No Validations"
                description="There are no pending validations at the moment."
            />
        );
    }

    return (
        <div className="kpi-validation-list">
            <div className="kpi-validation-list-header">
                <span className="kpi-validation-list-title">
                    Validations
                </span>
                <span className="kpi-validation-list-count">
                    {validations.length} items
                </span>
            </div>
            
            {validations.map(validation => (
                <ValidationCard
                    key={validation.id}
                    validation={validation}
                    onApprove={onApprove}
                    onReject={onReject}
                    onEscalate={onEscalate}
                    canValidate={canValidate}
                />
            ))}
        </div>
    );
};

export default ValidationList;