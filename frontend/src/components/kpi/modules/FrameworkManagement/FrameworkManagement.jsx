import React, { useState } from 'react';
import { useFrameworks, useSectors } from '../../../../hooks/kpi';
import FrameworkList from './FrameworkList';
import FrameworkForm from './FrameworkForm';
import FrameworkDetail from './FrameworkDetail';
import FrameworkFilters from './FrameworkFilters';

const FrameworkManagement = () => {
    const [viewMode, setViewMode] = useState('list'); // list, create, edit, detail
    const [selectedFramework, setSelectedFramework] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        sector: '',
        search: '',
    });

    const { frameworks, loading, error, fetchAll, create, update, delete: deleteFramework, publish, archive, duplicate } = useFrameworks(true);
    const { sectors } = useSectors(true);

    const handleCreate = async (data) => {
        try {
            await create(data);
            setViewMode('list');
            await fetchAll();
        } catch (err) {
            console.error('Create failed:', err);
            throw err;
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            await update(id, data);
            setViewMode('list');
            await fetchAll();
        } catch (err) {
            console.error('Update failed:', err);
            throw err;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this framework? This action cannot be undone.')) {
            await deleteFramework(id);
            await fetchAll();
        }
    };

    const handlePublish = async (id) => {
        await publish(id);
        await fetchAll();
    };

    const handleArchive = async (id) => {
        await archive(id);
        await fetchAll();
    };

    const handleDuplicate = async (id) => {
        await duplicate(id);
        await fetchAll();
    };

    const handleEdit = (framework) => {
        setSelectedFramework(framework);
        setViewMode('edit');
    };

    const handleViewDetail = (framework) => {
        setSelectedFramework(framework);
        setViewMode('detail');
    };

    const handleFilterChange = (newFilters) => {
        setFilters({ ...filters, ...newFilters });
    };

    const filteredFrameworks = frameworks.filter(framework => {
        if (filters.status && framework.status !== filters.status) return false;
        if (filters.sector && framework.sector !== filters.sector) return false;
        if (filters.search && !framework.name.toLowerCase().includes(filters.search.toLowerCase()) &&
            !framework.code.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    });

    if (viewMode === 'create') {
        return (
            <div className="framework-management">
                <FrameworkForm
                    sectors={sectors}
                    onSubmit={handleCreate}
                    onCancel={() => setViewMode('list')}
                    title="Create New Framework"
                />
            </div>
        );
    }

    if (viewMode === 'edit' && selectedFramework) {
        return (
            <div className="framework-management">
                <FrameworkForm
                    sectors={sectors}
                    initialData={selectedFramework}
                    onSubmit={(data) => handleUpdate(selectedFramework.id, data)}
                    onCancel={() => setViewMode('list')}
                    title="Edit Framework"
                />
            </div>
        );
    }

    if (viewMode === 'detail' && selectedFramework) {
        return (
            <div className="framework-management">
                <FrameworkDetail
                    framework={selectedFramework}
                    onEdit={() => handleEdit(selectedFramework)}
                    onDelete={() => handleDelete(selectedFramework.id)}
                    onPublish={() => handlePublish(selectedFramework.id)}
                    onArchive={() => handleArchive(selectedFramework.id)}
                    onDuplicate={() => handleDuplicate(selectedFramework.id)}
                    onBack={() => setViewMode('list')}
                />
            </div>
        );
    }

    return (
        <div className="framework-management">
            <div className="framework-header">
                <div>
                    <h1 className="framework-title">KPI Frameworks</h1>
                    <p className="framework-subtitle">Manage KPI frameworks, categories, and templates</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setSelectedFramework(null);
                        setViewMode('create');
                    }}
                >
                    <span className="btn-icon">+</span>
                    Create Framework
                </button>
            </div>

            <FrameworkFilters
                sectors={sectors}
                filters={filters}
                onFilterChange={handleFilterChange}
                onRefresh={() => fetchAll()}
                loading={loading}
            />

            {error && (
                <div className="alert-error">
                    <span className="alert-icon">⚠️</span>
                    <span>{error}</span>
                    <button onClick={() => fetchAll()} className="alert-retry">Retry</button>
                </div>
            )}

            <FrameworkList
                frameworks={filteredFrameworks}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleViewDetail}
                onPublish={handlePublish}
                onArchive={handleArchive}
                onDuplicate={handleDuplicate}
            />
        </div>
    );
};

export default FrameworkManagement;