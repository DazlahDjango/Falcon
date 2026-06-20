import React, { useState } from 'react';
import { FiPlus, FiFilter } from 'react-icons/fi';
import FrameworkCard from './FrameworkCard';
import FrameworkForm from './FrameworkForm';
import KPILoading from '../../common/KPILoading';
import KPIEmptyState from '../../common/KPIEmptyState';
import KPISearchBar from '../../common/KPISearchBar';

const FrameworkList = ({ 
    frameworks, 
    sectors,
    loading, 
    onCreate, 
    onUpdate, 
    onDelete,
    onPublish,
    onArchive,
    onDuplicate,
    canManage 
}) => {
    const [showForm, setShowForm] = useState(false);
    const [editingFramework, setEditingFramework] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredFrameworks = frameworks?.filter(fw => {
        const matchesSearch = fw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             fw.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || fw.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <KPILoading text="Loading frameworks..." />;
    }

    return (
        <div className="kpi-frameworks-container">
            <div className="kpi-frameworks-header">
                <div>
                    <h2>KPI Frameworks</h2>
                    <p>Manage KPI frameworks and their versions</p>
                </div>
                {canManage && (
                    <button className="kpi-frameworks-add-btn" onClick={() => setShowForm(true)}>
                        <FiPlus size={16} />
                        Create Framework
                    </button>
                )}
            </div>
            
            <div className="kpi-frameworks-toolbar">
                <KPISearchBar 
                    value={searchTerm}
                    onSearch={setSearchTerm}
                    placeholder="Search frameworks..."
                />
                <div className="kpi-frameworks-filter">
                    <FiFilter size={14} />
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                </div>
            </div>
            
            {filteredFrameworks?.length === 0 ? (
                <KPIEmptyState 
                    icon="📋"
                    title="No Frameworks Found"
                    description={searchTerm ? "No frameworks match your search" : "No frameworks have been created yet"}
                    actionText={canManage ? "Create Framework" : null}
                    onAction={canManage ? () => setShowForm(true) : null}
                />
            ) : (
                <div className="kpi-frameworks-grid">
                    {filteredFrameworks.map(framework => (
                        <FrameworkCard 
                            key={framework.id}
                            framework={framework}
                            onEdit={() => setEditingFramework(framework)}
                            onDelete={() => onDelete(framework.id)}
                            onPublish={() => onPublish(framework.id)}
                            onArchive={() => onArchive(framework.id)}
                            onDuplicate={() => onDuplicate(framework.id)}
                            canManage={canManage}
                        />
                    ))}
                </div>
            )}
            
            {showForm && (
                <FrameworkForm 
                    sectors={sectors}
                    onSubmit={async (data) => {
                        await onCreate(data);
                        setShowForm(false);
                    }}
                    onCancel={() => setShowForm(false)}
                />
            )}
            
            {editingFramework && (
                <FrameworkForm 
                    framework={editingFramework}
                    sectors={sectors}
                    onSubmit={async (data) => {
                        await onUpdate(editingFramework.id, data);
                        setEditingFramework(null);
                    }}
                    onCancel={() => setEditingFramework(null)}
                />
            )}
        </div>
    );
};

export default FrameworkList;