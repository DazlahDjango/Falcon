// src/pages/reviews/CyclesPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCycles } from '../../hooks/reviews';
import { CycleList, CycleForm } from '../../components/reviews/cycles';
import { REVIEW_ROUTES } from '../../config/constants';

const CyclesPage = () => {
    const navigate = useNavigate();
    const { cycles, loading, createCycle, updateCycle, activateCycle, closeCycle, archiveCycle, fetchCycles } = useCycles();
    const [showForm, setShowForm] = useState(false);
    const [editingCycle, setEditingCycle] = useState(null);
    const [userRole, setUserRole] = useState('staff');

    useEffect(() => {
        fetchCycles();
        setUserRole(localStorage.getItem('user_role') || 'staff');
    }, []);

    const canManage = userRole === 'super_admin' || userRole === 'client_admin' || userRole === 'dashboard_champion' || userRole === 'executive' || userRole === 'hr';

    const handleCreateClick = () => {
        setEditingCycle(null);
        setShowForm(true);
    };

    const handleEdit = (id) => {
        const cycle = cycles.find(c => c.id === id);
        setEditingCycle(cycle);
        setShowForm(true);
    };

    const handleSubmit = async (data) => {
        if (editingCycle) {
            await updateCycle(editingCycle.id, data);
        } else {
            await createCycle(data);
        }
        setShowForm(false);
        setEditingCycle(null);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCycle(null);
    };

    const handleCycleClick = (id) => {
        navigate(REVIEW_ROUTES.REVIEW_CYCLES_DETAIL(id));
    };

    if (showForm) {
        return (
            <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', margin: 0 }}>{editingCycle ? 'Edit Review Cycle' : 'Create New Review Cycle'}</h1>
                </div>
                <CycleForm initialData={editingCycle || {}} onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
        );
    }

    return (
        <CycleList 
            cycles={cycles} 
            loading={loading} 
            onCycleClick={handleCycleClick}
            onCreateClick={canManage ? handleCreateClick : null}
        />
    );
};

export default CyclesPage;