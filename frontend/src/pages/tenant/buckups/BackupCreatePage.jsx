import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const BackupCreatePage = () => {
    const { tenantId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [backupType, setBackupType] = useState('full');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await dispatch({ type: 'tenantBackup/createBackup', payload: { tenantId, backup_type: backupType } }).unwrap();
            navigate(`/tenants/${tenantId}/backups`);
        } catch (error) { console.error('Failed to create backup:', error); }
        finally { setLoading(false); }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto"><h1 className="text-2xl font-bold mb-6">Create Backup</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6"><div className="mb-4"><label className="block font-semibold mb-1">Backup Type</label><select value={backupType} onChange={(e) => setBackupType(e.target.value)} className="w-full px-4 py-2 border rounded-lg"><option value="full">Full Backup</option><option value="schema">Schema Only</option><option value="data">Data Only</option></select></div>
        <div className="flex gap-3"><button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg">{loading ? 'Creating...' : 'Create Backup'}</button><button type="button" onClick={() => navigate(`/tenants/${tenantId}/backups`)} className="bg-gray-300 px-4 py-2 rounded-lg">Cancel</button></div></form></div>
    );
};

export default BackupCreatePage;
