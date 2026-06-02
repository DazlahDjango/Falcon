import React from 'react';
import FrameworkCard from './FrameworkCard';

const FrameworkList = ({ frameworks, loading, onEdit, onDelete, onView, onPublish, onArchive, onDuplicate }) => {
    if (loading) {
        return (
            <div className="framework-loading">
                <div className="spinner"></div>
                <p>Loading frameworks...</p>
            </div>
        );
    }

    if (frameworks.length === 0) {
        return (
            <div className="framework-empty">
                <div className="empty-icon">📋</div>
                <h3>No Frameworks Found</h3>
                <p>Get started by creating your first KPI framework.</p>
                <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('open-create-framework'))}>
                    Create Framework
                </button>
            </div>
        );
    }

    return (
        <div className="framework-grid">
            {frameworks.map(framework => (
                <FrameworkCard
                    key={framework.id}
                    framework={framework}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onView={onView}
                    onPublish={onPublish}
                    onArchive={onArchive}
                    onDuplicate={onDuplicate}
                />
            ))}
        </div>
    );
};

export default FrameworkList;