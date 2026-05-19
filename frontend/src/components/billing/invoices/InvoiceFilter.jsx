import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const InvoiceFilter = ({ filters, onFilterChange, onClear }) => {
    const [localFilters, setLocalFilters] = useState({
        status: filters.status || '',
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
    });

    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
    };

    const handleApply = () => {
        const appliedFilters = {};
        if (localFilters.status) appliedFilters.status = localFilters.status;
        if (localFilters.startDate) appliedFilters.start_date = localFilters.startDate;
        if (localFilters.endDate) appliedFilters.end_date = localFilters.endDate;
        onFilterChange(appliedFilters);
    };

    const handleClear = () => {
        setLocalFilters({
            status: '',
            startDate: '',
            endDate: '',
        });
        onClear();
    };

    const hasActiveFilters = localFilters.status || localFilters.startDate || localFilters.endDate;

    return (
        <div className="invoice-filter">
            <div className="invoice-filter-group">
                <label className="invoice-filter-label">Status</label>
                <select
                    className="invoice-filter-select"
                    value={localFilters.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                >
                    <option value="">All</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="invoice-filter-group">
                <label className="invoice-filter-label">From Date</label>
                <input
                    type="date"
                    className="invoice-filter-input"
                    value={localFilters.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                />
            </div>

            <div className="invoice-filter-group">
                <label className="invoice-filter-label">To Date</label>
                <input
                    type="date"
                    className="invoice-filter-input"
                    value={localFilters.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                />
            </div>

            <div className="invoice-filter-actions">
                <button className="invoice-filter-apply" onClick={handleApply}>
                    Apply
                </button>
                {hasActiveFilters && (
                    <button className="invoice-filter-clear" onClick={handleClear}>
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

InvoiceFilter.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
};

export default InvoiceFilter;