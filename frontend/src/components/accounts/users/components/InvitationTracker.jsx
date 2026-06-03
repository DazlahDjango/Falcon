// frontend/src/components/accounts/users/InvitationTracker.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    FiMail, FiCheckCircle, FiXCircle, FiClock,
    FiRefreshCw, FiFilter, FiSearch, FiSend,
    FiTrash2, FiRepeat
} from 'react-icons/fi';
import { useUsers } from '../../../store/accounts/hooks/useUsers';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import ConfirmationDialog from '../../common/Feedback/ConfirmationDialog';

const InvitationTracker = () => {
    const dispatch = useDispatch();
    const {
        invitations,
        invitationLoading,
        loadInvitations,
        resendUserInvitation,
        cancelUserInvitation,
        clearError
    } = useUsers();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedInvitation, setSelectedInvitation] = useState(null);
    const [actionType, setActionType] = useState(null);

    useEffect(() => {
        loadInvitations();
    }, [loadInvitations]);

    const getStatusBadge = (status, expiresAt) => {
        if (status === 'accepted') {
            return { text: 'Accepted', class: 'status-accepted', icon: <FiCheckCircle size={12} /> };
        }
        if (new Date(expiresAt) < new Date()) {
            return { text: 'Expired', class: 'status-expired', icon: <FiXCircle size={12} /> };
        }
        return { text: 'Pending', class: 'status-pending', icon: <FiClock size={12} /> };
    };

    const filteredInvitations = invitations.filter(inv => {
        const matchesSearch = inv.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleResend = async () => {
        if (selectedInvitation) {
            await resendUserInvitation(selectedInvitation.id);
            setSelectedInvitation(null);
            setActionType(null);
            loadInvitations();
            dispatch(showAlert({ type: 'success', message: 'Invitation resent successfully' }));
        }
    };

    const handleCancel = async () => {
        if (selectedInvitation) {
            await cancelUserInvitation(selectedInvitation.id);
            setSelectedInvitation(null);
            setActionType(null);
            loadInvitations();
            dispatch(showAlert({ type: 'success', message: 'Invitation cancelled' }));
        }
    };

    if (invitationLoading && !invitations.length) {
        return (
            <div className="invitation-loading">
                <Spinner size="lg" />
                <p>Loading invitations...</p>
            </div>
        );
    }

    return (
        <div className="invitation-tracker">
            {/* Header */}
            <div className="tracker-header">
                <div>
                    <h2>Invitation Tracker</h2>
                    <p>Track and manage user invitations</p>
                </div>
                <button className="refresh-btn" onClick={() => loadInvitations()}>
                    <FiRefreshCw size={16} />
                    Refresh
                </button>
            </div>

            {/* Stats Summary */}
            <div className="tracker-stats">
                <div className="stat-card">
                    <div className="stat-icon"><FiMail size={20} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{invitations.length}</div>
                        <div className="stat-label">Total Invitations</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon"><FiCheckCircle size={20} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{invitations.filter(i => i.status === 'accepted').length}</div>
                        <div className="stat-label">Accepted</div>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon"><FiClock size={20} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{invitations.filter(i => i.status === 'pending' && new Date(i.expires_at) > new Date()).length}</div>
                        <div className="stat-label">Pending</div>
                    </div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-icon"><FiXCircle size={20} /></div>
                    <div className="stat-info">
                        <div className="stat-value">{invitations.filter(i => new Date(i.expires_at) < new Date()).length}</div>
                        <div className="stat-label">Expired</div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="tracker-filters">
                <div className="search-box">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="expired">Expired</option>
                </select>
            </div>

            {/* Invitations Table */}
            <div className="invitation-table-container">
                <table className="invitation-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Invited By</th>
                            <th>Sent Date</th>
                            <th>Expires</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvitations.map(inv => {
                            const status = getStatusBadge(inv.status, inv.expires_at);
                            const isExpired = new Date(inv.expires_at) < new Date();

                            return (
                                <tr key={inv.id}>
                                    <td>{inv.email}</td>
                                    <td><span className="role-badge">{inv.role}</span></td>
                                    <td>{inv.invited_by_email || '—'}</td>
                                    <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                                    <td>{new Date(inv.expires_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-badge ${status.class}`}>
                                            {status.icon}
                                            {status.text}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        {inv.status === 'pending' && !isExpired && (
                                            <>
                                                <button
                                                    className="action-icon resend"
                                                    onClick={() => { setSelectedInvitation(inv); setActionType('resend'); }}
                                                    title="Resend Invitation"
                                                >
                                                    <FiRepeat size={16} />
                                                </button>
                                                <button
                                                    className="action-icon cancel"
                                                    onClick={() => { setSelectedInvitation(inv); setActionType('cancel'); }}
                                                    title="Cancel Invitation"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredInvitations.length === 0 && (
                <div className="empty-state">
                    <FiMail size={48} />
                    <h3>No Invitations Found</h3>
                    <p>Try adjusting your search or filters</p>
                </div>
            )}

            {/* Confirmation Dialogs */}
            <ConfirmationDialog
                isOpen={!!selectedInvitation && actionType === 'resend'}
                onClose={() => { setSelectedInvitation(null); setActionType(null); }}
                onConfirm={handleResend}
                type="info"
                title="Resend Invitation"
                message={`Resend invitation to ${selectedInvitation?.email}?`}
                confirmText="Resend"
            />

            <ConfirmationDialog
                isOpen={!!selectedInvitation && actionType === 'cancel'}
                onClose={() => { setSelectedInvitation(null); setActionType(null); }}
                onConfirm={handleCancel}
                type="warning"
                title="Cancel Invitation"
                message={`Cancel invitation to ${selectedInvitation?.email}? This action cannot be undone.`}
                confirmText="Cancel"
            />
        </div>
    );
};

export default InvitationTracker;