import React, { useState } from "react";
import PropTypes, { array } from 'prop-types';
import PhasingChart from './PhasingChart';
import styles from './PhasingWizard.module.css';

const PhasingWizard = ({ target, onSubmit, onCancel, isLoading }) => {
    const [strategy, setStrategy] = useState('equal_split');
    const [monthlyValues, setMonthlyValues] = useState(() => {
        const equal = target.target_value / 12;
        return Array(12).fill(equal);
    });
    const [seasonalWeights, setSeasonalWeights] = useState({
        1: 0.07, 2: 0.07, 3: 0.08, 4: 0.08, 5: 0.08, 6: 0.08,
        7: 0.08, 8: 0.08, 9: 0.08, 10: 0.08, 11: 0.08, 12: 0.14
    });
    const [customPattern, setCustomPattern] = useState(Array(12).fill(target.target_value / 12));
    const [step, setStep] = useState(1);
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const updateMonthlyValues = () => {
        if (strategy === 'split_equal') {
            const equal = target.target_value / 12;
            setMonthlyValues(Array(12).fill(equal));
        } else if (strategy === 'seasonal') {
            const values = months.map((_, idx) => {
                const weight = seasonalWeights[idx + 1] || 1 / 12;
                return target.target_value * weight;
            });
            setMonthlyValues(values);
        } else if (strategy === 'custom_pattern') {
            const sum = customPattern.reduce((a, b) => a + b, 0);
            if (sum > 0) {
                const normalized = customPattern.map(v => (v / sum) * target.target_value);
                setMonthlyValues(normalized);
            }
        }
    };
    React.useEffect(() => {
        updateMonthlyValues();
    }, [strategy, seasonalWeights, customPattern]);
    const handleCustomPatternChange = (index, value) => {
        const newPattern = [...customPattern];
        newPattern[index] = parseFloat(value) || 0;
        setCustomPattern(newPattern);
    };
    const handleSeasonalWeightChange = (month, value) => {
        setSeasonalWeights(prev => ({
            ...prev,
            [month]: parseFloat(value) || 0
        }));
    };
    const handleSubmit = () => {
        const phasingData = monthlyValues.map((value, index) => ({
            month: index + 1,
            target_value: value
        }));
        onSubmit(phasingData);
    };
    const totalSum = monthlyValues.reduce((a, b) => a + b, 0);
    const isValid = Math.abs(totalSum - target.target_value) < 0.01;
    return (
        <div className={styles.wizard}>
            <div className={styles.stepIndicator}>
                <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
                    <span className={styles.stepNumber}>1</span>
                    <span>Choose Strategy</span>
                </div>
                <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
                    <span className={styles.stepNumber}>2</span>
                    <span>Configure Distribution</span>
                </div>
                <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
                    <span className={styles.stepNumber}>3</span>
                    <span>Review & Confirm</span>
                </div>
            </div>

            {step === 1 && (
                <div className={styles.stepContent}>
                    <h3>Select Phasing Strategy</h3>
                    <div className={styles.strategies}>
                        <div 
                            className={`${styles.strategyCard} ${strategy === 'equal_split' ? styles.selected : ''}`}
                            onClick={() => setStrategy('equal_split')}
                        >
                            <div className={styles.strategyIcon}>📊</div>
                            <div className={styles.strategyName}>Equal Split</div>
                            <div className={styles.strategyDesc}>Distribute equally across all 12 months</div>
                        </div>
                        <div 
                            className={`${styles.strategyCard} ${strategy === 'seasonal' ? styles.selected : ''}`}
                            onClick={() => setStrategy('seasonal')}
                        >
                            <div className={styles.strategyIcon}>🌱</div>
                            <div className={styles.strategyName}>Seasonal Distribution</div>
                            <div className={styles.strategyDesc}>Weighted by seasonal patterns</div>
                        </div>
                        <div 
                            className={`${styles.strategyCard} ${strategy === 'custom_pattern' ? styles.selected : ''}`}
                            onClick={() => setStrategy('custom_pattern')}
                        >
                            <div className={styles.strategyIcon}>✏️</div>
                            <div className={styles.strategyName}>Custom Pattern</div>
                            <div className={styles.strategyDesc}>Define your own monthly distribution</div>
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
                    <h3>Configure Monthly Distribution</h3>
                    
                    {strategy === 'seasonal' && (
                        <div className={styles.seasonalConfig}>
                            <h4>Seasonal Weights</h4>
                            <div className={styles.weightGrid}>
                                {months.map((month, idx) => (
                                    <div key={month} className={styles.weightItem}>
                                        <label>{month}</label>
                                        <input
                                            type="number"
                                            value={seasonalWeights[idx + 1]}
                                            onChange={(e) => handleSeasonalWeightChange(idx + 1, e.target.value)}
                                            step="0.01"
                                            min="0"
                                            max="1"
                                        />
                                    </div>
                                ))}
                            </div>
                            <small className={styles.hint}>
                                Weights should sum to 1.0. Current sum: {Object.values(seasonalWeights).reduce((a, b) => a + b, 0).toFixed(2)}
                            </small>
                        </div>
                    )}

                    {strategy === 'custom_pattern' && (
                        <div className={styles.customConfig}>
                            <h4>Custom Monthly Values</h4>
                            <div className={styles.customGrid}>
                                {months.map((month, idx) => (
                                    <div key={month} className={styles.customItem}>
                                        <label>{month}</label>
                                        <input
                                            type="number"
                                            value={customPattern[idx]}
                                            onChange={(e) => handleCustomPatternChange(idx, e.target.value)}
                                            step={target.kpi_type === 'FINANCIAL' ? '100' : '1'}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <PhasingChart 
                        phasing={monthlyValues.map((v, i) => ({ month: i + 1, target_value: v }))}
                        targetValue={target.target_value}
                    />

                    <div className={styles.actions}>
                        <button onClick={() => setStep(1)} className={styles.backButton}>
                            ← Back
                        </button>
                        <button onClick={() => setStep(3)} className={styles.nextButton}>
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className={styles.stepContent}>
                    <h3>Review Monthly Distribution</h3>
                    
                    <PhasingChart 
                        phasing={monthlyValues.map((v, i) => ({ month: i + 1, target_value: v }))}
                        targetValue={target.target_value}
                    />

                    <div className={styles.summary}>
                        <div className={`${styles.total} ${isValid ? styles.valid : styles.invalid}`}>
                            Total: {totalSum.toFixed(2)} {target.unit} 
                            {isValid ? ' ✓ Valid' : ` ✗ (Target: ${target.target_value})`}
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
                            {isLoading ? 'Saving...' : 'Save Phasing'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
PhasingWizard.propTypes = {
    target: PropTypes.shape({
        target_value: PropTypes.number,
        unit: PropTypes.string,
        kpi_type: PropTypes.string,
        kpi_name: PropTypes.string,
    }).isRequired,
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};
export default PhasingWizard;