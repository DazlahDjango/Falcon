import React from 'react';
import { FiCalendar, FiRefreshCw } from 'react-icons/fi';

const KPISummaryFilters = ({ filters, onFilterChange, onRefresh, loading }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
    const months = [
                        { value: 1, label: 'January' }, { value: 2, label: 'February' },
                        { value: 3, label: 'March' }, { value: 4, label: 'April' },
                        { value: 5, label: 'May' }, { value: 6, label: 'June' },
                        { value: 7, label: 'July' }, { value: 8, label: 'August' },
                        { value: 9, label: 'September' }, { value: 10, label: 'October' },
                        { value: 11, label: 'November' }, { value: 12, label: 'December' }
                    ];
    
    return (
        <div className="analytics-toolbar">
            <div className="analytics-filters">
                <div className="analytics-filter-group">
                    <FiCalendar size={14} />
                    <select 
                        value={filters.year || ''}
                        onChange={(e) => onFilterChange('year', parseInt(e.target.value))}
                    >
                        <option value="">Select Year</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>
                
                <div className="analytics-filter-group">
                    <FiCalendar size={14} />
                    <select 
                        value={filters.month || ''}
                        onChange={(e) => onFilterChange('month', parseInt(e.target.value))}
                    >
                        <option value="">Select Month</option>
                        {months.map(month => (
                            <option key={month.value} value={month.value}>{month.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <button className="analytics-refresh-btn" onClick={onRefresh} disabled={loading}>
                <FiRefreshCw size={14} className={loading ? 'spin' : ''} />
                {loading ? 'Loading...' : 'Refresh'}
            </button>
        </div>
    );
};

export default KPISummaryFilters;