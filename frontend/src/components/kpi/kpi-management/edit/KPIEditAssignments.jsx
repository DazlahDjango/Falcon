import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSave, FiX } from 'react-icons/fi';
import { fetchReferenceData, selectReferenceData } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';

const KPIEditAssignments = ({ kpi, onSave, onCancel }) => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [formData, setFormData] = useState({
        framework_id: kpi?.framework_id || '',
        sector_id: kpi?.sector_id || '',
        category_id: kpi?.category_id || '',
        owner_id: kpi?.owner_id || '',
        department_id: kpi?.department_id || ''
    });
    
    const referenceData = useSelector(selectReferenceData);
    const [frameworks, setFrameworks] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await dispatch(fetchReferenceData(['users', 'departments']));
            setLoading(false);
        };
        loadData();
    }, [dispatch]);
    
    useEffect(() => {
        if (referenceData) {
            setUsers(referenceData.users || []);
            setDepartments(referenceData.departments || []);
        }
    }, [referenceData]);
    
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSubmit = async () => {
        setSubmitError(null);
        setSaving(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Failed to save KPI:', error);
            setSubmitError(error?.message || 'Failed to save KPI. Please try again.');
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Loading assignments..." />;
    }
    
    return (
        <div className="kpi-edit-form">
            {submitError && (
                <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{submitError}</span>
                        <button 
                            className="close-btn" 
                            onClick={() => setSubmitError(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                            <FiX size={18} />
                        </button>
                    </div>
                </div>
            )}
            <div className="form-row">
                <div className="form-group">
                    <label>Framework</label>
                    <select 
                        value={formData.framework_id}
                        onChange={(e) => handleChange('framework_id', e.target.value)}
                    >
                        <option value="">Select Framework</option>
                        {frameworks.map(fw => (
                            <option key={fw.id} value={fw.id}>{fw.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Sector</label>
                    <select 
                        value={formData.sector_id}
                        onChange={(e) => handleChange('sector_id', e.target.value)}
                    >
                        <option value="">Select Sector</option>
                        {sectors.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Category</label>
                    <select 
                        value={formData.category_id}
                        onChange={(e) => handleChange('category_id', e.target.value)}
                    >
                        <option value="">Select Category</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Owner</label>
                    <select 
                        value={formData.owner_id}
                        onChange={(e) => handleChange('owner_id', e.target.value)}
                    >
                        <option value="">Select Owner</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.full_name} ({u.email})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="form-group">
                <label>Department (Optional)</label>
                <select 
                    value={formData.department_id}
                    onChange={(e) => handleChange('department_id', e.target.value)}
                >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="form-actions">
                <button className="cancel-btn" onClick={onCancel}>Cancel</button>
                <button className="save-btn" onClick={handleSubmit} disabled={saving}>
                    <FiSave size={14} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default KPIEditAssignments;