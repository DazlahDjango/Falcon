import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiPlay, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { triggerCalculation } from '../../../store/kpi';
import CalculationStatus from './CalculationStatus';
import KPILoading from '../common/KPILoading';

const CalculationTrigger = () => {
    const dispatch = useDispatch();
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [force, setForce] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];
    
    const handleTrigger = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(triggerCalculation({ year, month, force })).unwrap();
            setTaskId(result.task_id);
        } catch (err) {
            setError(err.message || 'Failed to trigger calculation');
        } finally {
            setLoading(false);
        }
    };
    
    if (taskId) {
        return <CalculationStatus taskId={taskId} onComplete={() => setTaskId(null)} />;
    }
    
    return (
        <div className="kpi-calculations-container">
            <div className="calculations-header">
                <h2>Score Calculation</h2>
                <p>Trigger manual score recalculation for a specific period</p>
            </div>
            
            <div className="calculation-card">
                <div className="calculation-info">
                    <div className="info-icon">
                        <FiPlay size={24} />
                    </div>
                    <div>
                        <h3>Trigger Calculation</h3>
                        <p>Recalculate scores for all KPIs for the selected period</p>
                    </div>
                </div>
                
                <div className="calculation-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Year</label>
                            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
                                {years.map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Month</label>
                            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={force} onChange={(e) => setForce(e.target.checked)} />
                            Force recalculation (overwrite existing scores)
                        </label>
                        <small>This will recalculate all scores even if they already exist</small>
                    </div>
                    
                    {error && (
                        <div className="calculation-error">
                            <FiAlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    
                    <button 
                        className="calculation-trigger-btn"
                        onClick={handleTrigger}
                        disabled={loading}
                    >
                        {loading ? <KPILoading size="sm" text="" /> : <FiPlay size={14} />}
                        {loading ? 'Starting...' : 'Start Calculation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalculationTrigger;