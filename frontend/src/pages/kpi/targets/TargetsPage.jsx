import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TargetList, TargetCreate } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';

const TargetsPage = () => {
    const navigate = useNavigate();
    const { canManageKPIs } = useKPIPermissions();
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    const handleViewTarget = (id) => {
        navigate(`/targets/${id}`);
    };
    
    const handleEditTarget = (id) => {
        navigate(`/targets/${id}/edit`);
    };
    
    const handleCreateTarget = () => {
        setShowCreateModal(true);
    };
    
    return (
        <div className="kpi-page-container">
            <TargetList 
                onViewTarget={handleViewTarget}
                onEditTarget={canManageKPIs ? handleEditTarget : null}
                onCreateTarget={canManageKPIs ? handleCreateTarget : null}
            />
            
            {showCreateModal && (
                <TargetCreate 
                    onComplete={() => setShowCreateModal(false)}
                    onCancel={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
};

export default TargetsPage;