import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
    FiShield, FiSave, FiUsers, FiCheckCircle, FiXCircle,
    FiAlertCircle, FiRefreshCw, FiUserCheck, FiUserX,
    FiShieldOff, FiShield as FiShieldOn, FiLoader
} from 'react-icons/fi';
import { useAdminMFA } from '../../../hooks/accounts/useAdminMFA';
import { showAlert } from '../../../store/accounts/slice/uiSlice';
import Spinner from '../../common/UI/Spinner';
import { ROLES, ROLE_DISPLAY_NAMES } from '../../../config/constants';

const TenantMFAPolicy = () => {
    const dispatch = useDispatch();
    const {
        tenantPolicy,
        tenantPolicyLoading,
        tenantPolicyUpdating,
        usersPolicy,
        usersPolicyLoading,
        loadTenantMFAPolicy,
        updateTenantMFAPolicy,
        loadAllUsersMFAPolicy,
    } = useAdminMFA();

    const [selectedRoles, setSelectedRoles] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Role options (excluding super_admin as it's system-level)
    const roleOptions = [
        { value: ROLES.CLIENT_ADMIN, label: ROLE_DISPLAY_NAMES[ROLES.CLIENT_ADMIN] },
        { value: ROLES.EXECUTIVE, label: ROLE_DISPLAY_NAMES[ROLES.EXECUTIVE] },
        { value: ROLES.SUPERVISOR, label: ROLE_DISPLAY_NAMES[ROLES.SUPERVISOR] },
        { value: ROLES.DASHBOARD_CHAMPION, label: ROLE_DISPLAY_NAMES[ROLES.DASHBOARD_CHAMPION] },
        { value: ROLES.STAFF, label: ROLE_DISPLAY_NAMES[ROLES.STAFF] },
        { value: ROLES.READ_ONLY, label: ROLE_DISPLAY_NAMES[ROLES.READ_ONLY] },
    ];

    useEffect(() => {
        loadTenantMFAPolicy();
        loadAllUsersMFAPolicy();
    }, [loadTenantMFAPolicy, loadAllUsersMFAPolicy]);

    useEffect(() => {
        if (tenantPolicy) {
            setSelectedRoles(tenantPolicy.mfa_required_roles || []);
        }
    }, [tenantPolicy]);

    const handleRoleToggle = (roleValue) => {
        if (selectedRoles.includes(roleValue)) {
            setSelectedRoles(selectedRoles.filter(r => r !== roleValue));
        } else {
            setSelectedRoles([...selectedRoles, roleValue]);
        }
    };

    const handleSave = async () => {
        setShowConfirm(true);
    };

    const confirmSave = async () => {
        try {
            await updateTenantMFAPolicy(selectedRoles);
            setIsEditing(false);
            setShowConfirm(false);
            dispatch(showAlert({ type: 'success', message: 'MFA policy updated successfully' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error || 'Failed to update MFA policy' }));
        }
    };

    const handleCancel = () => {
        setSelectedRoles(tenantPolicy?.mfa_required_roles || []);
        setIsEditing(false);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case ROLES.CLIENT_ADMIN:
                return <FiShield />;
            case ROLES.EXECUTIVE:
                return <FiUserCheck />;
            case ROLES.SUPERVISOR:
                return <FiUsers />;
            default:
                return <FiUserCheck />;
        }
    };

    const getComplianceStats = () => {
        if (!usersPolicy || usersPolicy.length === 0) {
            return { total: 0, compliant: 0, nonCompliant: 0, complianceRate: 0 };
        }

        const total = usersPolicy.length;
        const compliant = usersPolicy.filter(u => {
            const requiresMFA = selectedRoles.includes(u.role);
            return !requiresMFA || u.mfa_enabled;
        }).length;
        const nonCompliant = total - compliant;
        const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;

        return { total, compliant, nonCompliant, complianceRate };
    };

    const stats = getComplianceStats();

    if (tenantPolicyLoading || usersPolicyLoading) {
        return (
            <div className="policy-loading">
                <Spinner size="lg" />
                <p>Loading policy settings...</p>
            </div>
        );
    }

    return (
        <div className="policy-container tenant-mfa-policy">
            {/* Header */}
            <div className="policy-header">
                <div className="header-title">
                    <FiShield className="header-icon" />
                    <div>
                        <h1>MFA Policy</h1>
                        <p>Configure which roles require Multi-Factor Authentication</p>
                    </div>
                </div>
                <div className="header-actions">
                    {!isEditing ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setIsEditing(true)}
                        >
                            <FiSave /> Edit Policy
                        </button>
                    ) : (
                        <>
                            <button
                                className="btn btn-secondary"
                                onClick={handleCancel}
                                disabled={tenantPolicyUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={tenantPolicyUpdating}
                            >
                                {tenantPolicyUpdating ? <Spinner size="sm" /> : <FiSave />}
                                Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="policy-stats">
                <div className="stat-card">
                    <div className="stat-icon"><FiUsers /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.total}</div>
                        <div className="stat-label">Total Users</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon"><FiCheckCircle /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.compliant}</div>
                        <div className="stat-label">MFA Compliant</div>
                    </div>
                </div>
                <div className="stat-card warning">
                    <div className="stat-icon"><FiAlertCircle /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.nonCompliant}</div>
                        <div className="stat-label">Need MFA Setup</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon"><FiShieldOn /></div>
                    <div className="stat-info">
                        <div className="stat-value">{stats.complianceRate}%</div>
                        <div className="stat-label">Compliance Rate</div>
                    </div>
                </div>
            </div>

            {/* Role Selection Section */}
            <div className="policy-section">
                <div className="section-header">
                    <h2>Roles Requiring MFA</h2>
                    <p>Select roles that must have MFA enabled to access the system</p>
                </div>

                <div className="roles-grid">
                    {roleOptions.map((role) => (
                        <div
                            key={role.value}
                            className={`role-card ${selectedRoles.includes(role.value) ? 'selected' : ''} ${isEditing ? 'editable' : ''}`}
                            onClick={() => isEditing && handleRoleToggle(role.value)}
                        >
                            <div className="role-icon">
                                {getRoleIcon(role.value)}
                            </div>
                            <div className="role-info">
                                <div className="role-name">{role.label}</div>
                                <div className="role-status">
                                    {selectedRoles.includes(role.value) ? (
                                        <span className="status-badge required">
                                            <FiShieldOn /> MFA Required
                                        </span>
                                    ) : (
                                        <span className="status-badge optional">
                                            <FiShieldOff /> Optional
                                        </span>
                                    )}
                                </div>
                            </div>
                            {isEditing && (
                                <div className="role-checkbox">
                                    {selectedRoles.includes(role.value) ? (
                                        <FiCheckCircle className="checked" />
                                    ) : (
                                        <div className="unchecked" />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {isEditing && (
                    <div className="policy-note">
                        <FiAlertCircle />
                        <span>
                            Users in roles marked as "MFA Required" will be prompted to set up MFA on their next login.
                        </span>
                    </div>
                )}
            </div>

            {/* Affected Users Preview */}
            {usersPolicy && usersPolicy.length > 0 && (
                <div className="policy-section">
                    <div className="section-header">
                        <h2>Affected Users Preview</h2>
                        <p>Users who will be affected by the current policy</p>
                    </div>

                    <div className="affected-users">
                        <div className="users-summary">
                            {roleOptions.map((role) => {
                                const usersInRole = usersPolicy.filter(u => u.role === role.value);
                                const requiresMFA = selectedRoles.includes(role.value);
                                const nonCompliantUsers = usersInRole.filter(u => !u.mfa_enabled && requiresMFA);

                                if (usersInRole.length === 0) return null;

                                return (
                                    <div key={role.value} className="role-summary">
                                        <div className="role-summary-header">
                                            <span className="role-name">{role.label}</span>
                                            <span className="user-count">{usersInRole.length} users</span>
                                        </div>
                                        {requiresMFA && nonCompliantUsers.length > 0 && (
                                            <div className="non-compliant-warning">
                                                <FiAlertCircle />
                                                <span>{nonCompliantUsers.length} user(s) need to set up MFA</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <FiShield className="modal-icon warning" />
                            <h3>Update MFA Policy?</h3>
                        </div>
                        <p>This will update MFA requirements for all users in the selected roles. Affected users will be prompted to set up MFA on their next login.</p>
                        <div className="affected-summary">
                            <strong>Changes:</strong>
                            <ul>
                                {roleOptions.map(role => {
                                    const wasSelected = tenantPolicy?.mfa_required_roles?.includes(role.value);
                                    const isNowSelected = selectedRoles.includes(role.value);
                                    if (wasSelected !== isNowSelected) {
                                        return (
                                            <li key={role.value}>
                                                {role.label}: {wasSelected ? 'Removing' : 'Adding'} MFA requirement
                                            </li>
                                        );
                                    }
                                    return null;
                                })}
                            </ul>
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={confirmSave}>
                                Confirm Update
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenantMFAPolicy;