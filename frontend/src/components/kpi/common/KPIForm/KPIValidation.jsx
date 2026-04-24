import React from 'react';
import PropTypes from 'prop-types';
import styles from './KPIForm.module.css';

const KPIValidation = ({ formData, validationResult, onValidate }) => {
    const getStatusIcon = (valid) => {
        if (valid === undefined) return '⚪';
        return valid ? '✅' : '❌';
    };
    const getStatusClass = (valid) => {
        if (valid === undefined) return styles.statusUnknown;
        return valid ? styles.statusSuccess : styles.statusError;
    };
    return (
        <div className={styles.validationSection}>
            <div className={styles.validationActions}>
                <button
                    type="button"
                    onClick={onValidate}
                    className={styles.validateButton}
                >
                    Validate KPI Configuration
                </button>
            </div>

            {validationResult && (
                <div className={styles.validationResults}>
                    <div className={styles.resultHeader}>
                        <h4>Validation Results</h4>
                        <span className={`${styles.resultStatus} ${getStatusClass(validationResult.isValid)}`}>
                            {validationResult.isValid ? 'Valid' : 'Invalid'}
                        </span>
                    </div>

                    {/* Completeness Errors */}
                    <div className={styles.resultSection}>
                        <h5>Completeness Check</h5>
                        {validationResult.completenessErrors?.length > 0 ? (
                            <ul className={styles.errorList}>
                                {validationResult.completenessErrors.map((error, idx) => (
                                    <li key={idx} className={styles.errorItem}>{error}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className={styles.successText}>All required fields are filled</p>
                        )}
                    </div>

                    {/* Weight Validation */}
                    <div className={styles.resultSection}>
                        <h5>Weight Validation</h5>
                        <div className={styles.resultItem}>
                            <span className={styles.resultIcon}>
                                {getStatusIcon(validationResult.weightValidation?.valid)}
                            </span>
                            <span className={getStatusClass(validationResult.weightValidation?.valid)}>
                                {validationResult.weightValidation?.message || 'No weights assigned yet'}
                            </span>
                        </div>
                    </div>

                    {/* Circular Dependency Check */}
                    <div className={styles.resultSection}>
                        <h5>Circular Dependency Check</h5>
                        <div className={styles.resultItem}>
                            <span className={styles.resultIcon}>
                                {getStatusIcon(validationResult.circularDependency?.valid)}
                            </span>
                            <span className={getStatusClass(validationResult.circularDependency?.valid)}>
                                {validationResult.circularDependency?.valid 
                                    ? 'No circular dependencies detected' 
                                    : 'Circular dependency detected!'}
                            </span>
                        </div>
                        {validationResult.circularDependency?.path?.length > 0 && (
                            <div className={styles.dependencyPath}>
                                <strong>Path:</strong> {validationResult.circularDependency.path.join(' → ')}
                            </div>
                        )}
                    </div>

                    {/* KPI Summary */}
                    <div className={styles.resultSection}>
                        <h5>KPI Summary</h5>
                        <table className={styles.summaryTable}>
                            <tbody>
                                <tr>
                                    <td>Name:</td>
                                    <td><strong>{formData.name || 'Not set'}</strong></td>
                                </tr>
                                <tr>
                                    <td>Code:</td>
                                    <td><strong>{formData.code || 'Not set'}</strong></td>
                                </tr>
                                <tr>
                                    <td>Type:</td>
                                    <td>{formData.kpiType}</td>
                                </tr>
                                <tr>
                                    <td>Logic:</td>
                                    <td>{formData.calculationLogic === 'HIGHER_IS_BETTER' ? 'Higher is Better' : 'Lower is Better'}</td>
                                </tr>
                                <tr>
                                    <td>Target Range:</td>
                                    <td>{formData.targetMin || '—'} to {formData.targetMax || '—'}</td>
                                </tr>
                                <tr>
                                    <td>Unit:</td>
                                    <td>{formData.unit || '—'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
KPIValidation.propTypes = {
    formData: PropTypes.object.isRequired,
    validationResult: PropTypes.shape({
        isValid: PropTypes.bool,
        completenessErrors: PropTypes.array,
        weightValidation: PropTypes.shape({
            valid: PropTypes.bool,
            message: PropTypes.string,
        }),
        circularDependency: PropTypes.shape({
            valid: PropTypes.bool,
            path: PropTypes.array,
        }),
    }),
    onValidate: PropTypes.func.isRequired,
};
export default KPIValidation;