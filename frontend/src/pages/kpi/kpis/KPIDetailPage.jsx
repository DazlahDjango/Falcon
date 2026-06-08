import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KPIDetail } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';

const KPIDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canManageKPIs } = useKPIPermissions();
    
    const handleBack = () => {
        navigate('/kpis');
    };
    
    const handleEdit = (kpiId) => {
        navigate(`/kpis/${kpiId}/edit`);
    };
    
    return (
        <div className="kpi-page-container">
            <KPIDetail 
                kpiId={id}
                onBack={handleBack}
                onEdit={canManageKPIs ? handleEdit : null}
            />
        </div>
    );
};

export default KPIDetailPage;