import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

const BackupListPage = () => {
    const { tenantId } = useParams();
    const dispatch = useDispatch();
    const { backups, loading } = useSelector((state) => state.tenantBackup || { backups: [], loading: false });

    useEffect(() => {
        if (tenantId) dispatch({ type: 'tenantBackup/fetchBackups', payload: tenantId });
    }, [dispatch, tenantId]);

    if (loading) return <div className="flex justify-center items-center h-64">Loading backups...</div>;

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center"><h1 className="text-2xl font-bold">Backups</h1><Link to={`/tenants/${tenantId}/backups/create`} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Create Backup</Link></div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full"><thead className="bg-gray-50"><tr><th className="px-6 py-3">Backup</th><th className="px-6 py-3">Size</th><th className="px-6 py-3">Created</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Actions</th></tr></thead>
                <tbody>{(backups || []).map((backup) => (<tr key={backup.id} className="border-t"><td className="px-6 py-4">{backup.name || backup.id}</td><td className="px-6 py-4">{backup.file_size_mb} MB</td><td className="px-6 py-4">{new Date(backup.created_at).toLocaleDateString()}</td><td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded ${backup.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{backup.status}</span></td><td className="px-6 py-4"><Link to={`/tenants/${tenantId}/backups/${backup.id}/restore`} className="text-blue-600">Restore</Link></td></tr>))}</tbody></table>
            </div>
        </div>
    );
};

export default BackupListPage;
