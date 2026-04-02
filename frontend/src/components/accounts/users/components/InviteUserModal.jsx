import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { FiMail, FiUser, FiSend } from 'react-icons/fi';
import { Modal } from '../../../common/UI/Modal';
import { Spinner } from '../../../common/UI/Spinner';
import { inviteUser } from '../../../store/slices/userSlice';
import { showAlert } from '../../../store/slices/uiSlice';

const InviteUserModal = ({ isOpen, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        role: 'staff',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }))
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
        setIsLoading(true);
        try {
            await dispatch(inviteUser(formData)).unwrap();
            dispatch(showAlert({ type: 'success', message: `Invitation sent to ${formData.email}` }));
            onSuccess?.();
            onClose();
            setFormData({ email: '', role: 'staff', message: '' });
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error.message || 'Failed to send invitation' }));
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invite User" size="md">
            <form onSubmit={handleSubmit} className="invite-form">
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
                        <option value="staff">Staff</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="executive">Executive</option>
                        <option value="dashboard_champion">Dashboard Champion</option>
                        <option value="read_only">Read Only</option>
                    </select>
                    {errors.role && <div className="input-feedback error">{errors.role}</div>}
                </div>
                
                <div className="form-group">
                    <label>Personal Message (Optional)</label>
                    <div className="input-wrapper">
                        <FiUser className="input-icon" />
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Add a personal message to the invitation..."
                            rows={3}
                            className="form-input"
                        />
                    </div>
                </div>
                
                <div className="invite-info">
                    <p>The user will receive an email with instructions to create their account.</p>
                </div>
                
                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : (
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