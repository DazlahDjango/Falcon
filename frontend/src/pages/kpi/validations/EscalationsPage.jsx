import React, { useState } from 'react';
import { EscalationList, EscalationDetail } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const EscalationsPage = () => {
    const [selectedEscalation, setSelectedEscalation] = useState(null);
    const { isAuthenticated, canManageKPIs } = useKPIPermissions();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    if (selectedEscalation) {
        return (
            <div className="kpi-page-container">
                <EscalationDetail 
                    escalation={selectedEscalation}
                    onClose={() => setSelectedEscalation(null)}
                    canResolve={canManageKPIs}
                />
            </div>
        );
    }
    
    return (
        <div className="kpi-page-container">
            <div className="page-header">
                <h1>Escalations</h1>
                <p>Track and resolve escalated validation issues</p>
            </div>
            
            <EscalationList 
                onViewDetail={setSelectedEscalation}
                canResolve={canManageKPIs}
            />
        </div>
    );
};

export default EscalationsPage;