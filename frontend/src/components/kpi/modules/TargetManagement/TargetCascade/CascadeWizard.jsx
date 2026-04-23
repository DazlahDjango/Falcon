import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './CascadeWizard.module.css';

const CascadeWizard = ({ target, onSubmit, onCancel, isLoading }) => {
    const [step, setStep] = useState(1);
    const [ruleType, setRuleType] = useState('EQUAL_SPLIT');
    const [departments, setDepartments] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [weights, setWeights] = useState({});
    useEffect(() => {
        fetchDepartments();
    }, []);
    const fetchDepartments = async () => {
        try {
            const response = await fetch('/organisations/departments/');
            const data = await response.json();
            setDepartments(data.results || []);
            const initialWeights = {};
            (data.results || []).forEach(dept => {
                initialWeights[dept.id] = 0;
            });
            setWeights(initialWeights);
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        }
    };
    const handleDepartmentSelect = (deptId) => {
        setSelectedDepartments(prev => {
            if (prev.includes(deptId)) {
                return prev.filter(id => id !== deptId);
            }
            return [...prev, deptId];
        });
    };
    const handleWeightChange = (deptId, value) => {
        const numValue = parseFloat(value) || 0;
        setWeights(prev => ({ ...prev, [deptId]: numValue }));
    };
    const calculateDistribution = () => {
        if (ruleType === 'EQUAL_SPLIT') {
            const equalShare = 100 / selectedDepartments.length;
            return selectedDepartments.map(deptId => ({
                entity_type: 'DEPARTMENT',
                entity_id: deptId,
                contribution_percentage: equalShare
            }));
        } else {
            // Weighted distribution
            const totalWeight = selectedDepartments.reduce((sum, id) => sum + (weights[id] || 0), 0);
            return selectedDepartments.map(deptId => ({
                entity_type: 'DEPARTMENT',
                entity_id: deptId,
                contribution_percentage: (weights[deptId] || 0) / totalWeight * 100
            }));
        }
    };
    const handleSubmit = () => {
        const cascadeData = {
            rule_id: ruleType === 'EQUAL_SPLIT' ? '1' : '2',
            targets: calculateDistribution()
        };
        onSubmit(cascadeData);
    };
    const totalPercentage = selectedDepartments.reduce((sum, id) => sum + (weights[id] || 0), 0);
    const isValid = selectedDepartments.length > 0 && 
        (ruleType === 'EQUAL_SPLIT' || Math.abs(totalPercentage - 100) < 0.01);
    return (
        <div className={styles.wizard}>
            <div className={styles.stepIndicator}>
                <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                    <span className={styles.stepNumber}>1</span>
                    <span>Select Rule</span>
                </div>
                <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                    <span className={styles.stepNumber}>2</span>
                    <span>Select Departments</span>
                </div>
                <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
                    <span className={styles.stepNumber}>3</span>
                    <span>Configure Weights</span>
                </div>
            </div>

            {step === 1 && (
                <div className={styles.stepContent}>
                    <h3>Select Cascade Rule</h3>
                    <div className={styles.rules}>
                        <div 
                            className={`${styles.ruleCard} ${ruleType === 'EQUAL_SPLIT' ? styles.selected : ''}`}
                            onClick={() => setRuleType('EQUAL_SPLIT')}
                        >
                            <div className={styles.ruleIcon}>⚖️</div>
                            <div className={styles.ruleName}>Equal Split</div>
                            <div className={styles.ruleDesc}>Distribute equally among selected departments</div>
                        </div>
                        <div 
                            className={`${styles.ruleCard} ${ruleType === 'WEIGHTED' ? styles.selected : ''}`}
                            onClick={() => setRuleType('WEIGHTED')}
                        >
                            <div className={styles.ruleIcon}>📊</div>
                            <div className={styles.ruleName}>Weighted by Budget</div>
                            <div className={styles.ruleDesc}>Distribute based on department budget allocation</div>
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button onClick={onCancel} className={styles.cancelButton}>
                            Cancel
                        </button>
                        <button onClick={() => setStep(2)} className={styles.nextButton}>
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className={styles.stepContent}>
                    <h3>Select Departments</h3>
                    <div className={styles.departmentList}>
                        {departments.map(dept => (
                            <label key={dept.id} className={styles.departmentItem}>
                                <input
                                    type="checkbox"
                                    checked={selectedDepartments.includes(dept.id)}
                                    onChange={() => handleDepartmentSelect(dept.id)}
                                />
                                <span className={styles.departmentName}>{dept.name}</span>
                                <span className={styles.departmentBudget}>Budget: {dept.budget || 'N/A'}</span>
                            </label>
                        ))}
                    </div>
                    <div className={styles.actions}>
                        <button onClick={() => setStep(1)} className={styles.backButton}>
                            ← Back
                        </button>
                        <button 
                            onClick={() => setStep(3)} 
                            className={styles.nextButton}
                            disabled={selectedDepartments.length === 0}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className={styles.stepContent}>
                    <h3>Configure Distribution Weights</h3>
                    
                    {ruleType === 'WEIGHTED' && (
                        <div className={styles.weightsSection}>
                            <p>Enter weight percentages for each department (total must be 100%)</p>
                            {selectedDepartments.map(deptId => {
                                const dept = departments.find(d => d.id === deptId);
                                return (
                                    <div key={deptId} className={styles.weightItem}>
                                        <label>{dept?.name}</label>
                                        <input
                                            type="number"
                                            value={weights[deptId] || 0}
                                            onChange={(e) => handleWeightChange(deptId, e.target.value)}
                                            step="0.1"
                                            min="0"
                                            max="100"
                                        />
                                        <span>%</span>
                                    </div>
                                );
                            })}
                            <div className={`${styles.totalWeight} ${Math.abs(totalPercentage - 100) < 0.01 ? styles.valid : styles.invalid}`}>
                                Total: {totalPercentage.toFixed(1)}%
                            </div>
                        </div>
                    )}

                    {ruleType === 'EQUAL_SPLIT' && (
                        <div className={styles.equalSplitPreview}>
                            <p>Each selected department will receive an equal share:</p>
                            <div className={styles.previewValue}>
                                {selectedDepartments.length} departments × {(100 / selectedDepartments.length).toFixed(1)}% each
                            </div>
                        </div>
                    )}

                    <div className={styles.summary}>
                        <h4>Cascade Summary</h4>
                        <div className={styles.summaryItem}>
                            <span>Target KPI:</span>
                            <span>{target.kpi_name}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span>Annual Target:</span>
                            <span>{target.target_value} {target.unit}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span>Departments:</span>
                            <span>{selectedDepartments.length}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span>Rule:</span>
                            <span>{ruleType === 'EQUAL_SPLIT' ? 'Equal Split' : 'Weighted by Budget'}</span>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button onClick={() => setStep(2)} className={styles.backButton}>
                            ← Back
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            className={styles.submitButton}
                            disabled={!isValid || isLoading}
                        >
                            {isLoading ? 'Creating Cascade...' : 'Create Cascade'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
CascadeWizard.propTypes = {
    target: PropTypes.shape({
        kpi_name: PropTypes.string,
        target_value: PropTypes.number,
        unit: PropTypes.string,
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};
export default CascadeWizard;