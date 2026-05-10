import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiActivity, FiClock, FiCheckCircle } from 'react-icons/fi';

export const TenantListWidget = ({ tenants = [], loading = false }) => {
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="p-8 space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-slate-50 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    const recentTenants = tenants?.slice(0, 5);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/10">
                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Instance Name</th>
                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Plan</th>
                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Registered</th>
                        <th className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {recentTenants?.map((tenant) => (
                        <tr 
                            key={tenant.id} 
                            className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                            onClick={() => navigate(`/tenants/${tenant.id}`)}
                        >
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                                        {tenant.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                            {tenant.name}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium font-mono uppercase">
                                            {tenant.schema_name}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    tenant.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    <div className={`h-1.5 w-1.5 rounded-full ${tenant.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                    {tenant.is_active ? 'Active' : 'Suspended'}
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                    <div className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase">
                                        {tenant.subscription_plan || 'Free'}
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-5 text-slate-500 text-sm font-medium">
                                {new Date(tenant.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-8 py-5 text-right">
                                <button className="p-2 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <FiArrowRight />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {(!recentTenants || recentTenants.length === 0) && (
                        <tr>
                            <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold">
                                No tenants currently registered
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TenantListWidget;