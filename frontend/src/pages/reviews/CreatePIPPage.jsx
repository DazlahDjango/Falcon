// src/pages/reviews/CreatePIPPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePIPs, useCycles } from '../../hooks/reviews';
import { PIPForm } from '../../components/reviews/pip';
import { REVIEW_ROUTES } from '../../config/constants';

const CreatePIPPage = () => {
    const navigate = useNavigate();
    const { createPIP, loading } = usePIPs();
    const { cycles, fetchCycles } = useCycles();
    const [employees, setEmployees] = useState([]);
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        fetchCycles();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const canManage = userRole === 'supervisor' || userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'executive' || userRole === 'dashboard_admin';

    const handleSubmit = async (data) => {
        await createPIP(data);
        alert('PIP created successfully');
        navigate(REVIEW_ROUTES.REVIEW_PIPS);
    };

    const handleCancel = () => {
        navigate(REVIEW_ROUTES.REVIEW_PIPS);
    };

    if (!canManage) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444', marginBottom: '0.5rem' }}>Access Denied</h2>
                <p style={{ color: '#6b7280', marginBottom: '1rem' }}>You don't have permission to create PIPs.</p>
                <button className="btn-primary" onClick={() => navigate(REVIEW_ROUTES.REVIEW_DASHBOARD)}>Go to Dashboard</button>
            </div>
        );
    }

    return (
        <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>Create Performance Improvement Plan</h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Create a new PIP for an underperforming employee</p>
            </div>
            <PIPForm 
                employees={employees}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isLoading={loading}
            />
        </div>
    );
};

export default CreatePIPPage;