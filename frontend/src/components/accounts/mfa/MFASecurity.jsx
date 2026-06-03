import React, { useState } from 'react';
import MFADeviceManager from './MFADeviceManager';
import SessionList from '../sessions/SessionList';
import ForgotPassword from '../auth/ForgotPassword';

const SecuritySettings = () => {
    const [activeTab, setActiveTab] = useState('mfa');

    return (
        <div className="security-settings-page">
            <div className="security-header">
                <h1>Security Settings</h1>
                <p>Manage your account security and MFA devices</p>
            </div>

            <div className="security-tabs">
                <button
                    className={activeTab === 'mfa' ? 'active' : ''}
                    onClick={() => setActiveTab('mfa')}
                >
                    Multi-Factor Authentication
                </button>
                <button
                    className={activeTab === 'sessions' ? 'active' : ''}
                    onClick={() => setActiveTab('sessions')}
                >
                    Active Sessions
                </button>
                <button
                    className={activeTab === 'password' ? 'active' : ''}
                    onClick={() => setActiveTab('password')}
                >
                    Change Password
                </button>
            </div>

            <div className="security-content">
                {activeTab === 'mfa' && <MFADeviceManager />}
                {activeTab === 'sessions' && <SessionList />}
                {activeTab === 'password' && <ForgotPassword />}
            </div>
        </div>
    );
};

export default SecuritySettings;