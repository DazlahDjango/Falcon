import React, { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const FrameworkForm = ({ framework, sectors, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: framework?.name || '',
        code: framework?.code || '',
        sector_id: framework?.sector || '',
        description: framework?.description || '',
        version: framework?.version || '1.0.0',
        status: framework?.status || 'DRAFT'
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Framework name is required';
        if (!formData.code.trim()) newErrors.code = 'Framework code is required';
        if (!formData.sector_id) newErrors.sector_id = 'Please select a sector';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="kpi-framework-form-modal">
            <div className="kpi-framework-form-container">
                <div className="kpi-framework-form-header">
                    <h3>{framework ? 'Edit Framework' : 'Create Framework'}</h3>
                    <button className="close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-framework-form-body">
                    <div className="form-group">
                        <label>Framework Name <span className="required">*</span></label>
                        <input 
                            type="text"
                            className={errors.name ? 'error' : ''}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Corporate Performance Framework"
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Framework Code <span className="required">*</span></label>
                        <input 
                            type="text"
                            className={errors.code ? 'error' : ''}
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., CPF-2024"
                        />
                        {errors.code && <span className="error">{errors.code}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Sector <span className="required">*</span></label>
                        <select 
                            className={errors.sector_id ? 'error' : ''}
                            value={formData.sector_id}
                            onChange={(e) => setFormData({ ...formData, sector_id: e.target.value })}
                        >
                            <option value="">Select a sector...</option>
                            {sectors?.map(sector => (
                                <option key={sector.id} value={sector.id}>{sector.name}</option>
                            ))}
                        </select>
                        {errors.sector_id && <span className="error">{errors.sector_id}</span>}
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Version</label>
                            <input 
                                type="text"
                                value={formData.version}
                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                placeholder="1.0.0"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Status</label>
                            <select 
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="DRAFT">Draft</option>
                                <option value="PUBLISHED">Published</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Description</label>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="3"
                            placeholder="Describe this framework..."
                        />
                    </div>
                </div>
                
                <div className="kpi-framework-form-footer">
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="submit" onClick={handleSubmit}>
                        <FiSave size={14} />
                        {framework ? 'Update' : 'Create'} Framework
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FrameworkForm;