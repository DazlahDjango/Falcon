import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PermissionList from './PermissionList';

const RoleForm = ({ initialData = {}, onSubmit, onCancel, isEdit = false }) => {
    const { roles } = useSelector((state) => state.roles);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        parent_id: '',
        is_assignable: true,
        permissions: []
    });
    const [errors, setErrors] = useState({});
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                code: initialData.code || '',
                description: initialData.description || '',
                parent_id: initialData.parent?.id || '',
                is_assignable: initialData.is_assignable !== undefined ? initialData.is_assignable : true,
                permissions: initialData.permissions?.map(p => p.id) || []
            });
        }
    }, [initialData]);
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    const handlePermissionsChange = (selectedPermissions) => {
        setFormData(prev => ({ ...prev, permissions: selectedPermissions }));
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.code.trim()) newErrors.code = 'Code is required';
        else if (!/^[a-z_]+$/.test(formData.code)) {
            newErrors.code = 'Code must contain only lowercase letters and underscores';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="role-form">
            <div className="form-group">
                <label>Role Name *</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="e.g., Department Manager"
                />
                {errors.name && <div className="input-feedback error">{errors.name}</div>}
            </div>
            
            <div className="form-group">
                <label>Role Code *</label>
                <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`form-input ${errors.code ? 'is-invalid' : ''}`}
                    placeholder="e.g., department_manager"
                    disabled={isEdit}
                />
                {errors.code && <div className="input-feedback error">{errors.code}</div>}
                <small className="helper-text">System identifier - cannot be changed after creation</small>
            </div>
            
            <div className="form-group">
                <label>Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="form-input"
                    placeholder="Describe the role and its responsibilities"
                />
            </div>
            
            <div className="form-group">
                <label>Parent Role</label>
                <select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleChange}
                    className="form-input"
                >
                    <option value="">None (Top Level)</option>
                    {roles.filter(r => r.id !== initialData?.id).map(role => (
                        <option key={role.id} value={role.id}>
                            {role.name} ({role.code})
                        </option>
                    ))}
                </select>
                <small className="helper-text">Child roles inherit permissions from parent</small>
            </div>
            
            <div className="form-group checkbox">
                <label>
                    <input
                        type="checkbox"
                        name="is_assignable"
                        checked={formData.is_assignable}
                        onChange={handleChange}
                    />
                    <span>Assignable by tenant admins</span>
                </label>
                <small className="helper-text">If unchecked, only super admins can assign this role</small>
            </div>
            
            <div className="permissions-section">
                <h3>Permissions</h3>
                <PermissionList 
                    selectedPermissions={formData.permissions}
                    onChange={handlePermissionsChange}
                />
            </div>
            
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {isEdit ? 'Update Role' : 'Create Role'}
                </button>
            </div>
        </form>
    );
};
export default RoleForm;