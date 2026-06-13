import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import KPISearchBar from '../../common/KPISearchBar';

const ActualFilters = ({ filters, onFilterChange, onClearFilters }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, label: 'Jan' }, { value: 2, label: 'Feb' },
        { value: 3, label: 'Mar' }, { value: 4, label: 'Apr' },
        { value: 5, label: 'May' }, { value: 6, label: 'Jun' },
        { value: 7, label: 'Jul' }, { value: 8, label: 'Aug' },
        { value: 9, label: 'Sep' }, { value: 10, label: 'Oct' },
        { value: 11, label: 'Nov' }, { value: 12, label: 'Dec' }
    ];

    const hasActiveFilters = filters.year || filters.month || filters.status || filters.search;

    return (
        <div className="kpi-actual-filters">
            <div className="kpi-actual-filters-search">
                <KPISearchBar 
                    value={filters.search || ''}
                    onSearch={(value) => onFilterChange('search', value)}
                    placeholder="Search by KPI or user..."
                />
            </div>
            
            <div className="kpi-actual-filters-group">
                <div className="kpi-actual-filter">
                    <select 
                        value={filters.year || ''}
                        onChange={(e) => onFilterChange('year', e.target.value)}
                    >
                        <option value="">All Years</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div className="kpi-actual-filter">
                    <select 
                        value={filters.month || ''}
                        onChange={(e) => onFilterChange('month', e.target.value)}
                    >
                        <option value="">All Months</option>
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="kpi-actual-filter">
                    <select 
                        value={filters.status || ''}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="ADJUSTED">Adjusted</option>
                    </select>
                </div>
                
                {hasActiveFilters && (
                    <button className="kpi-actual-filters-clear" onClick={onClearFilters}>
                        <FiX size={14} />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default ActualFilters;