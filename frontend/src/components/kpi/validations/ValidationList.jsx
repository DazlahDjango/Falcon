import React from 'react';
import { FiInbox } from 'react-icons/fi';
import ValidationCard from './ValidationCard';
import KPIEmptyState from '../common/KPIEmptyState';
import KPILoading from '../common/KPILoading';
import KPIPagination from '../common/KPIPagination';

const ValidationList = ({ 
    validations, 
    loading, 
    onApprove, 
    onReject, 
    onEscalate,
    canValidate,
    pagination = {},
    onPageChange,
    onPageSizeChange
}) => {
    if (loading && (!validations || validations.length === 0)) {
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
            
            {validations && validations.length > 0 && (
                <KPIPagination 
                    currentPage={pagination.page || pagination.currentPage || 1}
                    pageSize={pagination.pageSize || 20}
                    total={pagination.total || validations.length}
                    totalPages={pagination.totalPages || 1}
                    itemCount={validations.length}
                    isLoading={loading}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
        </div>
    );
};

export default ValidationList;