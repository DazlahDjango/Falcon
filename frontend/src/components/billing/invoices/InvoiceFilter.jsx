import React from 'react';
import { FiX, FiFilter } from 'react-icons/fi';
import './invoices.css';

export const InvoiceFilter = ({ filters, onChange, onApply, onClear, show }) => {
    if (!show) return null;

    const handleChange = (key, value) => { onChange({ ...filters, [key]: value }); };

    const statusOptions = [{ value: '', label: 'All Status' }, { value: 'pending', label: 'Pending' }, { value: 'paid', label: 'Paid' }, { value: 'overdue', label: 'Overdue' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'refunded', label: 'Refunded' }];

    return (
        <div className="invoice-filter-panel">
            <div className="filter-header"><FiFilter /> Filter Invoices <button className="filter-close" onClick={onClear}><FiX /></button></div>
            <div className="filter-row">
                <div className="filter-group"><label>Status</label><select value={filters.status || ''} onChange={(e) => handleChange('status', e.target.value || null)}>{statusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}</select></div>
                <div className="filter-group"><label className="checkbox-label"><input type="checkbox" checked={filters.unpaidOnly || false} onChange={(e) => handleChange('unpaidOnly', e.target.checked)} /> Show Unpaid Only</label></div>
                <div className="filter-group"><label>From Date</label><input type="date" value={filters.startDate || ''} onChange={(e) => handleChange('startDate', e.target.value || null)} /></div>
                <div className="filter-group"><label>To Date</label><input type="date" value={filters.endDate || ''} onChange={(e) => handleChange('endDate', e.target.value || null)} /></div>
                <div className="filter-actions"><button className="filter-apply" onClick={onApply}>Apply Filters</button><button className="filter-clear" onClick={onClear}>Clear All</button></div>
            </div>
        </div>
    );
};

export default InvoiceFilter;