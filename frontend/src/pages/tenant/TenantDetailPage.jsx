import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
    FiEdit3, FiTrash2, FiSlash, FiCheckCircle, 
    FiArrowLeft, FiActivity, FiDatabase, FiUsers,
    FiSettings, FiShield, FiAlertCircle, FiClock
} from 'react-icons/fi';
import {
    TenantDetailHeader,
    TenantInfoPanel,
    TenantContactPanel,
    TenantDeleteModal,
    TenantSuspendModal,
    TenantActivateModal,
    TenantUpgradeModal,
} from '../../components/tenant/tenant';
import {
    fetchTenantById,
    deleteTenant,
    suspendTenant,
    activateTenant,
    selectCurrentTenant,
    selectTenantLoading,
    selectTenantError,
    openModal,
    closeModal,
    selectModalState,
} from '../../store/tenant/slice';

export const TenantDetailPage = () => {
    const { tenantId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const tenant = useSelector(selectCurrentTenant);
    const loading = useSelector(selectTenantLoading);
    const error = useSelector(selectTenantError);

    const deleteModalOpen = useSelector((state) => selectModalState(state, 'deleteTenant'));
    const suspendModalOpen = useSelector((state) => selectModalState(state, 'suspendTenant'));
    const activateModalOpen = useSelector((state) => selectModalState(state, 'activateTenant'));
    const upgradeModalOpen = useSelector((state) => selectModalState(state, 'upgradeTenant'));

    useEffect(() => {
        if (tenantId) {
            dispatch(fetchTenantById(tenantId));
        }
    }, [dispatch, tenantId]);

    const handleEdit = () => {
        navigate(`/tenants/${tenantId}/edit`);
    };

    const handleDelete = () => {
        dispatch(openModal({ modalName: 'deleteTenant', data: { id: tenantId } }));
    };

    const handleConfirmDelete = async () => {
        await dispatch(deleteTenant(tenantId));
        navigate('/tenants');
        dispatch(closeModal('deleteTenant'));
    };

    const handleSuspend = () => {
        dispatch(openModal({ modalName: 'suspendTenant', data: { id: tenantId } }));
    };

    const handleConfirmSuspend = async (reason) => {
        await dispatch(suspendTenant({ id: tenantId, reason }));
        dispatch(closeModal('suspendTenant'));
    };

    const handleActivate = () => {
        dispatch(openModal({ modalName: 'activateTenant', data: { id: tenantId } }));
    };

    const handleConfirmActivate = async () => {
        await dispatch(activateTenant(tenantId));
        dispatch(closeModal('activateTenant'));
    };

    const handleUpgrade = (plan) => {
        console.log('Upgrade to:', plan);
        dispatch(closeModal('upgradeTenant'));
    };

    if (loading && !tenant) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="kpi-spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center max-w-md mx-auto">
                <FiAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900">Failed to load tenant</h3>
                <p className="text-slate-500 mt-2">{error}</p>
                <button 
                    onClick={() => dispatch(fetchTenantById(tenantId))}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!tenant) return null;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Breadcrumbs / Back */}
            <button 
                onClick={() => navigate('/tenants')}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors"
            >
                <FiArrowLeft /> Back to Tenants
            </button>

            {/* Header Section */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="h-20 w-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200">
                            {tenant.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{tenant.name}</h1>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    tenant.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    {tenant.is_active ? 'Active' : 'Suspended'}
                                </div>
                            </div>
                            <p className="text-slate-400 mt-2 font-mono font-bold tracking-tighter text-lg uppercase">
                                {tenant.schema_name} • {tenant.subscription_plan}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
                        >
                            <FiEdit3 /> Edit
                        </button>
                        {tenant.is_active ? (
                            <button 
                                onClick={handleSuspend}
                                className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-sm hover:bg-amber-100 transition-all border border-amber-200"
                            >
                                <FiSlash /> Suspend
                            </button>
                        ) : (
                            <button 
                                onClick={handleActivate}
                                className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-xl font-bold text-sm hover:bg-green-100 transition-all border border-green-200"
                            >
                                <FiCheckCircle /> Activate
                            </button>
                        )}
                        <button 
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all border border-red-100"
                        >
                            <FiTrash2 /> Delete
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Database Status', value: 'Connected', icon: FiDatabase, color: 'blue' },
                    { label: 'Total Users', value: tenant.user_count || 0, icon: FiUsers, color: 'indigo' },
                    { label: 'Latency', value: '42ms', icon: FiActivity, color: 'green' },
                    { label: 'Uptime', value: '99.9%', icon: FiClock, color: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                        <div className={`p-3 bg-${stat.color}-50 rounded-2xl`}>
                            <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-black text-slate-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                            <FiSettings className="text-slate-400" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Configuration Details</h3>
                        </div>
                        <div className="p-8">
                            <TenantInfoPanel tenant={tenant} />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
                            <FiShield className="text-slate-400" />
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security & Contact</h3>
                        </div>
                        <div className="p-8">
                            <TenantContactPanel tenant={tenant} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TenantDeleteModal
                isOpen={deleteModalOpen}
                onClose={() => dispatch(closeModal('deleteTenant'))}
                onConfirm={handleConfirmDelete}
                tenantName={tenant.name}
            />

            <TenantSuspendModal
                isOpen={suspendModalOpen}
                onClose={() => dispatch(closeModal('suspendTenant'))}
                onConfirm={handleConfirmSuspend}
                tenantName={tenant.name}
            />

            <TenantActivateModal
                isOpen={activateModalOpen}
                onClose={() => dispatch(closeModal('activateTenant'))}
                onConfirm={handleConfirmActivate}
                tenantName={tenant.name}
            />

            <TenantUpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => dispatch(closeModal('upgradeTenant'))}
                onConfirm={handleUpgrade}
                tenantName={tenant.name}
                currentPlan={tenant.subscription_plan}
            />
        </div>
    );
};

export default TenantDetailPage;