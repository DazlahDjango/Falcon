import React from 'react';
import { FiCalendar, FiFilter } from 'react-icons/fi';

const ReportFilters = ({ dateRange, onDateRangeChange, reportType }) => {
    const handleQuickDateRange = (range) => {
        const today = new Date();
        let startDate = new Date();

        switch (range) {
            case 'today':
                startDate = today;
                break;
            case 'week':
                startDate.setDate(today.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(today.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(today.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(today.getFullYear() - 1);
                break;
        }

        onDateRangeChange({
            start_date: startDate.toISOString().split('T')[0],
            end_date: today.toISOString().split('T')[0]
        });
    };

    return (
        <div className="report-section">
            <label className="section-label">
                <FiCalendar size={14} />
                Date Range
            </label>
            <div className="date-range-actions">
                <button className="date-range-btn" onClick={() => handleQuickDateRange('today')}>Today</button>
                <button className="date-range-btn" onClick={() => handleQuickDateRange('week')}>Last 7 Days</button>
                <button className="date-range-btn" onClick={() => handleQuickDateRange('month')}>Last 30 Days</button>
                <button className="date-range-btn" onClick={() => handleQuickDateRange('quarter')}>Last 90 Days</button>
                <button className="date-range-btn" onClick={() => handleQuickDateRange('year')}>Last Year</button>
            </div>
            <div className="date-range-inputs">
                <input
                    type="date"
                    value={dateRange.start_date}
                    onChange={(e) => onDateRangeChange(prev => ({ ...prev, start_date: e.target.value }))}
                    className="form-input"
                />
                <span className="date-separator">to</span>
                <input
                    type="date"
                    value={dateRange.end_date}
                    onChange={(e) => onDateRangeChange(prev => ({ ...prev, end_date: e.target.value }))}
                    className="form-input"
                />
            </div>
        </div>
    );
};

export default ReportFilters;