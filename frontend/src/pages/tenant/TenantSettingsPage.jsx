// frontend/src/pages/tenant/TenantSettingsPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Palette } from 'lucide-react'
import { FiSettings, FiDollarSign, FiShield } from 'react-icons/fi';
import { TenantGeneralSettings, TenantBrandingSettings } from '../../components/tenant/tenant-settings';
import { updateTenant, selectCurrentTenant } from '../../store/tenant/slice';


export const TenantSettingsPage = () => {
    const { tenantId } = useParams();
    const dispatch = useDispatch();
    const tenant = useSelector(selectCurrentTenant);
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: FiSettings },
        { id: 'branding', label: 'Branding', icon: Palette },
        { id: 'billing', label: 'Billing', icon: FiDollarSign },
        { id: 'security', label: 'Security', icon: FiShield },
    ];

    const handleSaveGeneral = async (data) => {
        await dispatch(updateTenant({ id: tenantId, data }));
    };

    const handleSaveBranding = async (data) => {
        await dispatch(updateTenant({ id: tenantId, data }));
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tenant Settings</h1>
                <p className="text-slate-500 mt-2">Manage tenant configuration</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden mb-6">
                <nav className="flex border-b border-slate-50 p-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div>
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
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-12 text-center">
                        <FiDollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Billing Settings</h3>
                        <p className="text-slate-500">Coming soon</p>
                    </div>
                )}
                {activeTab === 'security' && (
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-12 text-center">
                        <FiShield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Security Settings</h3>
                        <p className="text-slate-500">Coming soon</p>
                    </div>
                )}
            </div>
        </div>
    );
};