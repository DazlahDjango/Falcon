import React, { useState } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

const SectorForm = ({ sector, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: sector?.name || '',
        code: sector?.code || '',
        sector_type: sector?.sector_type || 'COMMERCIAL',
        description: sector?.description || '',
        is_active: sector?.is_active ?? true
    });
    const [errors, setErrors] = useState({});

    const sectorTypes = [
        { value: 'COMMERCIAL', label: 'Commercial / Corporate' },
        { value: 'NGO', label: 'NGO / Non-Profit' },
        { value: 'PUBLIC', label: 'Public Sector / Government' },
        { value: 'CONSULTING', label: 'Consulting / Professional Services' }
    ];

    const handleSubmit = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Sector name is required';
        if (!formData.code.trim()) newErrors.code = 'Sector code is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="kpi-sector-form-modal">
            <div className="kpi-sector-form-container">
                <div className="kpi-sector-form-header">
                    <h3>{sector ? 'Edit Sector' : 'Create Sector'}</h3>
                    <button className="close" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                <div className="kpi-sector-form-body">
                    <div className="form-group">
                        <label>Sector Name <span className="required">*</span></label>
                        <input 
                            type="text"
                            className={errors.name ? 'error' : ''}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Technology, Healthcare, Finance"
                        />
                        {errors.name && <span className="error">{errors.name}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Sector Code <span className="required">*</span></label>
                        <input 
                            type="text"
                            className={errors.code ? 'error' : ''}
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            placeholder="e.g., TECH, HEALTH, FIN"
                        />
                        {errors.code && <span className="error">{errors.code}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Sector Type</label>
                        <select 
                            value={formData.sector_type}
                            onChange={(e) => setFormData({ ...formData, sector_type: e.target.value })}
                        >
                            {sectorTypes.map(type => (
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
                            placeholder="Describe this sector..."
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="checkbox">
                            <input 
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            Active
                        </label>
                    </div>
                </div>
                
                <div className="kpi-sector-form-footer">
                    <button className="cancel" onClick={onCancel}>Cancel</button>
                    <button className="submit" onClick={handleSubmit}>
                        <FiSave size={14} />
                        {sector ? 'Update' : 'Create'} Sector
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SectorForm;