import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { KPIList, KPICreate } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { KpiPaths } from '../../../routes/kpi.routes';

const KPIsPage = () => {
    const navigate = useNavigate();
    const { canManageKPIs, role, isSuperAdmin } = useKPIPermissions();
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Debug logs
    useEffect(() => {
        console.log('=== KPIsPage Debug ===');
        console.log('canManageKPIs:', canManageKPIs);
        console.log('role:', role);
        console.log('isSuperAdmin:', isSuperAdmin);
        console.log('=====================');
    }, [canManageKPIs, role, isSuperAdmin]);
    
    const handleViewKPI = (id) => {
        navigate(KpiPaths.KPIDetail(id));
    };
    
    const handleEditKPI = (id) => {
        navigate(KpiPaths.KPIEdit(id));
    };
    
    const handleCreateKPI = () => {
        console.log('handleCreateKPI called - opening modal');
        setShowCreateModal(true);
    };
    
    const handleCreateComplete = (newKPI) => {
        setShowCreateModal(false);
        navigate(KpiPaths.KPIDetail(newKPI.id));
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