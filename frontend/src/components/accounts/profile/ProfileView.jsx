import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar,
    FiGlobe, FiEdit2, FiSave, FiX, FiShield,
    FiLock, FiCheckCircle, FiAlertCircle, FiClock,
    FiActivity, FiSmartphone, FiCode, FiShieldOff,
    FiMapPin, FiAward, FiBookOpen
} from 'react-icons/fi';
import { useProfile } from '../../../hooks/accounts/useProfile';
import { useAuth } from '../../../hooks/accounts/useAuth';
import { useMFA } from '../../../hooks/accounts/useMfa';
import AvatarUpload from '../users/components/AvatarUpload';
import PasswordChangeForm from './PasswordChangeForm';
import ActivityTimeline from './ActivityTimeline';
import Spinner from '../../common/UI/Spinner';
import { showAlert } from '../../../store/accounts/slice/uiSlice';

const ProfileView = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: authUser } = useAuth();
    const {
        profile,
        isLoading,
        updateUserProfile,
        loadProfile,
    } = useProfile();
    const {
        isMfaEnabled,
        loadMfaStatus,
        devices,
        loadDevices,
        backupCodesRemaining,
        loadMfaStatus: refreshMfaStatus,
    } = useMFA();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadProfile();
        loadMfaStatus();
        loadDevices();
    }, [loadProfile, loadMfaStatus, loadDevices]);

    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || '',
                last_name: profile.last_name || '',
                phone: profile.phone_number || profile.phone || '',
                title: profile.title || '',
                department: profile.department || '',
                location: profile.location || '',
                timezone: profile.timezone || 'Africa/Nairobi',
                bio: profile.bio || '',
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateUserProfile(formData);
            setIsEditing(false);
            dispatch(showAlert({ type: 'success', message: 'Profile updated successfully' }));
        } catch (error) {
            dispatch(showAlert({ type: 'error', message: error || 'Failed to update profile' }));
        } finally {
            setIsSaving(false);
        }
    };

    const getMFAStatusBadge = () => {
        if (isMfaEnabled) {
            return { text: 'MFA Enabled', class: 'status-enabled', icon: <FiShield /> };
        }
        return { text: 'MFA Disabled', class: 'status-disabled', icon: <FiShieldOff /> };
    };

    const getFullName = () => {
        return `${formData.first_name || ''} ${formData.last_name || ''}`.trim() || authUser?.email || 'User';
    };

    const getInitials = () => {
        const fullName = getFullName();
        if (fullName === authUser?.email) {
            return fullName.charAt(0).toUpperCase();
        }
        return fullName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    const mfaStatusBadge = getMFAStatusBadge();

    if (isLoading && !profile) {
        return (
            <div className="profile-loading">
                <Spinner size="lg" />
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Header */}
            <div className="profile-header">
                <div className="profile-header-content">
                    <h1>My Profile</h1>
                    <p>Manage your personal information and security settings</p>
                </div>
                {!isEditing ? (
                    <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                        <FiEdit2 size={16} />
                        Edit Profile
                    </button>
                ) : (
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                            <FiX size={16} />
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving}>
                            {isSaving ? <Spinner size="sm" /> : <FiSave size={16} />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
                <button
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <FiUser size={16} />
                    Profile
                </button>
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <FiShield size={16} />
                    Security
                </button>
                <button
                    className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
                    onClick={() => setActiveTab('activity')}
                >
                    <FiActivity size={16} />
                    Activity
                </button>
            </div>

            {/* Tab Content */}
            <div className="profile-tab-content">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="profile-tab">
                        {/* Avatar Section */}
                        <div className="profile-avatar-section">
                            <AvatarUpload />
                        </div>

                        {/* Profile Form */}
                        <form className="profile-form">
                            <div className="form-section">
                                <h3>Personal Information</h3>
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
                                                disabled={!isEditing}
                                                className="form-input"
                                                placeholder="John"
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
                                            disabled={!isEditing}
                                            className="form-input"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <FiMail className="input-icon" />
                                        <input
                                            type="email"
                                            value={authUser?.email || ''}
                                            disabled={true}
                                            className="form-input"
                                        />
                                    </div>
                                    <small className="input-help">Email cannot be changed</small>
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div className="input-wrapper">
                                        <FiPhone className="input-icon" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="form-input"
                                            placeholder="+254 700 000 000"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Professional Information</h3>
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
                                                disabled={!isEditing}
                                                className="form-input"
                                                placeholder="Senior Developer"
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
                                            disabled={!isEditing}
                                            className="form-input"
                                            placeholder="Engineering"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <h3>Preferences</h3>
                                <div className="form-group">
                                    <label>Time Zone</label>
                                    <div className="input-wrapper">
                                        <FiGlobe className="input-icon" />
                                        <select
                                            name="timezone"
                                            value={formData.timezone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="form-input"
                                        >
                                            <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                                            <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                                            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                                            <option value="Africa/Cairo">Africa/Cairo (EET)</option>
                                            <option value="America/New_York">America/New_York (EST)</option>
                                            <option value="Europe/London">Europe/London (GMT)</option>
                                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        rows={4}
                                        className="form-input"
                                        placeholder="Tell us a little about yourself..."
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="security-tab">
                        {/* MFA Status Card */}
                        <div className="security-card">
                            <div className="card-header">
                                <FiShield size={20} />
                                <h3>Multi-Factor Authentication</h3>
                            </div>
                            <div className="card-content">
                                <div className={`mfa-status ${mfaStatusBadge.class}`}>
                                    {mfaStatusBadge.icon}
                                    <span>{mfaStatusBadge.text}</span>
                                </div>
                                <p className="card-description">
                                    Add an extra layer of security to your account by requiring
                                    a verification code in addition to your password.
                                </p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => navigate('/security/mfa')}
                                >
                                    {isMfaEnabled ? 'Manage MFA Settings' : 'Enable MFA'}
                                </button>
                            </div>
                        </div>

                        {/* MFA Devices Card */}
                        {devices && devices.length > 0 && (
                            <div className="security-card">
                                <div className="card-header">
                                    <FiSmartphone size={20} />
                                    <h3>MFA Devices</h3>
                                </div>
                                <div className="device-list">
                                    {devices.filter(d => d.is_active).slice(0, 3).map(device => (
                                        <div key={device.id} className="device-item">
                                            <div className="device-icon">
                                                <FiSmartphone />
                                            </div>
                                            <div className="device-info">
                                                <div className="device-name">{device.name}</div>
                                                <div className="device-meta">
                                                    {device.is_primary && <span className="device-badge primary">Primary</span>}
                                                    {device.is_verified && <span className="device-badge verified">Verified</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {devices.filter(d => d.is_active).length > 3 && (
                                    <button
                                        className="btn-link"
                                        onClick={() => navigate('/security/mfa/devices')}
                                    >
                                        View all {devices.filter(d => d.is_active).length} devices
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Backup Codes Card */}
                        <div className="security-card">
                            <div className="card-header">
                                <FiCode size={20} />
                                <h3>Backup Codes</h3>
                            </div>
                            <div className="card-content">
                                <div className="backup-stats">
                                    <span className="backup-count">{backupCodesRemaining || 0}</span>
                                    <span className="backup-label">codes remaining</span>
                                </div>
                                <p className="card-description">
                                    Backup codes can be used to access your account when you don't have access to your authenticator app.
                                </p>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => navigate('/security/mfa/backup-codes')}
                                >
                                    Manage Backup Codes
                                </button>
                            </div>
                        </div>

                        {/* Password Change Card */}
                        <div className="security-card">
                            <div className="card-header">
                                <FiLock size={20} />
                                <h3>Password</h3>
                            </div>
                            <div className="card-content">
                                <p className="card-description">
                                    Change your password regularly to keep your account secure.
                                </p>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* Password Change Form Modal/Drawer */}
                        {showPasswordForm && (
                            <div className="password-form-container">
                                <div className="password-form-overlay">
                                    <div className="password-form-wrapper">
                                        <button
                                            className="close-btn"
                                            onClick={() => setShowPasswordForm(false)}
                                        >
                                            <FiX size={20} />
                                        </button>
                                        <PasswordChangeForm onClose={() => setShowPasswordForm(false)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Login Activity */}
                        <div className="security-card">
                            <div className="card-header">
                                <FiClock size={20} />
                                <h3>Recent Login Activity</h3>
                            </div>
                            <div className="card-content">
                                <div className="login-info">
                                    <div className="login-item">
                                        <span className="login-label">Last Login:</span>
                                        <span className="login-value">
                                            {authUser?.last_login ? new Date(authUser.last_login).toLocaleString() : 'Never'}
                                        </span>
                                    </div>
                                    <div className="login-item">
                                        <span className="login-label">Last IP:</span>
                                        <span className="login-value">{authUser?.last_login_ip || 'Unknown'}</span>
                                    </div>
                                    <div className="login-item">
                                        <span className="login-label">Account Created:</span>
                                        <span className="login-value">
                                            {authUser?.date_joined ? new Date(authUser.date_joined).toLocaleDateString() : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="activity-tab">
                        <div className="activity-header">
                            <h3>Recent Activity</h3>
                            <p>Your recent login and security activities</p>
                        </div>
                        <ActivityTimeline limit={20} showHeader={false} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileView;