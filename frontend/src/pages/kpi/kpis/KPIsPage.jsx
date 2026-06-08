import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KPIList, KPICreate } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';

const KPIsPage = () => {
    const navigate = useNavigate();
    const { canManageKPIs } = useKPIPermissions();
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    const handleViewKPI = (id) => {
        navigate(`/kpis/${id}`);
    };
    
    const handleEditKPI = (id) => {
        navigate(`/kpis/${id}/edit`);
    };
    
    const handleCreateKPI = () => {
        setShowCreateModal(true);
    };
    
    const handleCreateComplete = (newKPI) => {
        setShowCreateModal(false);
        navigate(`/kpis/${newKPI.id}`);
    };
    
    return (
        <div className="kpi-page-container">
            <KPIList 
                onViewKPI={handleViewKPI}
                onCreateKPI={canManageKPIs ? handleCreateKPI : null}
                onEditKPI={canManageKPIs ? handleEditKPI : null}
            />
            
            {showCreateModal && (
                <KPICreate 
                    onComplete={handleCreateComplete}
                    onCancel={() => setShowCreateModal(false)}
                />
            )}
        </div>
    );
};

export default KPIsPage;