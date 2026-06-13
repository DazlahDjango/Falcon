import React, { useState } from 'react';
import { FiPlus, FiFilter } from 'react-icons/fi';
import TemplateCard from './TemplateCard';
import TemplateForm from './TemplateForm';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPISearchBar from '../../common/KPISearchBar';

const TemplateList = ({ 
    templates, 
    loading, 
    onCreate, 
    onUpdate, 
    onDelete,
    onPublish,
    onUse,
    canManage 
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('');

    const filteredTemplates = templates?.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             t.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = !difficultyFilter || t.difficulty === difficultyFilter;
        return matchesSearch && matchesDifficulty;
    });

    if (loading) {
        return <KPILoading text="Loading templates..." />;
    }

    return (
        <div className="kpi-templates-container">
            <div className="kpi-templates-header">
                <div>
                    <h2>KPI Templates</h2>
                    <p>Pre-built KPI templates for quick setup</p>
                </div>
                {canManage && (
                    <button className="kpi-templates-add-btn" onClick={() => setShowForm(true)}>
                        <FiPlus size={16} />
                        Create Template
                    </button>
                )}
            </div>
            
            <div className="kpi-templates-toolbar">
                <KPISearchBar 
                    value={searchTerm}
                    onSearch={setSearchTerm}
                    placeholder="Search templates..."
                />
                <div className="kpi-templates-filter">
                    <FiFilter size={14} />
                    <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
                        <option value="">All Difficulties</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                    </select>
                </div>
            </div>
            
            {filteredTemplates?.length === 0 ? (
                <KPIEmptyState 
                    icon="📄"
                    title="No Templates Found"
                    description={searchTerm ? "No templates match your search" : "No templates have been created yet"}
                    actionText={canManage ? "Create Template" : null}
                    onAction={canManage ? () => setShowForm(true) : null}
                />
            ) : (
                <div className="kpi-templates-grid">
                    {filteredTemplates.map(template => (
                        <TemplateCard 
                            key={template.id}
                            template={template}
                            onEdit={() => setEditingTemplate(template)}
                            onDelete={() => onDelete(template.id)}
                            onPublish={() => onPublish(template.id)}
                            onUse={() => onUse(template)}
                            canManage={canManage}
                        />
                    ))}
                </div>
            )}
            
            {showForm && (
                <TemplateForm 
                    onSubmit={async (data) => {
                        await onCreate(data);
                        setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}
            
            {editingTemplate && (
                <TemplateForm 
                    template={editingTemplate}
                    onSubmit={async (data) => {
                        await onUpdate(editingTemplate.id, data);
                        setEditingTemplate(null);
                    }}
                    onCancel={() => setEditingTemplate(null)}
                />
            )}
        </div>
    );
};

export default TemplateList;