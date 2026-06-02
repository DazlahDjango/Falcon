// frontend/src/components/kpi/modules/Sectors/SectorManagement.jsx
import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiGrid, FiLayout } from 'react-icons/fi';
import { useSectors } from '../../../../hooks/kpi';
import SectorList from './SectorList';
import SectorCard from './SectorCard';
import SectorForm from './SectorForm';
import SectorDetail from './SectorDetail';
import SectorFilters from './SectorFilters';
import SectorStats from './SectorStats';

const SectorManagement = () => {
    const [viewMode, setViewMode] = useState('grid'); // grid, list, create, edit, detail
    const [selectedSector, setSelectedSector] = useState(null);
    const [filters, setFilters] = useState({
        sectorType: '',
        isActive: '',
        search: '',
    });

    const {
        sectors,
        loading,
        error,
        fetchAll,
        create,
        update,
        delete: deleteSector,
        setCurrent
    } = useSectors(true);

    const handleCreate = async (data) => {
        try {
            await create(data);
            setViewMode('grid');
            await fetchAll();
        } catch (err) {
            console.error('Create failed:', err);
            throw err;
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            await update(id, data);
            setViewMode('grid');
            await fetchAll();
        } catch (err) {
            console.error('Update failed:', err);
            throw err;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sector? All associated frameworks and KPIs will also be affected.')) {
            await deleteSector(id);
            await fetchAll();
        }
    };

    const handleEdit = (sector) => {
        setSelectedSector(sector);
        setViewMode('edit');
    };

    const handleViewDetail = (sector) => {
        setSelectedSector(sector);
        setViewMode('detail');
    };

    const filteredSectors = sectors.filter(sector => {
        if (filters.sectorType && sector.sector_type !== filters.sectorType) return false;
        if (filters.isActive === 'true' && !sector.is_active) return false;
        if (filters.isActive === 'false' && sector.is_active) return false;
        if (filters.search && !sector.name.toLowerCase().includes(filters.search.toLowerCase()) &&
            !sector.code.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    });

    if (viewMode === 'create') {
        return (
            <div className="sector-management">
                <SectorForm
                    onSubmit={handleCreate}
                    onCancel={() => setViewMode('grid')}
                    title="Create New Sector"
                />
            </div>
        );
    }

    if (viewMode === 'edit' && selectedSector) {
        return (
            <div className="sector-management">
                <SectorForm
                    initialData={selectedSector}
                    onSubmit={(data) => handleUpdate(selectedSector.id, data)}
                    onCancel={() => setViewMode('grid')}
                    title="Edit Sector"
                />
            </div>
        );
    }

    if (viewMode === 'detail' && selectedSector) {
        return (
            <div className="sector-management">
                <SectorDetail
                    sector={selectedSector}
                    onEdit={() => handleEdit(selectedSector)}
                    onDelete={() => handleDelete(selectedSector.id)}
                    onBack={() => setViewMode('grid')}
                />
            </div>
        );
    }

    return (
        <div className="sector-management">
            <div className="sector-header">
                <div>
                    <h1 className="sector-title">Sectors</h1>
                    <p className="sector-subtitle">Manage organization sectors and their KPI frameworks</p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <FiGrid size={16} />
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <FiLayout size={16} />
                        </button>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setSelectedSector(null);
                            setViewMode('create');
                        }}
                    >
                        <FiPlus size={16} />
                        Create Sector
                    </button>
                </div>
            </div>

            <SectorStats sectors={sectors} />

            <SectorFilters
                filters={filters}
                onFilterChange={setFilters}
                onRefresh={() => fetchAll()}
                loading={loading}
            />

            {error && (
                <div className="alert-error">
                    <span className="alert-icon">⚠️</span>
                    <span>{error}</span>
                    <button onClick={() => fetchAll()} className="alert-retry">
                        <FiRefreshCw size={14} />
                        Retry
                    </button>
                </div>
            )}

            {viewMode === 'grid' ? (
                <SectorCard
                    sectors={filteredSectors}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleViewDetail}
                />
            ) : (
                <SectorList
                    sectors={filteredSectors}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleViewDetail}
                />
            )}
        </div>
    );
};

export default SectorManagement;