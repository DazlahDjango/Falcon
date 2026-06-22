import React, { useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiBarChart2, FiCalendar } from 'react-icons/fi';

const PhasingStrategySelect = ({ target, onSelect, onCancel }) => {
    const [selectedStrategy, setSelectedStrategy] = useState('equal_split');
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

    const handleStrategyChange = (strategyId) => {
        setSelectedStrategy(strategyId);
        if (strategyId === 'seasonal') {
            setParams({ peak_month: 6, peak_multiplier: 1.5 });
        }
    };

    const handleGenerate = () => {
        onSelect(selectedStrategy, params);
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
                                className={`kpi-phasing-strategy-item ${selectedStrategy === strategy.id ? 'selected' : ''}`}
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
                    
                    {selectedStrategy === 'seasonal' && (
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