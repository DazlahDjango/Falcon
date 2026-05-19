// src/components/reviews/pip/PIPActionList.jsx
import React, { useState } from 'react';
import './pip.css';
import PIPActionForm from './PIPActionForm';

const PIPActionList = ({ actions = [], onComplete, onAdd, canManage = false, isManager = false }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [completingActionId, setCompletingActionId] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const handleComplete = async (actionId, evidence, notes) => {
        setCompletingActionId(actionId);
        try {
            await onComplete(actionId, evidence, notes);
        } finally {
            setCompletingActionId(null);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return '✅';
            case 'missed': return '❌';
            case 'in_progress': return '🔄';
            default: return '⏳';
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed': return 'completed';
            case 'missed': return 'missed';
            case 'in_progress': return 'pending';
            default: return 'pending';
        }
    };

    return (
        <div className="pip-action-list">
            {actions.length === 0 && (
                <div className="pip-empty" style={{ padding: '1rem' }}>
                    <p>No actions added yet.</p>
                </div>
            )}
            
            {actions.map(action => (
                <div key={action.id} className="pip-action-item">
                    <div className={`pip-action-status ${getStatusClass(action.status)}`}>
                        {getStatusIcon(action.status)}
                    </div>
                    <div className="pip-action-content">
                        <div className="pip-action-title">{action.title}</div>
                        {action.description && (
                            <div className="pip-action-description">{action.description}</div>
                        )}
                        <div className="pip-action-meta">
                            <span>Priority: {action.priority_display || action.priority}</span>
                            <span>Due: {formatDate(action.due_date)}</span>
                            {action.completed_at && <span>Completed: {formatDate(action.completed_at)}</span>}
                            {action.requires_evidence && <span>📎 Evidence Required</span>}
                            {action.evidence && <span>✅ Evidence Uploaded</span>}
                        </div>
                        {action.progress_notes && (
                            <div className="pip-action-notes" style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                Notes: {action.progress_notes}
                            </div>
                        )}
                    </div>
                    <div className="pip-action-actions">
                        {action.status !== 'completed' && (canManage || isManager) && (
                            <button 
                                className="btn-success" 
                                onClick={() => handleComplete(action.id, null, '')}
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                                disabled={completingActionId === action.id}
                            >
                                {completingActionId === action.id ? '...' : 'Complete'}
                            </button>
                        )}
                    </div>
                </div>
            ))}
            
            {(canManage || isManager) && (
                <>
                    {!showAddForm ? (
                        <button 
                            className="btn-outline" 
                            onClick={() => setShowAddForm(true)}
                            style={{ marginTop: '1rem', width: '100%' }}
                        >
                            + Add Action
                        </button>
                    ) : (
                        <div className="pip-action-form">
                            <PIPActionForm 
                                onSubmit={async (data) => {
                                    await onAdd(data);
                                    setShowAddForm(false);
                                }}
                                onCancel={() => setShowAddForm(false)}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PIPActionList;