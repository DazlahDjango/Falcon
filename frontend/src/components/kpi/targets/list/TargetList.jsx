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
    pagination = {},
    filters = {},
    onFilterChange,
    onClearFilters,
    onPageChange,
    onPageSizeChange,
    onRowClick,
    onEdit,
    onDelete,
    onCascade,
    onViewTree,
    onPhase,
    canEdit,
    canDelete,
    canCascade
}) => {
    if (loading && (!targets || targets.length === 0)) {
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
                onViewTree={onViewTree}
                onPhase={onPhase}
                canEdit={canEdit}
                canDelete={canDelete}
                canCascade={canCascade}
            />

            {targets && targets.length > 0 && (
                <KPIPagination
                    currentPage={pagination.page || pagination.currentPage || 1}
                    pageSize={pagination.pageSize || 20}
                    total={pagination.total || targets.length}
                    totalPages={pagination.totalPages || 1}
                    itemCount={targets.length}
                    isLoading={loading}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
        </div>
    );
};

export default TargetList;