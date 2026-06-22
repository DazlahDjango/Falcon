import React from 'react';
import { useSelector } from 'react-redux';
import { selectSectors, selectFrameworks, selectCategories } from '../../../../store/kpi';

const KPICreateStep3 = ({ data, onSubmit, onBack, onCancel, loading }) => {
    const sectors = useSelector(selectSectors);
    const frameworks = useSelector(selectFrameworks);
    const categories = useSelector(selectCategories);
    
    const getSectorName = (id) => sectors?.find(s => s.id === id)?.name || id;
    const getFrameworkName = (id) => frameworks?.find(f => f.id === id)?.name || id;
    const getCategoryName = (id) => categories?.find(c => c.id === id)?.name || 'None';
    
    const getKpiTypeLabel = (type) => {
        const types = {
            COUNT: 'Count / Number',
            PERCENTAGE: 'Percentage (%)',
            FINANCIAL: 'Financial Amount',
            MILESTONE: 'Yes / No Milestone',
            TIME: 'Time / Turnaround',
            IMPACT: 'Impact Score'
        };
        return types[type] || type;
    };
    
    const getCalculationLogicLabel = (logic) => {
        return logic === 'HIGHER_IS_BETTER' ? 'Higher is Better' : 'Lower is Better';
    };
    
    const getMeasureTypeLabel = (type) => {
        return type === 'CUMULATIVE' ? 'Cumulative (YTD)' : 'Non-Cumulative';
    };
    
    const formatTargetRange = () => {
        const min = data.target_min;
        const max = data.target_max;
        if (min && max) return `${min} — ${max}`;
        if (min) return `${min} — ∞`;
        if (max) return `0 — ${max}`;
        return 'No range set';
    };
    
    return (
        <div className="kpi-create-step">
            <div className="step-header">
                <h3>Review & Confirm</h3>
                <p>Please review all information before creating the KPI</p>
            </div>
            
            <div className="review-section">
                <h4>Basic Information</h4>
                <div className="review-grid">
                    <div className="review-item">
                        <label>Name</label>
                        <span>{data.name || '—'}</span>
                    </div>
                    <div className="review-item">
                        <label>Code</label>
                        <span>{data.code || '—'}</span>
                    </div>
                    <div className="review-item">
                        <label>Description</label>
                        <span className="multiline">{data.description || '—'}</span>
                    </div>
                </div>
            </div>
            
            <div className="review-section">
                <h4>Configuration</h4>
                <div className="review-grid">
                    <div className="review-item">
                        <label>KPI Type</label>
                        <span>{getKpiTypeLabel(data.kpi_type)}</span>
                    </div>
                    <div className="review-item">
                        <label>Calculation</label>
                        <span>{getCalculationLogicLabel(data.calculation_logic)}</span>
                    </div>
                    <div className="review-item">
                        <label>Measure Type</label>
                        <span>{getMeasureTypeLabel(data.measure_type)}</span>
                    </div>
                    <div className="review-item">
                        <label>Unit</label>
                        <span>{data.unit || 'No unit'}</span>
                    </div>
                    <div className="review-item">
                        <label>Decimal Places</label>
                        <span>{data.decimal_places}</span>
                    </div>
                    <div className="review-item">
                        <label>Target Range</label>
                        <span>{formatTargetRange()}</span>
                    </div>
                </div>
            </div>
            
            <div className="review-section">
                <h4>Assignment</h4>
                <div className="review-grid">
                    <div className="review-item">
                        <label>Framework</label>
                        <span>{getFrameworkName(data.framework_id)}</span>
                    </div>
                    <div className="review-item">
                        <label>Sector</label>
                        <span>{getSectorName(data.sector_id)}</span>
                    </div>
                    <div className="review-item">
                        <label>Category</label>
                        <span>{getCategoryName(data.category_id)}</span>
                    </div>
                    <div className="review-item">
                        <label>Strategic Objective</label>
                        <span>{data.strategic_objective || '—'}</span>
                    </div>
                    <div className="review-item">
                        <label>Initial Status</label>
                        <span className={data.is_active ? 'status-active' : 'status-inactive'}>
                            {data.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="step-actions">
                <button className="cancel-btn" onClick={onCancel} disabled={loading}>Cancel</button>
                <button className="back-btn" onClick={onBack} disabled={loading}>← Back</button>
                <button className="submit-btn" onClick={() => onSubmit({})} disabled={loading}>
                    {loading ? 'Creating...' : 'Create KPI'}
                </button>
            </div>
        </div>
    );
};

export default KPICreateStep3;