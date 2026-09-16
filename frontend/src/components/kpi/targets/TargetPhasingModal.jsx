import React, { useState, useMemo } from 'react';
import { FiX, FiLock, FiCheckCircle, FiAlertCircle, FiZap } from 'react-icons/fi';
import PhasingStrategySelect from './phasing/PhasingStrategySelect';
import MonthlyPhasingTable from './phasing/MonthlyPhasingTable';
import PhasingLockCycle from './phasing/PhasingLockCycle';

const TargetPhasingModal = ({ target, onClose, onSave, onLock, readOnly = false }) => {
    const [activeStrategy, setActiveStrategy] = useState('equal_split');
    const [monthlyValues, setMonthlyValues] = useState(
        target?.monthly_phasings || Array.from({ length: 12 }, (_, i) => ({ month: i + 1, target_value: 0 }))
    );
    const [showLockModal, setShowLockModal] = useState(false);

    if (!target) return null;

    const isLocked = target.is_locked || target.status === 'LOCKED';
    const annualTargetNum = Number(target.target_value || 0);

    // Calculate live totals and quarterly breakdowns
    const currentSum = useMemo(() => {
        return monthlyValues.reduce((acc, curr) => acc + (Number(curr.target_value) || 0), 0);
    }, [monthlyValues]);

    const difference = annualTargetNum - currentSum;
    const isExactMatch = Math.abs(difference) < 0.01;

    // Quarterly subtotals
    const quarters = useMemo(() => {
        const getQSum = (startM, endM) => {
            return monthlyValues
                .filter(m => m.month >= startM && m.month <= endM)
                .reduce((acc, curr) => acc + (Number(curr.target_value) || 0), 0);
        };
        const q1 = getQSum(1, 3);
        const q2 = getQSum(4, 6);
        const q3 = getQSum(7, 9);
        const q4 = getQSum(10, 12);
        return [
            { name: 'Q1 (Jan-Mar)', val: q1, pct: annualTargetNum > 0 ? (q1 / annualTargetNum) * 100 : 0 },
            { name: 'Q2 (Apr-Jun)', val: q2, pct: annualTargetNum > 0 ? (q2 / annualTargetNum) * 100 : 0 },
            { name: 'Q3 (Jul-Sep)', val: q3, pct: annualTargetNum > 0 ? (q3 / annualTargetNum) * 100 : 0 },
            { name: 'Q4 (Oct-Dec)', val: q4, pct: annualTargetNum > 0 ? (q4 / annualTargetNum) * 100 : 0 },
        ];
    }, [monthlyValues, annualTargetNum]);

    const handleStrategyChange = (strategy, values) => {
        setActiveStrategy(strategy);
        if (values && values.length === 12) {
            setMonthlyValues(values);
        }
    };

    const handleAutoBalance = () => {
        if (isExactMatch || isLocked || readOnly) return;
        const updated = [...monthlyValues];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0) {
            const currentLastVal = Number(updated[lastIdx].target_value || 0);
            updated[lastIdx] = {
                ...updated[lastIdx],
                target_value: parseFloat((currentLastVal + difference).toFixed(2))
            };
            setMonthlyValues(updated);
        }
    };

    const handleSave = () => {
        if (isLocked) return;
        onSave && onSave({
            targetId: target.id,
            strategy: activeStrategy,
            monthlyValues,
        });
    };

    return (
        <div className="target-phasing-modal-overlay" onClick={onClose}>
            <div className="target-phasing-modal-content" style={{ maxWidth: '900px' }} onClick={(e) => e.stopPropagation()}>
                <div className="target-phasing-modal-header">
                    <div>
                        <h3>Monthly Target Phasing — {target.kpi_name || target.kpi_code || 'KPI Target'}</h3>
                        <p className="subtitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>Annual Target Benchmark: <strong>{annualTargetNum.toLocaleString()} {target.unit || ''}</strong> ({target.year || new Date().getFullYear()})</span>
                            {(target.user_name || target.user_email || target.user?.email) && (
                                <span style={{ paddingLeft: '8px', borderLeft: '1px solid #cbd5e1', color: '#475569' }}>
                                    👤 Target Owner: <strong>{target.user_name || target.user_email || target.user?.email}</strong>
                                </span>
                            )}
                        </p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                {isLocked && (
                    <div className="cycle-locked-banner">
                        <FiLock size={16} />
                        <span><strong>CYCLE LOCKED:</strong> This target phasing cycle is locked and immutable. Monthly targets cannot be edited.</span>
                    </div>
                )}

                {/* Live Balance & Status Counter */}
                <div style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: isExactMatch ? '#f0fdf4' : Math.abs(difference) > 0 ? '#fefce8' : '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Phased Total</span>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                                {currentSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {target.unit || ''}
                            </div>
                        </div>

                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Annual Target</span>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284c7' }}>
                                {annualTargetNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {target.unit || ''}
                            </div>
                        </div>

                        <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Balance Status</span>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                backgroundColor: isExactMatch ? '#dcfce7' : '#fef9c3',
                                color: isExactMatch ? '#15803d' : '#854d0e'
                            }}>
                                {isExactMatch ? (
                                    <><FiCheckCircle size={13} /> 100% Balanced</>
                                ) : (
                                    <><FiAlertCircle size={13} /> {difference > 0 ? `Under by ${difference.toLocaleString()}` : `Over by ${Math.abs(difference).toLocaleString()}`}</>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isExactMatch && !isLocked && !readOnly && (
                        <button
                            type="button"
                            onClick={handleAutoBalance}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0.45rem 0.9rem',
                                borderRadius: '6px',
                                border: '1px solid #facc15',
                                backgroundColor: '#fef08a',
                                color: '#713f12',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                            title="Automatically add the remaining difference into December"
                        >
                            <FiZap size={14} /> Auto-Balance Remaining
                        </button>
                    )}
                </div>

                {/* Quarterly Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    padding: '1rem 1.5rem',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    {quarters.map((q, idx) => (
                        <div key={idx} style={{
                            background: '#ffffff',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{q.name}</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                                {q.val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 500, marginTop: '2px' }}>
                                {q.pct.toFixed(1)}% of Annual Target
                            </div>
                        </div>
                    ))}
                </div>

                <div className="target-phasing-modal-body">
                    {!isLocked && !readOnly && (
                        <PhasingStrategySelect
                            target={target}
                            annualTarget={target.target_value}
                            onStrategyChange={handleStrategyChange}
                            onValuesGenerated={setMonthlyValues}
                            currentValues={monthlyValues}
                        />
                    )}

                    <MonthlyPhasingTable
                        monthlyValues={monthlyValues}
                        annualTarget={target.target_value}
                        onChange={setMonthlyValues}
                        readOnly={isLocked || readOnly}
                    />
                </div>

                <div className="target-phasing-modal-footer">
                    <div className="footer-left">
                        {onLock && !isLocked && !readOnly && (
                            <button className="lock-cycle-btn" onClick={() => setShowLockModal(true)}>
                                <FiLock size={14} /> Lock Phasing Cycle
                            </button>
                        )}
                    </div>
                    <div className="footer-right">
                        <button className="cancel-btn" onClick={onClose}>
                            {readOnly || isLocked ? 'Close' : 'Cancel'}
                        </button>
                        {!isLocked && !readOnly && (
                            <button className="save-btn" onClick={handleSave}>
                                Save Phasing
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showLockModal && (
                <PhasingLockCycle
                    target={target}
                    onLock={onLock}
                    onClose={() => setShowLockModal(false)}
                />
            )}
        </div>
    );
};

export default TargetPhasingModal;
