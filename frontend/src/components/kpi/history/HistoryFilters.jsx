import React, { useState } from 'react';
import { FiCalendar, FiUser, FiFilter } from 'react-icons/fi';

const HistoryFilters = ({ onFilter }) => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        performedBy: '',
        action: ''
    });
    
    const handleChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
        onFilter?.(newFilters);
    };
    
    const handleClear = () => {
        setFilters({ startDate: '', endDate: '', performedBy: '', action: '' });
        onFilter?.({});
    };
    
    return (
        <div className="history-filters">
            <div className="filters-row">
                <div className="filter-group">
                    <FiCalendar size={14} />
                    <input 
                        type="date"
                        placeholder="Start Date"
                        value={filters.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FiCalendar size={14} />
                    <input 
                        type="date"
                        placeholder="End Date"
                        value={filters.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FiUser size={14} />
                    <input 
                        type="text"
                        placeholder="Performed By"
                        value={filters.performedBy}
                        onChange={(e) => handleChange('performedBy', e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FiFilter size={14} />
                    <select 
                        value={filters.action}
                        onChange={(e) => handleChange('action', e.target.value)}
                    >
                        <option value="">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="APPROVE">Approve</option>
                        <option value="REJECT">Reject</option>
                        <option value="ACTIVATE">Activate</option>
                        <option value="DEACTIVATE">Deactivate</option>
                    </select>
                </div>
                <button className="clear-filters-btn" onClick={handleClear}>
                    Clear
                </button>
            </div>
        </div>
    );
};

export default HistoryFilters;