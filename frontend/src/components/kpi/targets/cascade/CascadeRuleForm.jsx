import React, { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const CascadeRuleForm = ({ rule, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: rule?.name || '',
        rule_type: rule?.rule_type || 'EQUAL_SPLIT',
        description: rule?.description || '',
        configuration: rule?.configuration || {}
    });
    const [errors, setErrors] = useState({});

    const ruleTypes = [
                        { value: 'EQUAL_SPLIT', label: 'Equal Split' },
                        { value: 'WEIGHTED', label: 'Weighted by Headcount' },
                        { value: 'WEIGHTED_BY_BUDGET', label: 'Weighted by Budget' },
                        { value: 'CUSTOM', label: 'Custom' }
                    ];

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            setErrors({ name: 'Rule name is required' });
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="kpi-cascade-form-modal">
            <div className="kpi-cascade-form-container">
                <div className="kpi-cascade-form-header">
                    <h3>{rule ? 'Edit Rule' : 'Create Rule'}</h3>
                    <button className="close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-cascade-form-body">
                    <div className="form-group">
                        <label>Rule Name <span className="required">*</span></label>
                        <input 
                            type="text"
                            className={errors.name ? 'error' : ''}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Equal Split Rule"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Rule Type</label>
                        <select 
                            value={formData.rule_type}
                            onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
                        >
                            {ruleTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            placeholder="Describe how this rule works..."
                        />
                    </div>
                </div>
                
                <div className="kpi-cascade-form-footer">
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="submit" onClick={handleSubmit}>
                        <FiSave size={14} />
                        {rule ? 'Update' : 'Create'} Rule
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CascadeRuleForm;