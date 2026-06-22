import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiUser, FiShield, FiBell, FiDatabase, FiArrowLeft } from 'react-icons/fi';
import { ROUTES } from '../../../config/constants';
import Tabs from '../../common/UI/Tabs';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import TenantSettings from './TenantSettings';

const Settings = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth || { user: null });
    const isAdmin = user?.role === 'client_admin' || user?.role === 'super_admin';

    const tabs = [
        { key: 'security', label: 'Security', icon: <FiShield size={16} /> },
        { key: 'notifications', label: 'Notifications', icon: <FiBell size={16} /> }
    ];
    
    if (isAdmin) {
        tabs.push({ key: 'tenant', label: 'Organization', icon: <FiDatabase size={16} /> });
    }

    const [activeTab, setActiveTab] = useState('security');

    const renderContent = () => {
        switch (activeTab) {
            case 'security':
                return <SecuritySettings />;
            case 'notifications':
                return <NotificationSettings />;
            case 'tenant':
                return <TenantSettings />;
            default:
                return <SecuritySettings />;
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <div className="header-left">
                    <button 
                        className="back-btn"
                        onClick={() => navigate(ROUTES.DASHBOARD)}
                    >
                        <FiArrowLeft size={16} />
                        Back to Dashboard
                    </button>
                </div>
                <div className="header-title">
                    <h1>Settings</h1>
                    <p>Manage your account preferences and security</p>
                </div>
                {isAdmin && (
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: '0.75rem' }}
                        onClick={() => navigate(ROUTES.SECURITY)}
                    >
                        <FiShield size={14} /> Open Security Console
                    </button>
                )}
            </div>
            
            <div className="settings-container">
                <div className="settings-sidebar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
                <div className="settings-content">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings;