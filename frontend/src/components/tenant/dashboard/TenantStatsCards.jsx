import React from 'react';
import { FiUsers, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export const TenantStatsCards = ({ tenants = [] }) => {
    // Calculate stats from tenants array if stats object not provided
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.is_active).length;
    const suspendedTenants = tenants.filter(t => !t.is_active).length;
    const provisioningTenants = tenants.filter(t => t.status === 'provisioning').length;

    const cards = [
        { 
            label: 'Total Tenants', 
            value: totalTenants, 
            icon: FiUsers, 
            color: 'blue',
            subtitle: 'Registered'
        },
        { 
            label: 'Active', 
            value: activeTenants, 
            icon: FiCheckCircle, 
            color: 'green',
            subtitle: 'Operational'
        },
        { 
            label: 'Suspended', 
            value: suspendedTenants, 
            icon: FiAlertCircle, 
            color: 'red',
            subtitle: 'Action Required'
        },
        { 
            label: 'Provisioning', 
            value: provisioningTenants, 
            icon: FiRefreshCw, 
            color: 'amber',
            subtitle: 'In Progress'
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <div 
                    key={index} 
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 bg-${card.color}-50 rounded-2xl group-hover:scale-110 transition-transform`}>
                            <card.icon className={`h-6 w-6 text-${card.color}-600`} />
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                            {card.subtitle}
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{card.value.toLocaleString()}</p>
                </div>
            ))}
        </div>
    );
};

export default TenantStatsCards;