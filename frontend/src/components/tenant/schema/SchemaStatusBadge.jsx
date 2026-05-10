import { FiCheckCircle, FiActivity, FiSettings, FiXCircle, FiClock, FiDatabase, FiRefreshCw } from 'react-icons/fi';

export const SchemaStatusBadge = ({ status, isReady }) => {
    const config = {
        active: { label: isReady ? 'Active & Ready' : 'Active', styles: 'bg-green-50 text-green-700 border-green-100', icon: FiCheckCircle },
        creating: { label: 'Creating', styles: 'bg-blue-50 text-blue-700 border-blue-100', icon: FiRefreshCw },
        migrating: { label: 'Migrating', styles: 'bg-amber-50 text-amber-700 border-amber-100', icon: FiSettings },
        failed: { label: 'Failed', styles: 'bg-red-50 text-red-700 border-red-100', icon: FiXCircle },
        pending: { label: 'Pending', styles: 'bg-slate-50 text-slate-700 border-slate-100', icon: FiClock },
    };

    const { label, styles, icon: Icon } = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${styles}`}>
            <Icon className="h-3 w-3" />
            {label}
        </span>
    );
};