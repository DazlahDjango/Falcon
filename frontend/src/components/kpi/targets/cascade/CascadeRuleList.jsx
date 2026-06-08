import React from 'react';
import { FiStar, FiEdit, FiTrash2 } from 'react-icons/fi';

const CascadeRuleList = ({ rules, onSelect, onEdit, onDelete, onSetDefault, selectedId }) => {
    return (
        <div className="kpi-cascade-rule-list">
            <h4>Available Rules</h4>
            <div className="kpi-cascade-rule-items">
                {rules?.map(rule => (
                    <div 
                        key={rule.id}
                        className={`kpi-cascade-rule-item ${selectedId === rule.id ? 'selected' : ''}`}
                        onClick={() => onSelect?.(rule)}
                    >
                        <div className="kpi-cascade-rule-item-header">
                            <span className="name">{rule.name}</span>
                            {rule.is_default && <FiStar size={12} className="default" />}
                        </div>
                        <div className="kpi-cascade-rule-item-type">
                            {rule.rule_type_display}
                        </div>
                        <div className="kpi-cascade-rule-item-actions">
                            <button onClick={(e) => { e.stopPropagation(); onEdit?.(rule); }}>
                                <FiEdit size={12} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete?.(rule); }}>
                                <FiTrash2 size={12} />
                            </button>
                            {!rule.is_default && (
                                <button onClick={(e) => { e.stopPropagation(); onSetDefault?.(rule.id); }}>
                                    <FiStar size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CascadeRuleList;