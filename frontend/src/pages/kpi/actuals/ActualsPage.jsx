import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActualList, ActualDetail, ActualSubmit } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';

const ActualsPage = () => {
    const navigate = useNavigate();
    const { canValidateActuals, canManageKPIs } = useKPIPermissions();
    const [selectedActualId, setSelectedActualId] = useState(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    
    const handleViewActual = (id) => {
        setSelectedActualId(id);
    };
    
    const handleBackToList = () => {
        setSelectedActualId(null);
    };
    
    const handleValidate = async (action, id, data) => {
        if (action === 'approve') {
            await approveActual(id, data?.comment);
        } else if (action === 'reject') {
            await rejectActual(id, data?.reasonId, data?.comment);
        }
        setSelectedActualId(null);
    };
    
    if (selectedActualId) {
        return (
            <ActualDetail 
                actualId={selectedActualId}
                onBack={handleBackToList}
                canValidate={canValidateActuals || canManageKPIs}
            />
        );
    }
    
    return (
        <div className="kpi-page-container">
            <div className="page-header">
                <h1>Actual Submissions</h1>
                <button className="submit-btn" onClick={() => setShowSubmitModal(true)}>
                    + Submit Actual
                </button>
            </div>
            
            <ActualList 
                onViewActual={handleViewActual}
                canValidate={canValidateActuals || canManageKPIs}
            />
            
            {showSubmitModal && (
                <ActualSubmit 
                    onComplete={() => setShowSubmitModal(false)}
                    onCancel={() => setShowSubmitModal(false)}
                />
            )}
        </div>
    );
};

export default ActualsPage;