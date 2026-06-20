import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTenantUsage } from '../../store/tenant/slice';
import { FiTrendingUp, FiActivity, FiCpu, FiCloudLightning, FiAlertCircle, FiLayers, FiList, FiTrendingDown } from 'react-icons/fi';

export const TenantUsagePage = () => {
    const { tenantId } = useParams();
    const dispatch = useDispatch();
    const { usage, loading, error } = useSelector((state) => state.tenantResource || { usage: null, loading: false, error: null });

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchTenantUsage(tenantId));
        }
    }, [dispatch, tenantId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
                <div className="relative flex items-center justify-center">
                    <FiActivity className="h-10 w-10 text-blue-500 animate-spin" />
                    <div className="absolute inset-0 border-2 border-dashed border-blue-500/30 rounded-full animate-ping" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Analyzing live usage statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-red-500 space-y-4">
                <div className="p-4 bg-rose-50 rounded-2xl">
                    <FiAlertCircle className="h-10 w-10 text-rose-500" />
                </div>
                <div className="text-center">
                    <p className="font-bold text-slate-800">Failed to load usage statistics</p>
                    <p className="text-xs text-slate-400 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    const formatKey = (key) => {
        return key.replace(/_/g, ' ').toUpperCase();
    };

    const getIcon = (key) => {
        switch (key) {
            case 'users': return <FiCpu className="h-5 w-5 text-blue-500" />;
            case 'storage': return <FiCloudLightning className="h-5 w-5 text-indigo-500" />;
            case 'api_calls': return <FiActivity className="h-5 w-5 text-purple-500" />;
            case 'kpis': return <FiTrendingUp className="h-5 w-5 text-emerald-500" />;
            case 'departments': return <FiLayers className="h-5 w-5 text-amber-500" />;
            case 'sessions': return <FiList className="h-5 w-5 text-pink-500" />;
            default: return <FiTrendingDown className="h-5 w-5 text-slate-500" />;
        }
    };

    const getGradient = (percentage) => {
        if (percentage >= 90) return 'from-red-500 to-rose-600 shadow-rose-100';
        if (percentage >= 75) return 'from-amber-500 to-orange-600 shadow-orange-100';
        return 'from-blue-500 to-indigo-600 shadow-blue-100';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
                    <FiActivity className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Usage Analytics
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Real-time quota monitoring and database driver metrics
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {usage && Object.entries(usage).map(([key, val]) => {
                    const percentage = Math.min(val?.percentage || 0, 100);
                    return (
                        <div key={key} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3.5 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                    {getIcon(key)}
                                </div>
                                <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-xl uppercase tracking-widest ${
                                    percentage >= 90 ? 'bg-rose-50 text-rose-600' :
                                    percentage >= 75 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    {percentage.toFixed(0)}% Used
                                </span>
                            </div>

                            <h3 className="font-black text-slate-900 text-xs tracking-wider uppercase mb-2">
                                {formatKey(key)}
                            </h3>

                            <div className="flex items-baseline gap-1.5 mb-6">
                                <span className="text-3xl font-black text-slate-900 tracking-tight">{val?.current}</span>
                                <span className="text-slate-400 text-xs font-bold">/ {val?.limit}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full bg-gradient-to-r ${getGradient(percentage)} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TenantUsagePage;

