// src/pages/kpi/admin/SectorsPage.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SectorList } from '../../../components/kpi';
import { fetchSectors, createSector, updateSector, deleteSector, selectSectors, selectFrameworkLoading, selectFrameworkError } from '../../../store/kpi';
import { useKPIPermissions } from '../../../hooks/kpi';
import { Navigate } from 'react-router-dom';

const SectorsPage = () => {
    const dispatch = useDispatch();
    const { canManageSectors, isAuthenticated } = useKPIPermissions();
    
    // Debug log
    console.log('SectorsPage - canManageSectors:', canManageSectors);
    
    const sectors = useSelector(selectSectors);
    const loading = useSelector(selectFrameworkLoading);
    const error = useSelector(selectFrameworkError);
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    
    const handleCreate = async (data) => {
        console.log('Creating sector with data:', data);
        try {
            const result = await dispatch(createSector(data)).unwrap();
            console.log('Sector created successfully:', result);
            // Refresh the list
            dispatch(fetchSectors({ is_active: true }));
            return result;
        } catch (err) {
            console.error('Failed to create sector:', err);
            throw err;
        }
    };
    
    const handleUpdate = async (id, data) => {
        await dispatch(updateSector({ id, data })).unwrap();
        dispatch(fetchSectors({ is_active: true }));
    };
    
    const handleDelete = async (id) => {
        await dispatch(deleteSector(id)).unwrap();
        dispatch(fetchSectors({ is_active: true }));
    };
    
    return (
        <div className="kpi-page-container">
            <SectorList 
                sectors={sectors}
                loading={loading}
                error={error}
                onCreate={canManageSectors ? handleCreate : null}
                onUpdate={canManageSectors ? handleUpdate : null}
                onDelete={canManageSectors ? handleDelete : null}
                canManage={canManageSectors}
            />
        </div>
    );
};

export default SectorsPage;