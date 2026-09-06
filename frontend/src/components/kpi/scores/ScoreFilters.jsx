import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';
import KPISearchBar from '../common/KPISearchBar';

const ScoreFilters = ({ filters, onFilterChange, onClearFilters, years, months }) => {
    const currentYear = new Date().getFullYear();
    const yearOptions = years || Array.from({ length: 5 }, (_, i) => currentYear - i);
    const monthOptions = months || [
                        { value: 1, label: 'January' }, { value: 2, label: 'February' },
                        { value: 3, label: 'March' }, { value: 4, label: 'April' },
                        { value: 5, label: 'May' }, { value: 6, label: 'June' },
                        { value: 7, label: 'July' }, { value: 8, label: 'August' },
                        { value: 9, label: 'September' }, { value: 10, label: 'October' },
                        { value: 11, label: 'November' }, { value: 12, label: 'December' }
                    ];

    const hasActiveFilters = filters.year || filters.month || filters.kpi_id || filters.user_id;

    return (
        <div className="kpi-score-filters">
            <div className="kpi-score-filters-search">
                <KPISearchBar 
                    value={filters.search || ''}
                    onSearch={(value) => onFilterChange('search', value)}
                    placeholder="Search by Performance Indicator or user..."
                />
            </div>
            
            <div className="kpi-score-filters-group">
                <div className="kpi-score-filter">
                    <label>Year</label>
                    <select 
                        value={filters.year || ''}
                        onChange={(e) => onFilterChange('year', e.target.value)}
                    >
                        <option value="">All Years</option>
                        {yearOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div className="kpi-score-filter">
                    <label>Month</label>
                    <select 
                        value={filters.month || ''}
                        onChange={(e) => onFilterChange('month', e.target.value)}
                    >
                        <option value="">All Months</option>
                        {monthOptions.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="kpi-score-filter">
                    <label>Status</label>
                    <select 
                        value={filters.status || ''}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="GREEN">Green (On Track)</option>
                        <option value="YELLOW">Yellow (At Risk)</option>
                        <option value="RED">Red (Off Track)</option>
                    </select>
                </div>
                
                {hasActiveFilters && (
                    <button className="kpi-score-filters-clear" onClick={onClearFilters}>
                        <FiX size={14} />
                        Clear Filters
                    </button>
                )}
            </div>
        </div>
    );
};

export default ScoreFilters;