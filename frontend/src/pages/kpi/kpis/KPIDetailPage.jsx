import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { KPIDetail } from '../../../components/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { KpiPaths } from '../../../routes/kpi.routes';

const KPIDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { canManageKPIs } = useKPIPermissions();

    const handleBack = () => {
        navigate(KpiPaths.KPIs);
    };

    const handleEdit = (kpiId) => {
        navigate(KpiPaths.KPIEdit(kpiId));
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