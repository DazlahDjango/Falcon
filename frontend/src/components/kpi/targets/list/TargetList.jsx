import React from 'react';
import { FiInbox } from 'react-icons/fi';
import TargetTable from './TargetTable';
import TargetFilters from './TargetFilters';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPILoading from '../../common/KPILoading';
import KPIPagination from '../../common/KPIPagination';

const TargetList = ({ 
    targets, 
    loading, 
    pagination,
    filters = {},
    onFilterChange,
    onClearFilters,
    onPageChange,
    onRowClick,
    onEdit,
    onDelete,
    onCascade,
    canEdit,
    canDelete,
    canCascade
}) => {
    if (loading) {
        return <KPILoading text="Loading targets..." />;
    }

    if (!targets || targets.length === 0) {
        return (
            <KPIEmptyState 
                icon={<FiInbox size={40} />}
                title="No Targets Found"
                description="No annual targets have been set yet."
                actionText="Create Target"
                onAction={() => window.location.href = '/targets/create'}
            />
        );
    }

    return (
        <div className="kpi-target-list-container">
            <TargetFilters 
                filters={filters}
                onFilterChange={onFilterChange}
                onClearFilters={onClearFilters}
            />
            
            <TargetTable 
                targets={targets}
                onRowClick={onRowClick}
                onEdit={onEdit}
                onDelete={onDelete}
                onCascade={onCascade}
                canEdit={canEdit}
                canDelete={canDelete}
                canCascade={canCascade}
            />
            
            {pagination && pagination.totalPages > 1 && (
                <KPIPagination 
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
};

export default TargetList;