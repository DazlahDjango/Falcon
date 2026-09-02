import React from 'react';
import { FiInbox } from 'react-icons/fi';
import ActualTable from './ActualTable';
import ActualFilters from './ActualFilters';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPILoading from '../../common/KPILoading';
import KPIPagination from '../../common/KPIPagination';

const ActualList = ({ 
    actuals, 
    loading, 
    pagination = {},
    filters,
    onFilterChange,
    onClearFilters,
    onPageChange,
    onPageSizeChange,
    onRowClick,
    onStatusClick,
    canValidate
}) => {
    if (loading && (!actuals || actuals.length === 0)) {
        return <KPILoading text="Loading actuals..." />;
    }

    if (!actuals || actuals.length === 0) {
        return (
            <KPIEmptyState 
                icon={<FiInbox size={40} />}
                title="No Actuals Found"
                description="No actual submissions have been recorded yet."
            />
        );
    }

    return (
        <div className="kpi-actual-list-container">
            <ActualFilters 
                filters={filters}
                onFilterChange={onFilterChange}
                onClearFilters={onClearFilters}
            />
            
            <ActualTable 
                actuals={actuals}
                onRowClick={onRowClick}
                onStatusClick={onStatusClick}
                canValidate={canValidate}
            />
            
            {actuals && actuals.length > 0 && (
                <KPIPagination 
                    currentPage={pagination.page || pagination.currentPage || 1}
                    pageSize={pagination.pageSize || 20}
                    total={pagination.total || actuals.length}
                    totalPages={pagination.totalPages || 1}
                    itemCount={actuals.length}
                    isLoading={loading}
                    onPageChange={onPageChange}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
        </div>
    );
};

export default ActualList;