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
    pagination,
    filters,
    onFilterChange,
    onClearFilters,
    onPageChange,
    onRowClick,
    onStatusClick,
    canValidate
}) => {
    if (loading) {
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

export default ActualList;