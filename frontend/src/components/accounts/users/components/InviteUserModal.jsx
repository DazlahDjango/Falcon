import React, { useState } from 'react';
import { FiMail, FiSend, FiAlertCircle } from 'react-icons/fi';
import { useUsers } from '../../../../hooks/accounts/useUsers';
import Modal from '../../../common/UI/Modal';
import Spinner from '../../../common/UI/Spinner';

const InviteUserModal = ({ isOpen, onClose, onSuccess }) => {
    const { sendInvitation, invitationLoading } = useUsers();

    const [formData, setFormData] = useState({
        email: '',
        role: 'staff',
        message: ''
    });
    const [errors, setErrors] = useState({});

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
        if (!formData.role) newErrors.role = 'Role is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            await sendInvitation(formData);
            onSuccess?.();
            onClose();
            setFormData({ email: '', role: 'staff', message: '' });
        } catch (error) {
            // Error handled by hook
        }
    };

    const roleOptions = [
        { value: 'staff', label: 'Staff Member', description: 'Regular employee with standard access' },
        { value: 'supervisor', label: 'Supervisor', description: 'Can manage team members and approve KPIs' },
        { value: 'executive', label: 'Executive', description: 'Strategic oversight and reporting' },
        { value: 'dashboard_champion', label: 'Dashboard Champion', description: 'Manage company-wide targets' },
        { value: 'read_only', label: 'Read Only', description: 'View-only access for auditors' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member" size="md">
            <form onSubmit={handleSubmit} className="invite-form">
                <div className="invite-info-banner">
                    <FiAlertCircle size={18} />
                    <span>The user will receive an email with instructions to create their account.</span>
                </div>

                <div className="form-group">
                    <label>Email Address *</label>
                    <div className="input-wrapper">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="colleague@company.com"
                            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                            autoFocus
                        />
                    </div>
                    {errors.email && <div className="input-feedback error">{errors.email}</div>}
                </div>

                <div className="form-group">
                    <label>Role *</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`form-input ${errors.role ? 'is-invalid' : ''}`}
                    >
                        {roleOptions.map(role => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                    <small className="input-help">
                        {roleOptions.find(r => r.value === formData.role)?.description}
                    </small>
                    {errors.role && <div className="input-feedback error">{errors.role}</div>}
                </div>

                <div className="form-group">
                    <label>Personal Message (Optional)</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Add a personal message to the invitation..."
                        rows={3}
                        className="form-input"
                    />
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={invitationLoading}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={invitationLoading}>
                        {invitationLoading ? <Spinner size="sm" /> : (
                            <>
                                <FiSend size={16} />
                                Send Invitation
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default InviteUserModal;