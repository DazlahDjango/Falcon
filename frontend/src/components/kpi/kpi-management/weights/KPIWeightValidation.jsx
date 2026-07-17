import React from 'react';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const KPIWeightValidation = ({ validation }) => {
    const isValid = validation?.valid;
    const total = validation?.total;
    const message = validation?.message;
    
    return (
        <div className={`weight-validation ${isValid ? 'success' : 'error'}`}>
            <div className="validation-icon">
                {isValid ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
            </div>
            <div className="validation-content">
                <div className="validation-title">
                    {isValid ? 'Weight Validation Passed' : 'Weight Validation Failed'}
                </div>
                <div className="validation-message">
                    {message || `Total weights sum to ${total}%`}
                </div>
                {!isValid && (
                    <div className="validation-hint">
                        Total weight must equal 100% for accurate scoring. 
                        Current total: {Number(total || 0).toFixed(1)}%
                    </div>
                )}
            </div>
        </div>
    );
};

export default KPIWeightValidation;