// frontend/src/pages/tenant/TenantSettingsPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TenantGeneralSettings, TenantBrandingSettings } from '../../components/tenant/tenant-settings';
import { updateTenant, selectCurrentTenant } from '../../store/tenant';

export const TenantSettingsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const tenant = useSelector(selectCurrentTenant);
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'branding', label: 'Branding', icon: '🎨' },
        { id: 'billing', label: 'Billing', icon: '💰' },
        { id: 'security', label: 'Security', icon: '🔒' },
    ];

    const handleSaveGeneral = async (data) => {
        await dispatch(updateTenant({ id, data }));
    };

    const handleSaveBranding = async (data) => {
        await dispatch(updateTenant({ id, data }));
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tenant Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Manage tenant configuration</p>
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-4">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="max-w-2xl">
                {activeTab === 'general' && (
                    <TenantGeneralSettings 
                        settings={tenant} 
                        onSave={handleSaveGeneral} 
                    />
                )}
                {activeTab === 'branding' && (
                    <TenantBrandingSettings 
                        branding={tenant} 
                        onSave={handleSaveBranding} 
                    />
                )}
                {activeTab === 'billing' && (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                        Billing settings coming soon
                    </div>
                )}
                {activeTab === 'security' && (
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
                        Security settings coming soon
                    </div>
                )}
            </div>
        </div>
    );
};