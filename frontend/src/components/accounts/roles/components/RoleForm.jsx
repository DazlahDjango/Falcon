import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FiShield, FiUsers, FiLock, FiInfo } from 'react-icons/fi';
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
        if (initialData && Object.keys(initialData).length > 0) {
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
        
        if (!formData.name.trim()) {
            newErrors.name = 'Role name is required';
        }
        
        if (!formData.code.trim()) {
            newErrors.code = 'Role code is required';
        } else if (!/^[a-z_]+$/.test(formData.code)) {
            newErrors.code = 'Code must contain only lowercase letters and underscores';
        } else if (!isEdit && roles.some(r => r.code === formData.code)) {
            newErrors.code = 'A role with this code already exists';
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

    const getParentRoleOptions = () => {
        const availableRoles = roles.filter(role => {
            if (isEdit && role.id === initialData.id) return false;
            if (role.is_system && !isEdit) return false;
            return true;
        });
        
        return [
            { id: '', name: 'None (Top Level)' },
            ...availableRoles
        ];
    };

    return (
        <form onSubmit={handleSubmit} className="role-form">
            <div className="form-section">
                <h3>Basic Information</h3>
                
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
                    <small className="input-help">
                        System identifier - cannot be changed after creation. Use lowercase letters and underscores only.
                    </small>
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
            </div>

            <div className="form-section">
                <h3>Role Hierarchy</h3>
                
                <div className="form-group">
                    <label>Parent Role</label>
                    <select
                        name="parent_id"
                        value={formData.parent_id}
                        onChange={handleChange}
                        className="form-input"
                    >
                        {getParentRoleOptions().map(role => (
                            <option key={role.id || 'none'} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                    <small className="input-help">
                        Child roles inherit all permissions from their parent role.
                    </small>
                </div>
                
                <div className="form-group checkbox">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            name="is_assignable"
                            checked={formData.is_assignable}
                            onChange={handleChange}
                        />
                        <span>Assignable by tenant admins</span>
                    </label>
                    <small className="input-help">
                        If unchecked, only super admins can assign this role to users.
                    </small>
                </div>
            </div>

            <div className="form-section">
                <div className="section-header">
                    <h3><FiShield /> Permissions</h3>
                    <span className="permission-count">
                        {formData.permissions.length} permission(s) selected
                    </span>
                </div>
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