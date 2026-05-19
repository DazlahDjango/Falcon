// src/components/reviews/pip/PIPList.jsx
import React, { useState } from 'react';
import './pip.css';
import PIPCard from './PIPCard';

const PIPList = ({ 
    pips = [], 
    loading = false, 
    onPipClick, 
    onCreateClick,
    onFilterChange,
    title = "Performance Improvement Plans"
}) => {
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' },
    ];

    const severityOptions = [
        { value: '', label: 'All Severity' },
        { value: 'minor', label: 'Minor' },
        { value: 'moderate', label: 'Moderate' },
        { value: 'severe', label: 'Severe' },
        { value: 'critical', label: 'Critical' },
    ];

    const filteredPips = pips.filter(pip => {
        const matchesStatus = !filterStatus || pip.status === filterStatus;
        const matchesSeverity = !filterSeverity || pip.severity === filterSeverity;
        const matchesSearch = !searchTerm || 
            pip.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pip.employee_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSeverity && matchesSearch;
    });

    const stats = {
        total: pips.length,
        active: pips.filter(p => p.status === 'active').length,
        overdue: pips.filter(p => p.is_overdue).length,
        completed: pips.filter(p => p.status === 'completed').length,
    };

    if (loading) {
        return <div className="pip-loading">Loading PIPs...</div>;
    }

    return (
        <div className="pip-container">
            <div className="pip-header">
                <div>
                    <h2 className="pip-title">{title}</h2>
                    <p className="pip-subtitle">Track and manage performance improvement plans</p>
                </div>
                {onCreateClick && (
                    <button className="btn-primary" onClick={onCreateClick}>
                        + New PIP
                    </button>
                )}
            </div>

            <div className="pip-stats">
                <div className="pip-stat-card">
                    <div className="pip-stat-value">{stats.total}</div>
                    <div className="pip-stat-label">Total PIPs</div>
                </div>
                <div className="pip-stat-card">
                    <div className="pip-stat-value">{stats.active}</div>
                    <div className="pip-stat-label">Active</div>
                </div>
                <div className="pip-stat-card">
                    <div className="pip-stat-value">{stats.overdue}</div>
                    <div className="pip-stat-label">Overdue</div>
                </div>
                <div className="pip-stat-card">
                    <div className="pip-stat-value">{stats.completed}</div>
                    <div className="pip-stat-label">Completed</div>
                </div>
            </div>

            <div className="pip-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <select 
                    value={filterStatus} 
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        onFilterChange?.({ status: e.target.value, severity: filterSeverity, search: searchTerm });
                    }}
                    className="form-select"
                    style={{ width: '150px' }}
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                
                <select 
                    value={filterSeverity} 
                    onChange={(e) => {
                        setFilterSeverity(e.target.value);
                        onFilterChange?.({ status: filterStatus, severity: e.target.value, search: searchTerm });
                    }}
                    className="form-select"
                    style={{ width: '150px' }}
                >
                    {severityOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                
                <input
                    type="text"
                    placeholder="Search by title or employee..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        onFilterChange?.({ status: filterStatus, severity: filterSeverity, search: e.target.value });
                    }}
                    className="form-input"
                    style={{ width: '250px' }}
                />
            </div>

            {filteredPips.length === 0 ? (
                <div className="pip-empty">
                    <p>No PIPs found matching your filters.</p>
                </div>
            ) : (
                <div className="pip-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredPips.map(pip => (
                        <PIPCard key={pip.id} pip={pip} onClick={onPipClick} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PIPList;