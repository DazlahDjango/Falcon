import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiShield, FiSmartphone, FiLock, FiLogOut } from 'react-icons/fi';
import MFASection from './components/MFASection';
import SessionSection from './components/SessionSection';
import PasswordChange from './components/PasswordChange';

const SecuritySettings = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    return (
        <div className="security-settings">
            <div className="settings-header">
                <h2>Security</h2>
                <p>Manage your account security settings</p>
            </div>
            
            <div className="security-sections">
                {/* Password Change */}
                <div className="security-card">
                    <div className="card-icon">
                        <FiLock size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Password</h3>
                        <p>Change your password to keep your account secure</p>
                        <PasswordChange />
                    </div>
                </div>
                
                {/* MFA Section */}
                <div className="security-card">
                    <div className="card-icon">
                        <FiSmartphone size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Two-Factor Authentication</h3>
                        <p>Add an extra layer of security to your account</p>
                        <MFASection user={user} />
                    </div>
                </div>
                
                {/* Active Sessions */}
                <div className="security-card">
                    <div className="card-icon">
                        <FiShield size={24} />
                    </div>
                    <div className="card-content">
                        <h3>Active Sessions</h3>
                        <p>Manage your active login sessions</p>
                        <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate('/sessions')}
                        >
                            View Sessions
                        </button>
                    </div>
                </div>
            </div>
            
            <SessionSection />
        </div>
    );
};
export default SecuritySettings;