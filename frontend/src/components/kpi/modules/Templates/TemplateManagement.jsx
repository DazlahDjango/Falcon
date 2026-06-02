import React, { useState, useEffect } from 'react';
import { FiPlus, FiRefreshCw, FiGrid, FiLayout, FiBookOpen } from 'react-icons/fi';
import { useTemplates, useSectors, useFrameworks } from '../../../../hooks/kpi';
import TemplateLibrary from './TemplateLibrary';
import TemplateList from './TemplateList';
import TemplateCard from './TemplateCard';
import TemplateForm from './TemplateForm';
import TemplateDetail from './TemplateDetail';
import TemplateFilters from './TemplateFilters';
import TemplateStats from './TemplateStats';
import TemplateUseModal from './TemplateUseModal';

const TemplateManagement = () => {
    const [viewMode, setViewMode] = useState('library'); // library, list, create, edit, detail
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [showUseModal, setShowUseModal] = useState(false);
    const [filters, setFilters] = useState({
        sector: '',
        category: '',
        difficulty: '',
        isPublished: '',
        search: '',
    });

    const {
        templates,
        publishedTemplates,
        loading,
        error,
        fetchAll,
        create,
        update,
        delete: deleteTemplate,
        publish,
        use: useTemplate,
        setCurrent
    } = useTemplates(true);

    const { sectors } = useSectors(true);
    const { frameworks } = useFrameworks(true);

    useEffect(() => {
        fetchAll({ is_published: true });
    }, []);

    const handleCreate = async (data) => {
        try {
            await create(data);
            setViewMode('library');
            await fetchAll();
        } catch (err) {
            console.error('Create failed:', err);
            throw err;
        }
    };

    const handleUpdate = async (id, data) => {
        try {
            await update(id, data);
            setViewMode('library');
            await fetchAll();
        } catch (err) {
            console.error('Update failed:', err);
            throw err;
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            await deleteTemplate(id);
            await fetchAll();
        }
    };

    const handlePublish = async (id) => {
        await publish(id);
        await fetchAll();
    };

    const handleUseTemplate = async (templateId, frameworkId) => {
        try {
            const kpi = await useTemplate(templateId, frameworkId);
            setShowUseModal(false);
            // Navigate to KPI edit page or show success
            return kpi;
        } catch (err) {
            console.error('Failed to use template:', err);
            throw err;
        }
    };

    const handleEdit = (template) => {
        setSelectedTemplate(template);
        setViewMode('edit');
    };

    const handleViewDetail = (template) => {
        setSelectedTemplate(template);
        setViewMode('detail');
    };

    const filteredTemplates = templates.filter(template => {
        if (filters.sector && template.sector !== filters.sector) return false;
        if (filters.difficulty && template.difficulty !== filters.difficulty) return false;
        if (filters.isPublished === 'true' && !template.is_published) return false;
        if (filters.isPublished === 'false' && template.is_published) return false;
        if (filters.search && !template.name.toLowerCase().includes(filters.search.toLowerCase()) &&
            !template.code.toLowerCase().includes(filters.search.toLowerCase())) return false;
        return true;
    });

    if (viewMode === 'create') {
        return (
            <div className="template-management">
                <TemplateForm
                    sectors={sectors}
                    onSubmit={handleCreate}
                    onCancel={() => setViewMode('library')}
                    title="Create New Template"
                />
            </div>
        );
    }

    if (viewMode === 'edit' && selectedTemplate) {
        return (
            <div className="template-management">
                <TemplateForm
                    sectors={sectors}
                    initialData={selectedTemplate}
                    onSubmit={(data) => handleUpdate(selectedTemplate.id, data)}
                    onCancel={() => setViewMode('library')}
                    title="Edit Template"
                />
            </div>
        );
    }

    if (viewMode === 'detail' && selectedTemplate) {
        return (
            <div className="template-management">
                <TemplateDetail
                    template={selectedTemplate}
                    onEdit={() => handleEdit(selectedTemplate)}
                    onDelete={() => handleDelete(selectedTemplate.id)}
                    onPublish={() => handlePublish(selectedTemplate.id)}
                    onUse={() => {
                        setSelectedTemplate(selectedTemplate);
                        setShowUseModal(true);
                    }}
                    onBack={() => setViewMode('library')}
                />
            </div>
        );
    }

    return (
        <div className="template-management">
            <div className="template-header">
                <div>
                    <h1 className="template-title">KPI Template Library</h1>
                    <p className="template-subtitle">Pre-built KPI templates to accelerate KPI creation</p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'library' ? 'active' : ''}`}
                            onClick={() => setViewMode('library')}
                            title="Library View"
                        >
                            <FiBookOpen size={16} />
                        </button>
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
                            setSelectedTemplate(null);
                            setViewMode('create');
                        }}
                    >
                        <FiPlus size={16} />
                        Create Template
                    </button>
                </div>
            </div>

            <TemplateStats templates={templates} />

            <TemplateFilters
                sectors={sectors}
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

            {viewMode === 'library' && (
                <TemplateLibrary
                    templates={filteredTemplates}
                    loading={loading}
                    onView={handleViewDetail}
                    onUse={(template) => {
                        setSelectedTemplate(template);
                        setShowUseModal(true);
                    }}
                />
            )}

            {viewMode === 'grid' && (
                <TemplateCard
                    templates={filteredTemplates}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleViewDetail}
                    onUse={(template) => {
                        setSelectedTemplate(template);
                        setShowUseModal(true);
                    }}
                />
            )}

            {viewMode === 'list' && (
                <TemplateList
                    templates={filteredTemplates}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleViewDetail}
                    onUse={(template) => {
                        setSelectedTemplate(template);
                        setShowUseModal(true);
                    }}
                />
            )}

            {showUseModal && selectedTemplate && (
                <TemplateUseModal
                    template={selectedTemplate}
                    frameworks={frameworks}
                    onConfirm={handleUseTemplate}
                    onClose={() => setShowUseModal(false)}
                />
            )}
        </div>
    );
};

export default TemplateManagement;