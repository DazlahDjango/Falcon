import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { FiSave, FiX } from 'react-icons/fi';
import { fetchReferenceData } from '../../../../store/kpi';
import KPILoading from '../../common/KPILoading';

const KPIWeightForm = ({ weight, onSubmit, onCancel }) => {
    const dispatch = useDispatch();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user_id: weight?.user_id || '',
        weight: weight?.weight || '',
        effective_from: weight?.effective_from || new Date().toISOString().split('T')[0],
        effective_to: weight?.effective_to || '',
        is_active: weight?.is_active !== undefined ? weight.is_active : true
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    
    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            try {
                const result = await dispatch(fetchReferenceData(['users'])).unwrap();
                setUsers(result.users || []);
            } catch (err) {
                console.error('Failed to load users:', err);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, [dispatch]);
    
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };
    
    const validate = () => {
        const newErrors = {};
        if (!formData.user_id) newErrors.user_id = 'Please select a user';
        if (!formData.weight) newErrors.weight = 'Weight is required';
        if (formData.weight && (formData.weight < 0 || formData.weight > 100)) {
            newErrors.weight = 'Weight must be between 0 and 100';
        }
        if (formData.effective_from && formData.effective_to && 
            new Date(formData.effective_from) > new Date(formData.effective_to)) {
            newErrors.effective_to = 'End date must be after start date';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = async () => {
        if (!validate()) return;
        setErrors({});
        setSubmitError(null);
        setIsLoading(true);
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Failed to submit weight:', error);
            setSubmitError(error?.message || 'Failed to save weight. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (loading) {
        return <KPILoading size="sm" text="Loading users..." />;
    }
    
    return (
        <div className="kpi-weight-form-modal">
            <div className="kpi-weight-form-container">
                <div className="kpi-weight-form-header">
                    <h3>{weight ? 'Edit Weight' : 'Add User Weight'}</h3>
                    <button className="close-btn" onClick={onCancel}>
                        <FiX size={20} />
                    </button>
                </div>
                
                {submitError && (
                    <div className="alert alert-danger" style={{ margin: '1rem' }}>
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
                
                <div className="kpi-weight-form-body">
                    <div className="form-group">
                        <label>User <span className="required">*</span></label>
                        <select 
                            value={formData.user_id}
                            onChange={(e) => handleChange('user_id', e.target.value)}
                            className={errors.user_id ? 'error' : ''}
                        >
                            <option value="">Select a user...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.full_name} ({user.email})
                                </option>
                            ))}
                        </select>
                        {errors.user_id && <span className="error-text">{errors.user_id}</span>}
                    </div>
                    
                    <div className="form-group">
                        <label>Weight (%) <span className="required">*</span></label>
                        <input 
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={formData.weight}
                            onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                            placeholder="Enter percentage weight"
                            className={errors.weight ? 'error' : ''}
                        />
                        {errors.weight && <span className="error-text">{errors.weight}</span>}
                        <small>Percentage of KPI responsibility for this user</small>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Effective From</label>
                            <input 
                                type="date"
                                value={formData.effective_from}
                                onChange={(e) => handleChange('effective_from', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Effective To</label>
                            <input 
                                type="date"
                                value={formData.effective_to}
                                onChange={(e) => handleChange('effective_to', e.target.value)}
                            />
                            {errors.effective_to && <span className="error-text">{errors.effective_to}</span>}
                        </div>
                    </div>
                    
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => handleChange('is_active', e.target.checked)}
                            />
                            Active
                        </label>
                    </div>
                </div>
                
                <div className="kpi-weight-form-footer">
                    <button className="cancel-btn" onClick={onCancel} disabled={isLoading}>Cancel</button>
                    <button className="submit-btn" onClick={handleSubmit} disabled={isLoading}>
                        <FiSave size={14} />
                        {isLoading ? 'Saving...' : (weight ? 'Update Weight' : 'Add Weight')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KPIWeightForm;