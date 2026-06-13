import React, { useState } from 'react';
import { FiSave, FiLock, FiUnlock, FiTrendingUp } from 'react-icons/fi';
import MonthlyPhasingTable from './MonthlyPhasingTable';
import MonthlyPhasingChart from './MonthlyPhasingChart';
import PhasingStrategySelect from './PhasingStrategySelect';
import KPILoading from '../../common/KPILoading';

const MonthlyPhasing = ({ 
    target, 
    phasing, 
    loading, 
    onSave, 
    onLock,
    onGeneratePhasing,
    canEdit,
    canLock 
}) => {
    const [showStrategy, setShowStrategy] = useState(false);
    const [localPhasing, setLocalPhasing] = useState(phasing);

    const handleStrategySelect = async (strategy, params) => {
        await onGeneratePhasing(strategy, params);
        setShowStrategy(false);
    };

    const handleValueChange = (month, value) => {
        const updated = localPhasing.map(p => 
            p.month === month ? { ...p, target_value: value } : p
        );
        setLocalPhasing(updated);
    };

    const handleSave = async () => {
        await onSave(localPhasing);
    };

    if (loading) {
        return <KPILoading text="Loading phasing data..." />;
    }

    const totalTarget = phasing?.reduce((sum, p) => sum + p.target_value, 0) || 0;
    const annualTarget = target?.target_value || 0;
    const variance = totalTarget - annualTarget;

    return (
        <div className="kpi-monthly-phasing">
            <div className="kpi-monthly-phasing-header">
                <h3>Monthly Target Phasing</h3>
                <div className="kpi-monthly-phasing-stats">
                    <span>Annual Target: {annualTarget}</span>
                    <span>Sum of Months: {totalTarget.toFixed(2)}</span>
                    <span className={Math.abs(variance) < 0.01 ? 'valid' : 'invalid'}>
                        Variance: {variance.toFixed(2)}
                    </span>
                </div>
            </div>
            
            <div className="kpi-monthly-phasing-toolbar">
                {canEdit && !showStrategy && (
                    <button 
                        className="kpi-phasing-generate-btn"
                        onClick={() => setShowStrategy(true)}
                    >
                        <FiTrendingUp size={14} />
                        Generate Phasing
                    </button>
                )}
                {canEdit && localPhasing && (
                    <button className="kpi-phasing-save-btn" onClick={handleSave}>
                        <FiSave size={14} />
                        Save Changes
                    </button>
                )}
                {canLock && (
                    <button className="kpi-phasing-lock-btn" onClick={onLock}>
                        <FiLock size={14} />
                        Lock Cycle
                    </button>
                )}
            </div>
            
            {showStrategy && (
                <PhasingStrategySelect 
                    target={target}
                    onSelect={handleStrategySelect}
                    onCancel={() => setShowStrategy(false)}
                />
            )}
            
            <div className="kpi-monthly-phasing-content">
                <MonthlyPhasingChart phasing={localPhasing} />
                <MonthlyPhasingTable 
                    phasing={localPhasing}
                    onValueChange={canEdit ? handleValueChange : null}
                    canEdit={canEdit}
                />
            </div>
        </div>
    );
};

export default MonthlyPhasing;