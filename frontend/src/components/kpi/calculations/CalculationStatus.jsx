import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { getCalculationStatus } from '../../../store/kpi';
import CalculationProgress from './CalculationProgress';

const CalculationStatus = ({ taskId, onComplete }) => {
    const dispatch = useDispatch();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const pollStatus = async () => {
            try {
                const result = await dispatch(getCalculationStatus(taskId)).unwrap();
                setStatus(result);
                setLoading(false);
                
                if (result.status === 'COMPLETED' || result.status === 'FAILED') {
                    clearInterval(interval);
                    setTimeout(() => {
                        onComplete?.();
                    }, 3000);
                }
            } catch (error) {
                console.error('Failed to get status:', error);
                setLoading(false);
            }
        };
        
        pollStatus();
        const interval = setInterval(pollStatus, 3000);
        
        return () => clearInterval(interval);
    }, [dispatch, taskId, onComplete]);
    
    if (loading) {
        return <CalculationProgress progress={0} status="Starting calculation..." />;
    }
    
    const isCompleted = status?.status === 'COMPLETED';
    const isFailed = status?.status === 'FAILED';
    const isPending = status?.status === 'PENDING';
    const isProcessing = status?.status === 'PROCESSING';
    
    return (
        <div className="calculation-status-card">
            <div className={`status-icon ${isCompleted ? 'success' : isFailed ? 'error' : 'pending'}`}>
                {isCompleted && <FiCheckCircle size={48} />}
                {isFailed && <FiXCircle size={48} />}
                {(isPending || isProcessing) && <FiLoader size={48} className="spin" />}
            </div>
            
            <h3>
                {isCompleted && 'Calculation Completed'}
                {isFailed && 'Calculation Failed'}
                {(isPending || isProcessing) && 'Calculation in Progress'}
            </h3>
            
            <p>
                {isCompleted && 'Scores have been successfully calculated'}
                {isFailed && (status?.error || 'An error occurred during calculation')}
                {(isPending || isProcessing) && 'Please wait while scores are being calculated...'}
            </p>
            
            {(isPending || isProcessing) && (
                <CalculationProgress 
                    progress={status?.progress || 0}
                    status={status?.message || 'Processing...'}
                />
            )}
            
            {isCompleted && status?.result && (
                <div className="calculation-result">
                    <div className="result-stats">
                        <div className="result-stat">
                            <span className="stat-label">Records Affected</span>
                            <span className="stat-value">{status.result.records_affected || 0}</span>
                        </div>
                        <div className="result-stat">
                            <span className="stat-label">Duration</span>
                            <span className="stat-value">{status.result.duration_ms}ms</span>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="calculation-actions">
                <button className="close-btn" onClick={onComplete}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default CalculationStatus;