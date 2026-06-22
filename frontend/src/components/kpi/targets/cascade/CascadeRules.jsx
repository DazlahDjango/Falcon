import React, { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';
import CascadeRuleForm from './CascadeRuleForm';
import KPIConfirmDialog from '../../common/KPIConfirmDialog';

const CascadeRules = ({ rules, loading, onCreate, onUpdate, onDelete, onSetDefault, canManage }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    if (loading) {
        return <div className="kpi-loading-container">Loading cascade rules...</div>;
    }

    return (
        <div className="kpi-cascade-rules">
            <div className="kpi-cascade-rules-header">
                <h3>Cascade Rules</h3>
                {canManage && (
                    <button className="kpi-cascade-add-btn" onClick={() => setShowForm(true)}>
                        <FiPlus size={14} />
                        Add Rule
                    </button>
                )}
            </div>
            
            <div className="kpi-cascade-rules-list">
                {rules?.map(rule => (
                    <div key={rule.id} className="kpi-cascade-rule-card">
                        <div className="kpi-cascade-rule-header">
                            <div className="kpi-cascade-rule-title">
                                {rule.name}
                                {rule.is_default && <FiStar size={14} className="default-icon" />}
                            </div>
                            {canManage && (
                                <div className="kpi-cascade-rule-actions">
                                    <button onClick={() => {
                                        setEditingRule(rule);
                                        setShowForm(true);
                                    }}>
                                        <FiEdit size={14} />
                                    </button>
                                    <button onClick={() => setDeleteTarget(rule)}>
                                        <FiTrash2 size={14} />
                                    </button>
                                    {!rule.is_default && (
                                        <button onClick={() => onSetDefault(rule.id)}>
                                            <FiStar size={14} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="kpi-cascade-rule-type">
                            Type: {rule.rule_type_display}
                        </div>
                        <div className="kpi-cascade-rule-description">
                            {rule.description}
                        </div>
                    </div>
                ))}
            </div>
            
            {showForm && (
                <CascadeRuleForm 
                    rule={editingRule}
                    onSubmit={async (data) => {
                        if (editingRule) {
                            await onUpdate(editingRule.id, data);
                        } else {
                            await onCreate(data);
                        }
                        setShowForm(false);
                        setEditingRule(null);
                    }}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingRule(null);
                    }}
                />
            )}
            
            <KPIConfirmDialog
                isOpen={!!deleteTarget}
                title="Delete Rule"
                message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
                confirmText="Delete"
                type="danger"
                onConfirm={() => {
                    onDelete(deleteTarget.id);
                    setDeleteTarget(null);
                }}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default CascadeRules;