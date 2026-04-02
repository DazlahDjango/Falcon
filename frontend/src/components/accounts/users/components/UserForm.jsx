import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiLock } from "react-icons/fi";
import UserRoleBadge from './UserRoleBadge';
import { PasswordStrength } from '../../../common/Forms/PasswordStrength';

const UserForm = ({ initialData = {}, onSubmit, onCancel, isEdit = false }) => {
    const [formData, setFormData] = ({
        email: initialData.email || '',
        username: initialData.username || '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        phone: initialData.phone || '',
        role: initialData.role || 'staff',
        title: initialData.title || '',
        department: initialData.department || '',
        password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.username) newErrors.username = 'Username required';
        else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
        if (!isEdit) {
            if (!formData.password) newErrors.password = 'Password is required';
            else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
            if (formData.password !== formData.confirm_password) {
                newErrors.confirm_password = 'Password do not match';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const submitData = { ...formData };
            if (isEdit) {
                delete submitData.password;
                delete submitData.confirm_password;
            }
            onSubmit(submitData);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="user-form">
            <div className="form-row">
                <div className="form-group">
                    <label>First Name</label>
                    <div className="input-wrapper">
                        <FiUser className="input-icon" />
                        <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
            </div>
            
            <div className="form-group">
                <label>Email *</label>
                <div className="input-wrapper">
                    <FiMail className="input-icon" />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                        required
                    />
                </div>
                {errors.email && <div className="input-feedback error">{errors.email}</div>}
            </div>
            
            <div className="form-group">
                <label>Username *</label>
                <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`form-input ${errors.username ? 'is-invalid' : ''}`}
                        required
                    />
                </div>
                {errors.username && <div className="input-feedback error">{errors.username}</div>}
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Phone</label>
                    <div className="input-wrapper">
                        <FiPhone className="input-icon" />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Role *</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="form-input"
                        required
                    >
                        <option value="staff">Staff</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="executive">Executive</option>
                        <option value="dashboard_champion">Dashboard Champion</option>
                        <option value="read_only">Read Only</option>
                    </select>
                </div>
            </div>
            
            <div className="form-row">
                <div className="form-group">
                    <label>Job Title</label>
                    <div className="input-wrapper">
                        <FiBriefcase className="input-icon" />
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="form-input"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Department</label>
                    <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
            </div>
            
            {!isEdit && (
                <>
                    <div className="form-group">
                        <label>Password *</label>
                        <div className="input-wrapper">
                            <FiLock className="input-icon" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`form-input ${errors.password ? 'is-invalid' : ''}`}
                                required
                            />
                        </div>
                        {errors.password && <div className="input-feedback error">{errors.password}</div>}
                    </div>
                    
                    <PasswordStrength password={formData.password} />
                    
                    <div className="form-group">
                        <label>Confirm Password *</label>
                        <div className="input-wrapper">
                            <FiLock className="input-icon" />
                            <input
                                type="password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                                className={`form-input ${errors.confirm_password ? 'is-invalid' : ''}`}
                                required
                            />
                        </div>
                        {errors.confirm_password && <div className="input-feedback error">{errors.confirm_password}</div>}
                    </div>
                </>
            )}
            
            <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                    {isEdit ? 'Update User' : 'Create User'}
                </button>
            </div>
        </form>
    );
};
export default UserForm;