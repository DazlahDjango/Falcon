import React from 'react';
import { FiX } from 'react-icons/fi';
import KPISearchBar from '../../common/KPISearchBar';

const TargetFilters = ({ filters = {}, onFilterChange = () => {}, onClearFilters = () => {} }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i + 1);

    const safeFilters = filters || {};
    const hasActiveFilters = Boolean(safeFilters.year || safeFilters.status || safeFilters.search);

    return (
        <div className="kpi-target-filters">
            <div className="kpi-target-filters-search">
                <KPISearchBar 
                    value={safeFilters.search || ''}
                    onSearch={(value) => onFilterChange('search', value)}
                    placeholder="Search by KPI or user..."
                />
            </div>
            
            <div className="kpi-target-filters-group">
                <div className="kpi-target-filter">
                    <select 
                        value={safeFilters.year || ''}
                        onChange={(e) => onFilterChange('year', e.target.value)}
                    >
                        <option value="">All Years</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div className="kpi-target-filter">
                    <select 
                        value={safeFilters.status || ''}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>
                
                {hasActiveFilters && (
                    <button className="kpi-target-filters-clear" onClick={onClearFilters}>
                        <FiX size={14} />
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

export default TargetFilters;