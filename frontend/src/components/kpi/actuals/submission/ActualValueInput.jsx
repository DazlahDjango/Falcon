import React, { useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ActualValueInput = ({ value, onChange, targetMin, targetMax, unit, decimalPlaces = 2 }) => {
    const [touched, setTouched] = useState(false);
    
    const isWithinRange = () => {
        if (!value) return true;
        if (targetMin !== undefined && value < targetMin) return false;
        if (targetMax !== undefined && value > targetMax) return false;
        return true;
    };
    
    const getStatusIcon = () => {
        if (!touched || !value) return null;
        if (isWithinRange()) {
            return <FiCheckCircle size={16} color="var(--kpi-success)" />;
        }
        return <FiAlertCircle size={16} color="var(--kpi-warning)" />;
    };
    
    const getAchievementPercentage = () => {
        if (!value || !targetMax) return null;
        const percentage = (value / targetMax) * 100;
        return percentage.toFixed(1);
    };

    return (
        <div className="kpi-actual-value-input">
            <div className="kpi-actual-value-input-header">
                <label className="kpi-actual-form-label">
                    Actual Value <span className="kpi-required">*</span>
                </label>
                {getStatusIcon()}
            </div>
            
            <div className="kpi-actual-value-input-wrapper">
                <input 
                    type="number"
                    className={`kpi-actual-value-input-field ${!isWithinRange() && touched ? 'warning' : ''}`}
                    value={value || ''}
                    onChange={(e) => {
                        onChange(parseFloat(e.target.value));
                        setTouched(true);
                    }}
                    onBlur={() => setTouched(true)}
                    placeholder={`Enter value in ${unit || 'units'}`}
                    step={decimalPlaces === 0 ? 1 : 0.01}
                />
                {unit && <span className="kpi-actual-value-input-unit">{unit}</span>}
            </div>
            
            {touched && !isWithinRange() && (
                <div className="kpi-actual-value-warning">
                    <FiAlertCircle size={12} />
                    Value is outside the expected range ({targetMin} - {targetMax})
                </div>
            )}
            
            {targetMax && value && (
                <div className="kpi-actual-value-achievement">
                    <div className="kpi-actual-value-achievement-bar">
                        <div 
                            className="kpi-actual-value-achievement-fill"
                            style={{ width: `${Math.min(100, (value / targetMax) * 100)}%` }}
                        />
                    </div>
                    <span className="kpi-actual-value-achievement-text">
                        {getAchievementPercentage()}% of target
                    </span>
                </div>
            )}
        </div>
    );
};

export default ActualValueInput;