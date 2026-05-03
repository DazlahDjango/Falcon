// frontend/src/components/tenant/tenant-users/TenantInviteUser.jsx
import React, { useState } from 'react';
import './tenant-users.css';

export const TenantInviteUser = ({ onInvite, isLoading = false }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('staff');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setError('');
        await onInvite({ email, role, message });
        setEmail('');
        setRole('staff');
        setMessage('');
        setIsModalOpen(false);
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                + Invite User
            </button>

            {isModalOpen && (
                <div className="tenant-invite-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="tenant-invite-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="tenant-invite-modal-header">
                            <h3 className="tenant-invite-modal-title">Invite User</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="tenant-invite-modal-body">
                                {error && (
                                    <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                                        {error}
                                    </div>
                                )}

                                <div className="tenant-invite-form">
                                    <div className="tenant-invite-form-group">
                                        <label className="tenant-invite-label">Email *</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="tenant-invite-input"
                                            placeholder="user@example.com"
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="tenant-invite-form-group">
                                        <label className="tenant-invite-label">Role</label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="tenant-invite-select"
                                            disabled={isLoading}
                                        >
                                            <option value="admin">Admin - Full access</option>
                                            <option value="manager">Manager - Team access</option>
                                            <option value="staff">Staff - Self access only</option>
                                            <option value="readonly">Read Only - View only</option>
                                        </select>
                                    </div>

                                    <div className="tenant-invite-form-group">
                                        <label className="tenant-invite-label">Personal Message (Optional)</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="tenant-invite-input"
                                            rows="3"
                                            placeholder="Add a personal message to the invitation..."
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="tenant-invite-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isLoading ? 'Sending...' : 'Send Invitation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};