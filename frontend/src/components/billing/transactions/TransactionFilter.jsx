import React from 'react';
import { FiX, FiFilter } from 'react-icons/fi';
import './transactions.css';

export const TransactionFilter = ({ filters, onChange, onApply, onClear, show }) => {
    if (!show) return null;

    const handleChange = (key, value) => { onChange({ ...filters, [key]: value }); };

    const statusOptions = [{ value: '', label: 'All Status' }, { value: 'success', label: 'Success' }, { value: 'pending', label: 'Pending' }, { value: 'failed', label: 'Failed' }, { value: 'refunded', label: 'Refunded' }, { value: 'disputed', label: 'Disputed' }];
    const typeOptions = [{ value: '', label: 'All Types' }, { value: 'subscription', label: 'Subscription' }, { value: 'renewal', label: 'Renewal' }, { value: 'upgrade', label: 'Upgrade' }, { value: 'downgrade', label: 'Downgrade' }, { value: 'refund', label: 'Refund' }, { value: 'one_time', label: 'One Time' }];

    return (
        <div className="transaction-filter-panel">
            <div className="filter-header"><FiFilter /> Filter Transactions <button className="filter-close" onClick={onClear}><FiX /></button></div>
            <div className="filter-row">
                <div className="filter-group"><label>Status</label><select value={filters.status || ''} onChange={(e) => handleChange('status', e.target.value || null)}>{statusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div>
                <div className="filter-group"><label>Type</label><select value={filters.type || ''} onChange={(e) => handleChange('type', e.target.value || null)}>{typeOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div>
                <div className="filter-group"><label>Reference</label><input type="text" placeholder="Search by reference" value={filters.reference || ''} onChange={(e) => handleChange('reference', e.target.value || null)} /></div>
                <div className="filter-group"><label>From Date</label><input type="date" value={filters.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value || null)} /></div>
                <div className="filter-group"><label>To Date</label><input type="date" value={filters.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value || null)} /></div>
                <div className="filter-actions"><button className="filter-apply" onClick={onApply}>Apply Filters</button><button className="filter-clear" onClick={onClear}>Clear All</button></div>
            </div>
        </div>
    );
};

export default TransactionFilter;