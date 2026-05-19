// src/pages/reviews/PIPsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePIPs } from '../../hooks/reviews';
import { PIPList } from '../../components/reviews/pip';
import { REVIEW_ROUTES } from '../../config/constants';

const PIPsPage = () => {
    const navigate = useNavigate();
    const { pips, fetchPIPs, loading } = usePIPs();
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        fetchPIPs();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const canManage = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' || userRole === 'hr';

    const handlePipClick = (id) => {
        navigate(REVIEW_ROUTES.REVIEW_PIPS_DETAIL(id));
    };

    const handleCreateClick = () => {
        navigate(REVIEW_ROUTES.REVIEW_PIPS_CREATE);
    };

    return (
        <PIPList 
            pips={pips}
            loading={loading}
            onPipClick={handlePipClick}
            onCreateClick={canManage ? handleCreateClick : null}
        />
    );
};

export default PIPsPage;