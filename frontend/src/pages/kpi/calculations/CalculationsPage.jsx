import React from 'react';
import { CalculationTrigger, CalculationHistory } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const CalculationsPage = () => {
    const { isAuthenticated, canTriggerCalculations } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    return (
        <div className="kpi-page-container">
            <div className="page-header">
                <h1>Score Calculations</h1>
                <p>Trigger and monitor score recalculation jobs</p>
            </div>
            
            {canTriggerCalculations && <CalculationTrigger />}
            
            <div style={{ marginTop: 'var(--kpi-space-6)' }}>
                <CalculationHistory />
            </div>
        </div>
    );
};

export default CalculationsPage;