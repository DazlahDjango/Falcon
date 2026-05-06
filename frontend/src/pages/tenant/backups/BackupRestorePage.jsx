import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const BackupRestorePage = () => {
    const { tenantId, backupId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const handleRestore = async () => {
        setLoading(true);
        try {
            await dispatch({ type: 'tenantBackup/restoreBackup', payload: { tenantId, backupId } }).unwrap();
            navigate(`/tenants/${tenantId}/backups`);
        } catch (error) { console.error('Failed to restore backup:', error); }
        finally { setLoading(false); }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto"><h1 className="text-2xl font-bold mb-6">Restore Backup</h1>
        <div className="bg-white rounded-lg shadow p-6"><div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded"><p className="text-yellow-800">Warning: Restoring a backup will overwrite current data. This action cannot be undone.</p></div>
        <div className="mb-4"><label className="flex items-center"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mr-2" /> I understand this will overwrite existing data</label></div>
        <div className="flex gap-3"><button onClick={handleRestore} disabled={loading || !confirmed} className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">{loading ? 'Restoring...' : 'Confirm Restore'}</button><button onClick={() => navigate(`/tenants/${tenantId}/backups`)} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button></div></div></div>
    );
};

export default BackupRestorePage;
