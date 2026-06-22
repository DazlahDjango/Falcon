// src/components/reviews/cycle/CycleList.jsx
import React, { useState } from 'react';
import './cycle.css';
import CycleCard from './CycleCard';
import { REVIEW_CYCLE_STATUS_LABELS } from '@/config/constants';

const CycleList = ({ 
    cycles = [], 
    loading = false, 
    onCycleClick, 
    onCreateClick,
    onFilterChange,
}) => {
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'draft', label: REVIEW_CYCLE_STATUS_LABELS.draft },
        { value: 'active', label: REVIEW_CYCLE_STATUS_LABELS.active },
        { value: 'completed', label: REVIEW_CYCLE_STATUS_LABELS.completed },
        { value: 'archived', label: REVIEW_CYCLE_STATUS_LABELS.archived },
    ];

    const handleStatusFilter = (status) => {
        setFilterStatus(status);
        onFilterChange?.({ status, search: searchTerm });
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        onFilterChange?.({ status: filterStatus, search: term });
    };

    if (loading) {
        return <div className="cycle-loading">Loading cycles...</div>;
    }

    if (!cycles || cycles.length === 0) {
        return (
            <div className="cycle-empty">
                <p>No review cycles found.</p>
                {onCreateClick && (
                    <button className="btn-primary" onClick={onCreateClick}>
                        Create First Cycle
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="cycle-container">
            <div className="cycle-header">
                <h2 className="cycle-title">Review Cycles</h2>
                {onCreateClick && (
                    <button className="btn-primary" onClick={onCreateClick}>
                        + New Cycle
                    </button>
                )}
            </div>

            <div className="cycle-filters">
                <select 
                    value={filterStatus} 
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="form-select"
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                
                <input
                    type="text"
                    placeholder="Search cycles by name..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="form-input"
                    style={{ width: '250px' }}
                />
            </div>

            <div className="cycle-list">
                {cycles.map(cycle => (
                    <CycleCard 
                        key={cycle.id} 
                        cycle={cycle} 
                        onClick={onCycleClick}
                    />
                ))}
            </div>
        </div>
    );
};

export default CycleList;