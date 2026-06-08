import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { validateKPI } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';

const KPIValidation = ({ kpiId }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [validation, setValidation] = useState(null);
    
    const handleValidate = async () => {
        setLoading(true);
        try {
            const result = await dispatch(validateKPI(kpiId)).unwrap();
            setValidation(result);
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Validating KPI..." />;
    }
    
    const isValid = validation?.is_valid;
    const completenessErrors = validation?.completeness_errors || [];
    const weightValid = validation?.weight_validation?.valid;
    const circularValid = validation?.circular_dependency?.valid;
    
    return (
        <div className="kpi-validation-section">
            <div className="section-header">
                <h3>KPI Validation</h3>
                <button className="validate-btn" onClick={handleValidate}>
                    <FiCheckCircle size={14} />
                    Run Validation
                </button>
            </div>
            
            {validation && (
                <div className="validation-results">
                    <div className={`validation-status ${isValid ? 'success' : 'error'}`}>
                        {isValid ? (
                            <>
                                <FiCheckCircle size={20} />
                                <span>KPI is valid and ready for use</span>
                            </>
                        ) : (
                            <>
                                <FiAlertCircle size={20} />
                                <span>KPI has validation issues that need attention</span>
                            </>
                        )}
                    </div>
                    
                    {completenessErrors.length > 0 && (
                        <div className="validation-section">
                            <h4>Completeness Issues</h4>
                            <ul>
                                {completenessErrors.map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <div className="validation-section">
                        <h4>Weight Validation</h4>
                        <div className={`validation-item ${weightValid ? 'success' : 'error'}`}>
                            {weightValid ? '✓ ' : '✗ '}
                            {validation.weight_validation?.message || 'Weights sum to 100%'}
                        </div>
                    </div>
                    
                    <div className="validation-section">
                        <h4>Circular Dependency Check</h4>
                        <div className={`validation-item ${circularValid ? 'success' : 'error'}`}>
                            {circularValid ? '✓ No circular dependencies found' : '✗ Circular dependency detected'}
                        </div>
                        {validation.circular_dependency?.path && (
                            <div className="circular-path">
                                Path: {validation.circular_dependency.path.join(' → ')}
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {!validation && !loading && (
                <div className="validation-placeholder">
                    <p>Click "Run Validation" to check this KPI for completeness and correctness</p>
                </div>
            )}
        </div>
    );
};

export default KPIValidation;