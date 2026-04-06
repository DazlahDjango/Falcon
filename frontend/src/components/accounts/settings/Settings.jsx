import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FiUser, FiShield, FiBell, FiDatabase, FiSettings as FiSettingsIcon } from 'react-icons/fi';
import Tabs from '../../common/UI/Tabs';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import TenantSettings from './TenantSettings';

const Settings = () => {
    const { user } = useSelector((state) => state.auth);
    const isAdmin = user?.role === 'client_admin' || user?.role === 'super_admin';
    const tabs = [
        { key: 'profile', label: 'Profile', icon: <FiUser size={16} /> },
        { key: 'security', label: 'Security', icon: <FiShield size={16} /> },
        { key: 'notifications', label: 'Notifications', icon: <FiBell size={16} /> }
    ];
    if (isAdmin) {
        tabs.push({ key: 'tenant', label: 'Tenant Settings', icon: <FiDatabase size={16} /> });
    }
    const [activeTab, setActiveTabs] = useState('profile');
    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <ProfileSettings />;
            case 'security':
                return <SecuritySettings />;
            case 'notifications':
                return <NotificationSettings />;
            case 'tenant':
                return <TenantSettings />;
            default:
                return <ProfileSettings />;
        }
    };
    return (
        <div className="settings-page">
            <div className="page-header">
                <h1>Settings</h1>
                <p>Manage your account preferences and security</p>
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