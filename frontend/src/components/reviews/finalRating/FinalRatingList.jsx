// src/components/reviews/finalRating/FinalRatingList.jsx
import React, { useState } from 'react';
import './finalRating.css';
import FinalRatingCard from './FinalRatingCard';

const FinalRatingList = ({ 
    ratings = [], 
    loading = false, 
    onRatingClick, 
    onExport,
    title = "Final Ratings"
}) => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'calibrated', label: 'Calibrated' },
        { value: 'approved', label: 'Approved' },
        { value: 'locked', label: 'Locked' },
    ];

    const filteredRatings = ratings.filter(rating => {
        const matchesStatus = filterStatus === 'all' || rating.status === filterStatus;
        const matchesSearch = !searchTerm || 
            (rating.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (rating.final_rating_label?.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const stats = {
        total: ratings.length,
        pending: ratings.filter(r => r.status === 'pending').length,
        calibrated: ratings.filter(r => r.status === 'calibrated').length,
        approved: ratings.filter(r => r.status === 'approved').length,
        locked: ratings.filter(r => r.status === 'locked').length,
        averageScore: ratings.reduce((sum, r) => sum + (r.final_score || 0), 0) / (ratings.filter(r => r.final_score).length || 1),
        promotions: ratings.filter(r => r.promotion_recommended).length,
        pips: ratings.filter(r => r.pip_recommended).length,
    };

    if (loading) {
        return <div className="finalrating-loading">Loading final ratings...</div>;
    }

    return (
        <div className="finalrating-container">
            <div className="finalrating-header">
                <div>
                    <h2 className="finalrating-title">{title}</h2>
                    <p className="finalrating-subtitle">Final calibrated ratings after review cycles</p>
                </div>
                {onExport && (
                    <button className="btn-outline" onClick={onExport}>
                        📥 Export
                    </button>
                )}
            </div>

            <div className="finalrating-stats">
                <div className="finalrating-stat-card">
                    <div className="finalrating-stat-value">{stats.total}</div>
                    <div className="finalrating-stat-label">Total Ratings</div>
                </div>
                <div className="finalrating-stat-card">
                    <div className="finalrating-stat-value">{stats.pending}</div>
                    <div className="finalrating-stat-label">Pending</div>
                </div>
                <div className="finalrating-stat-card">
                    <div className="finalrating-stat-value">{stats.locked}</div>
                    <div className="finalrating-stat-label">Locked/Final</div>
                </div>
                <div className="finalrating-stat-card">
                    <div className="finalrating-stat-value">{stats.averageScore.toFixed(1)}%</div>
                    <div className="finalrating-stat-label">Average Score</div>
                </div>
                <div className="finalrating-stat-card">
                    <div className="finalrating-stat-value">{stats.promotions}</div>
                    <div className="finalrating-stat-label">Promotions</div>
                </div>
                <div className="finalrating-stat-card">
                    <div className="finalrating-stat-value">{stats.pips}</div>
                    <div className="finalrating-stat-label">PIPs</div>
                </div>
            </div>

            <div className="finalrating-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-select"
                    style={{ width: '150px' }}
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                
                <input
                    type="text"
                    placeholder="Search by employee or rating..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ width: '250px' }}
                />
            </div>

            {filteredRatings.length === 0 ? (
                <div className="finalrating-empty">
                    <p>No final ratings found.</p>
                </div>
            ) : (
                <div className="finalrating-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                    {filteredRatings.map(rating => (
                        <FinalRatingCard key={rating.id} rating={rating} onClick={onRatingClick} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FinalRatingList;