import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './TargetForm.module.css';

const PhasingForm = ({ annualTarget, kpi, onStrategyChange, onParamsChange }) => {
    const [strategy, setStrategy] = useState('equal_split');
    const [customPattern, setCustomPattern] = useState(Array(12).fill(annualTarget / 12));
    const [seasonalWeights, setSeasonalWeights] = useState({
        1: 0.07, 2: 0.07, 3: 0.08, 4: 0.08, 5: 0.08, 6: 0.08,
        7: 0.08, 8: 0.08, 9: 0.08, 10: 0.08, 11: 0.08, 12: 0.14
    });
    const [preview, setPreview] = useState(Array(12).fill(annualTarget / 12));
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    useEffect(() => {
        updatePreview();
    }, [strategy, customPattern, seasonalWeights, annualTarget]);
    const updatePreview = () => {
        let values = [];
        switch (strategy) {
            case 'equal_split':
                const equal = annualTarget / 12;
                values = Array(12).fill(equal);
                break;
            case 'seasonal':
                values = months.map((_, idx) => {
                    const month = idx + 1;
                    const weight = seasonalWeights[month] || 1 / 12;
                    return annualTarget * weight;
                });
                break;
            case 'custom_pattern':
                values = [...customPattern];
                const sum = values.reduce((a, b) => a + b, 0);
                if (sum > 0) {
                    values = values.map(v => (v / sum) * annualTarget);
                }
                break;
            default:
                values = Array(12).fill(annualTarget / 12);
        }
        setPreview(values);
        onStrategyChange(strategy);
        onParamsChange({
            weights: strategy === 'seasonal' ? seasonalWeights : undefined,
            pattern: strategy === 'custom_pattern' ? customPattern : undefined
        });
    };
    const handleCustomPatternChange = (index, value) => {
        const newPattern = [...customPattern];
        newPattern[index] = parseFloat(value) || 0;
        setCustomPattern(newPattern);
    };
    const handleSeasonalWeightChange = (month, value) => {
        setSeasonalWeights(prev => ({
            ...prev,
            [month]: parseFloat(value) || 0
        }));;
    };
    const getMonthDistribution = () => {
        return preview.map((value, idx) => ({
            month: months[idx],
            value: value,
            percentage: (value / annualTarget * 100).toFixed(1)
        }));
    };
    return (
        <div className={styles.phasingSection}>
            <h4 className={styles.sectionTitle}>Target Phasing</h4>
            <p className={styles.sectionDesc}>
                Distribute the annual target across months. Once locked, phasing cannot be changed.
            </p>

            <div className={styles.strategySelector}>
                <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            value="equal_split"
                            checked={strategy === 'equal_split'}
                            onChange={(e) => setStrategy(e.target.value)}
                            className={styles.radio}
                        />
                        Equal Split
                        <span className={styles.radioDesc}>Distribute equally across all months</span>
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            value="seasonal"
                            checked={strategy === 'seasonal'}
                            onChange={(e) => setStrategy(e.target.value)}
                            className={styles.radio}
                        />
                        Seasonal Distribution
                        <span className={styles.radioDesc}>Weighted by seasonal patterns</span>
                    </label>
                    <label className={styles.radioLabel}>
                        <input
                            type="radio"
                            value="custom_pattern"
                            checked={strategy === 'custom_pattern'}
                            onChange={(e) => setStrategy(e.target.value)}
                            className={styles.radio}
                        />
                        Custom Pattern
                        <span className={styles.radioDesc}>Define your own monthly distribution</span>
                    </label>
                </div>
            </div>

            {strategy === 'seasonal' && (
                <div className={styles.seasonalWeights}>
                    <h5>Seasonal Weights</h5>
                    <div className={styles.weightGrid}>
                        {months.map((month, idx) => (
                            <div key={month} className={styles.weightItem}>
                                <label>{month}</label>
                                <input
                                    type="number"
                                    value={seasonalWeights[idx + 1] || 0}
                                    onChange={(e) => handleSeasonalWeightChange(idx + 1, e.target.value)}
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    className={styles.weightInput}
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
                <div className={styles.customPattern}>
                    <h5>Monthly Values</h5>
                    <div className={styles.patternGrid}>
                        {months.map((month, idx) => (
                            <div key={month} className={styles.patternItem}>
                                <label>{month}</label>
                                <input
                                    type="number"
                                    value={customPattern[idx]}
                                    onChange={(e) => handleCustomPatternChange(idx, e.target.value)}
                                    step={kpi?.kpiType === 'FINANCIAL' ? '100' : '1'}
                                    className={styles.patternInput}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.previewSection}>
                <h5>Monthly Distribution Preview</h5>
                <div className={styles.previewChart}>
                    {getMonthDistribution().map((item, idx) => (
                        <div key={idx} className={styles.previewBar} style={{ width: `${100 / 12}%` }}>
                            <div 
                                className={styles.bar}
                                style={{ 
                                    height: `${Math.min(100, (item.value / annualTarget) * 100)}%`,
                                    backgroundColor: '#3b82f6'
                                }}
                            />
                            <span className={styles.barLabel}>{item.month}</span>
                        </div>
                    ))}
                </div>
                <div className={styles.previewTable}>
                    <table className={styles.distributionTable}>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Target Value</th>
                                <th>% of Annual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getMonthDistribution().map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.month}</td>
                                    <td>{item.value.toFixed(2)} {kpi?.unit}</td>
                                    <td>{item.percentage}%</td>
                                </tr>
                            ))}
                            <tr className={styles.totalRow}>
                                <td><strong>Total</strong></td>
                                <td><strong>{preview.reduce((a, b) => a + b, 0).toFixed(2)} {kpi?.unit}</strong></td>
                                <td><strong>100%</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
PhasingForm.propTypes = {
    annualTarget: PropTypes.number.isRequired,
    kpi: PropTypes.shape({
        unit: PropTypes.string,
        kpiType: PropTypes.string,
    }),
    onStrategyChange: PropTypes.func.isRequired,
    onParamsChange: PropTypes.func.isRequired,
};
export default PhasingForm