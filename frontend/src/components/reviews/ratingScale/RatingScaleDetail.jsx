// src/components/reviews/ratingScale/RatingScaleDetail.jsx
import React, { useState } from 'react';
import './ratingScale.css';

const RatingScaleDetail = ({ 
    ratingScale, 
    onEdit, 
    onSetDefault, 
    onDelete, 
    canManage = false 
}) => {
    const [showConverter, setShowConverter] = useState(false);
    const [convertData, setConvertData] = useState({
        score: '',
        from_type: 'raw',
        to_type: 'percentage',
    });
    const [convertResult, setConvertResult] = useState(null);

    if (!ratingScale) {
        return <div className="ratingscale-loading">Loading rating scale details...</div>;
    }

    const handleConvert = async () => {
        // This would call the ratingScaleService.convertScore
        // For now, mock result
        setConvertResult({
            original_score: convertData.score,
            from_type: convertData.from_type,
            to_type: convertData.to_type,
            result: convertData.score * 20,
        });
    };

    return (
        <div className="ratingscale-detail">
            <div className="ratingscale-detail-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h2 className="ratingscale-title">{ratingScale.name}</h2>
                        <div style={{ marginTop: '0.5rem' }}>
                            {ratingScale.is_default && (
                                <span className="ratingscale-card-badge ratingscale-badge-default" style={{ marginRight: '0.5rem' }}>
                                    Default Scale
                                </span>
                            )}
                            {ratingScale.is_active ? (
                                <span className="ratingscale-card-badge ratingscale-badge-active">Active</span>
                            ) : (
                                <span className="ratingscale-card-badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>Inactive</span>
                            )}
                        </div>
                    </div>
                    {canManage && (
                        <div className="ratingscale-actions">
                            {!ratingScale.is_default && (
                                <button className="btn-success" onClick={() => onSetDefault(ratingScale.id)}>
                                    Set as Default
                                </button>
                            )}
                            <button className="btn-primary" onClick={() => onEdit(ratingScale.id)}>
                                Edit
                            </button>
                            <button className="btn-secondary" onClick={() => onDelete(ratingScale.id)}>
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="ratingscale-detail-section">
                <h3 className="ratingscale-section-title">Scale Information</h3>
                <div className="ratingscale-info-grid">
                    <div className="ratingscale-info-item">
                        <span className="ratingscale-info-label">Range</span>
                        <span className="ratingscale-info-value">{ratingScale.min_value} - {ratingScale.max_value}</span>
                    </div>
                    <div className="ratingscale-info-item">
                        <span className="ratingscale-info-label">Levels</span>
                        <span className="ratingscale-info-value">{ratingScale.levels?.length || 0}</span>
                    </div>
                    <div className="ratingscale-info-item">
                        <span className="ratingscale-info-label">Decimal Support</span>
                        <span className="ratingscale-info-value">{ratingScale.allow_decimal ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="ratingscale-info-item">
                        <span className="ratingscale-info-label">Scoring Type</span>
                        <span className="ratingscale-info-value">{ratingScale.scoring_type || 'Raw Score'}</span>
                    </div>
                </div>
            </div>

            {ratingScale.description && (
                <div className="ratingscale-detail-section">
                    <h3 className="ratingscale-section-title">Description</h3>
                    <p style={{ margin: 0 }}>{ratingScale.description}</p>
                </div>
            )}

            <div className="ratingscale-detail-section">
                <h3 className="ratingscale-section-title">Rating Levels</h3>
                <div className="levels-container">
                    {ratingScale.levels?.map((level, index) => (
                        <div key={index} className="level-row">
                            <div className="level-value">{level.value}</div>
                            <div className="level-label">{level.label}</div>
                            <div 
                                className="level-color" 
                                style={{ backgroundColor: level.color }}
                            />
                            <div className="level-min-pct">
                                {level.min_pct !== undefined ? `≥ ${level.min_pct}%` : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="ratingscale-detail-section">
                <h3 className="ratingscale-section-title">Score Converter</h3>
                <div className="convert-score-section">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Score</label>
                            <input
                                type="number"
                                className="form-input"
                                value={convertData.score}
                                onChange={(e) => setConvertData(prev => ({ ...prev, score: e.target.value }))}
                                placeholder="Enter score"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">From</label>
                            <select
                                className="form-select"
                                value={convertData.from_type}
                                onChange={(e) => setConvertData(prev => ({ ...prev, from_type: e.target.value }))}
                            >
                                <option value="raw">Raw Score</option>
                                <option value="percentage">Percentage</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">To</label>
                            <select
                                className="form-select"
                                value={convertData.to_type}
                                onChange={(e) => setConvertData(prev => ({ ...prev, to_type: e.target.value }))}
                            >
                                <option value="raw">Raw Score</option>
                                <option value="percentage">Percentage</option>
                                <option value="label">Rating Label</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={handleConvert} style={{ width: '100%' }}>
                        Convert Score
                    </button>
                    
                    {convertResult && (
                        <div className="convert-result">
                            <div>{convertResult.original_score} ({convertResult.from_type}) → </div>
                            <div className="convert-result-label">
                                {convertResult.result} ({convertResult.to_type})
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RatingScaleDetail;