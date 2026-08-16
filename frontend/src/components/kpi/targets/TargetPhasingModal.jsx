import React, { useState } from 'react';
import { FiX, FiLock, FiCheckCircle } from 'react-icons/fi';
import PhasingStrategySelect from './phasing/PhasingStrategySelect';
import MonthlyPhasingTable from './phasing/MonthlyPhasingTable';
import PhasingLockCycle from './phasing/PhasingLockCycle';

const TargetPhasingModal = ({ target, onClose, onSave, onLock, readOnly = false }) => {
    const [activeStrategy, setActiveStrategy] = useState('EQUAL');
    const [monthlyValues, setMonthlyValues] = useState(
        target?.monthly_phasings || Array.from({ length: 12 }, (_, i) => ({ month: i + 1, target_value: 0 }))
    );
    const [showLockModal, setShowLockModal] = useState(false);

    if (!target) return null;

    const isLocked = target.is_locked || target.status === 'LOCKED';

    const handleStrategyChange = (strategy, values) => {
        setActiveStrategy(strategy);
        if (values && values.length === 12) {
            setMonthlyValues(values);
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
        <div className="target-phasing-modal-overlay">
            <div className="target-phasing-modal-content">
                <div className="target-phasing-modal-header">
                    <div>
                        <h3>Monthly Target Phasing — {target.kpi_name || target.kpi_code || 'KPI Target'}</h3>
                        <p className="subtitle">
                            Annual Target: <strong>{Number(target.target_value || 0).toLocaleString()} {target.unit || ''}</strong> ({target.year || new Date().getFullYear()})
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

                <div className="target-phasing-modal-body">
                    {!isLocked && !readOnly && (
                        <PhasingStrategySelect
                            annualTarget={target.target_value}
                            selectedStrategy={activeStrategy}
                            onStrategyChange={handleStrategyChange}
                        />
                    )}

                    <div className="phasing-table-section">
                        <MonthlyPhasingTable
                            monthlyValues={monthlyValues}
                            onChange={setMonthlyValues}
                            readOnly={isLocked || readOnly}
                        />
                    </div>
                </div>

                <div className="target-phasing-modal-footer">
                    <div className="footer-left">
                        {!isLocked && !readOnly && (
                            <button className="lock-cycle-btn" onClick={() => setShowLockModal(true)}>
                                <FiLock size={14} /> Lock Cycle
                            </button>
                        )}
                    </div>
                    <div className="footer-right">
                        <button className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        {!isLocked && !readOnly && (
                            <button className="btn-primary" onClick={handleSave}>
                                <FiCheckCircle size={14} /> Save Monthly Phasing
                            </button>
                        )}
                    </div>
                </div>

                {showLockModal && (
                    <PhasingLockCycle
                        onLock={(cycleName) => {
                            onLock && onLock(target.id, cycleName);
                            setShowLockModal(false);
                        }}
                        onClose={() => setShowLockModal(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default TargetPhasingModal;
