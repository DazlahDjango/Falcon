import React, { useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiBarChart2, FiCalendar } from 'react-icons/fi';

export const generateMonthlyValues = (annualTarget, strategyId, params = {}) => {
    const target = Number(annualTarget || 0);
    let values = [];
    if (strategyId === 'equal_split') {
        const monthly = parseFloat((target / 12).toFixed(2));
        values = Array.from({ length: 12 }, () => monthly);
        const sum = values.reduce((a, b) => a + b, 0);
        if (sum !== target) {
            values[11] = parseFloat((values[11] + (target - sum)).toFixed(2));
        }
    } else if (strategyId === 'linear_increasing') {
        const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const totalW = 78;
        values = weights.map(w => parseFloat((target * (w / totalW)).toFixed(2)));
        const sum = values.reduce((a, b) => a + b, 0);
        if (sum !== target) values[11] = parseFloat((values[11] + (target - sum)).toFixed(2));
    } else if (strategyId === 'linear_decreasing') {
        const weights = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
        const totalW = 78;
        values = weights.map(w => parseFloat((target * (w / totalW)).toFixed(2)));
        const sum = values.reduce((a, b) => a + b, 0);
        if (sum !== target) values[11] = parseFloat((values[11] + (target - sum)).toFixed(2));
    } else if (strategyId === 'front_loaded') {
        const weights = [0.15, 0.15, 0.15, 0.10, 0.10, 0.08, 0.07, 0.05, 0.05, 0.05, 0.03, 0.02];
        values = weights.map(w => parseFloat((target * w).toFixed(2)));
        const sum = values.reduce((a, b) => a + b, 0);
        if (sum !== target) values[11] = parseFloat((values[11] + (target - sum)).toFixed(2));
    } else if (strategyId === 'back_loaded') {
        const weights = [0.02, 0.03, 0.05, 0.05, 0.05, 0.07, 0.08, 0.10, 0.10, 0.15, 0.15, 0.15];
        values = weights.map(w => parseFloat((target * w).toFixed(2)));
        const sum = values.reduce((a, b) => a + b, 0);
        if (sum !== target) values[11] = parseFloat((values[11] + (target - sum)).toFixed(2));
    } else if (strategyId === 'seasonal') {
        const weights = [0.07, 0.07, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.14];
        values = weights.map(w => parseFloat((target * w).toFixed(2)));
        const sum = values.reduce((a, b) => a + b, 0);
        if (sum !== target) values[11] = parseFloat((values[11] + (target - sum)).toFixed(2));
    } else {
        const monthly = parseFloat((target / 12).toFixed(2));
        values = Array.from({ length: 12 }, () => monthly);
    }

    return values.map((val, idx) => ({
        month: idx + 1,
        target_value: val
    }));
};

const PhasingStrategySelect = ({ target, onSelect, onCancel, annualTarget, selectedStrategy, onStrategyChange }) => {
    const [currentStrategy, setCurrentStrategy] = useState(selectedStrategy || 'equal_split');
    const [params, setParams] = useState({});

    const strategies = [
        { 
            id: 'equal_split', 
            name: 'Equal Split', 
            icon: <FiBarChart2 size={16} />,
            description: 'Distribute equally across all months'
        },
        { 
            id: 'linear_increasing', 
            name: 'Linear Increasing', 
            icon: <FiTrendingUp size={16} />,
            description: 'Gradually increase each month'
        },
        { 
            id: 'linear_decreasing', 
            name: 'Linear Decreasing', 
            icon: <FiTrendingDown size={16} />,
            description: 'Gradually decrease each month'
        },
        { 
            id: 'front_loaded', 
            name: 'Front Loaded', 
            icon: <FiCalendar size={16} />,
            description: 'Heavier in Q1, lighter in Q4'
        },
        { 
            id: 'back_loaded', 
            name: 'Back Loaded', 
            icon: <FiCalendar size={16} />,
            description: 'Lighter in Q1, heavier in Q4'
        },
        { 
            id: 'seasonal', 
            name: 'Seasonal Pattern', 
            icon: <FiCalendar size={16} />,
            description: 'Follow seasonal trends'
        }
    ];

    const targetVal = annualTarget || target?.target_value || 0;

    const handleStrategyChange = (strategyId) => {
        setCurrentStrategy(strategyId);
        let p = params;
        if (strategyId === 'seasonal') {
            p = { peak_month: 6, peak_multiplier: 1.5 };
            setParams(p);
        }
        const monthlyList = generateMonthlyValues(targetVal, strategyId, p);
        if (onStrategyChange) {
            onStrategyChange(strategyId, monthlyList);
        }
    };

    const handleGenerate = (e) => {
        e && e.preventDefault && e.preventDefault();
        const monthlyList = generateMonthlyValues(targetVal, currentStrategy, params);
        if (onSelect) {
            onSelect(currentStrategy, params, monthlyList);
        } else if (onStrategyChange) {
            onStrategyChange(currentStrategy, monthlyList);
        }
    };

    const handleCancel = (e) => {
        e && e.preventDefault && e.preventDefault();
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="kpi-phasing-strategy-modal">
            <div className="kpi-phasing-strategy-container">
                <div className="kpi-phasing-strategy-header">
                    <h3>Generate Monthly Phasing</h3>
                    <button className="close" onClick={onCancel}>×</button>
                </div>
                
                <div className="kpi-phasing-strategy-body">
                    <p>Annual Target: <strong>{target?.target_value}</strong></p>
                    
                    <div className="kpi-phasing-strategies">
                        {strategies.map(strategy => (
                            <div 
                                key={strategy.id}
                                className={`kpi-phasing-strategy-item ${currentStrategy === strategy.id ? 'selected' : ''}`}
                                onClick={() => handleStrategyChange(strategy.id)}
                            >
                                <div className="kpi-phasing-strategy-icon">
                                    {strategy.icon}
                                </div>
                                <div className="kpi-phasing-strategy-info">
                                    <div className="kpi-phasing-strategy-name">{strategy.name}</div>
                                    <div className="kpi-phasing-strategy-description">{strategy.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {currentStrategy === 'seasonal' && (
                        <div className="kpi-phasing-strategy-params">
                            <label>Peak Month (1-12):</label>
                            <input 
                                type="number"
                                min="1"
                                max="12"
                                value={params.peak_month}
                                onChange={(e) => setParams({ ...params, peak_month: parseInt(e.target.value) })}
                            />
                            <label>Peak Multiplier:</label>
                            <input 
                                type="number"
                                step="0.1"
                                min="1"
                                max="3"
                                value={params.peak_multiplier}
                                onChange={(e) => setParams({ ...params, peak_multiplier: parseFloat(e.target.value) })}
                            />
                        </div>
                    )}
                </div>
                
                <div className="kpi-phasing-strategy-footer">
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="generate" onClick={handleGenerate}>Generate Phasing</button>
                </div>
            </div>
        </div>
    );
};

export default PhasingStrategySelect;