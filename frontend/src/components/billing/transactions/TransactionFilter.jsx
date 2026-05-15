import React, { useState } from 'react';
import PropTypes from 'prop-types';

export const TransactionFilter = ({ filters, onFilterChange, onClear }) => {
    const [localFilters, setLocalFilters] = useState({
        status: filters.status || '',
        type: filters.transaction_type || '',
        startDate: filters.start_date || '',
        endDate: filters.end_date || '',
    });

    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
    };

    const handleApply = () => {
        const appliedFilters = {};
        if (localFilters.status) appliedFilters.status = localFilters.status;
        if (localFilters.type) appliedFilters.transaction_type = localFilters.type;
        if (localFilters.startDate) appliedFilters.start_date = localFilters.startDate;
        if (localFilters.endDate) appliedFilters.end_date = localFilters.endDate;
        onFilterChange(appliedFilters);
    };

    const handleClear = () => {
        setLocalFilters({
            status: '',
            type: '',
            startDate: '',
            endDate: '',
        });
        onClear();
    };

    const hasActiveFilters = localFilters.status || localFilters.type || 
                             localFilters.startDate || localFilters.endDate;

    return (
        <div className="transaction-filter">
            <div className="transaction-filter-group">
                <label className="transaction-filter-label">Status</label>
                <select
                    className="transaction-filter-select"
                    value={localFilters.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                >
                    <option value="">All</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                </select>
            </div>

            <div className="transaction-filter-group">
                <label className="transaction-filter-label">Type</label>
                <select
                    className="transaction-filter-select"
                    value={localFilters.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                >
                    <option value="">All</option>
                    <option value="subscription">Subscription</option>
                    <option value="renewal">Renewal</option>
                    <option value="upgrade">Upgrade</option>
                    <option value="downgrade">Downgrade</option>
                    <option value="refund">Refund</option>
                    <option value="one_time">One-time</option>
                </select>
            </div>

            <div className="transaction-filter-group">
                <label className="transaction-filter-label">From Date</label>
                <input
                    type="date"
                    className="transaction-filter-input"
                    value={localFilters.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                />
            </div>

            <div className="transaction-filter-group">
                <label className="transaction-filter-label">To Date</label>
                <input
                    type="date"
                    className="transaction-filter-input"
                    value={localFilters.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                />
            </div>

            <div className="transaction-filter-actions">
                <button className="transaction-filter-apply" onClick={handleApply}>
                    Apply
                </button>
                {hasActiveFilters && (
                    <button className="transaction-filter-clear" onClick={handleClear}>
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
};

TransactionFilter.propTypes = {
    filters: PropTypes.object,
    onFilterChange: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
};

export default TransactionFilter;