// frontend/src/pages/tenant/TenantBackupsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { BackupListTable, BackupCreateButton, BackupRestoreModal, BackupDeleteModal } from '../../components/tenant/backups';
import { fetchBackups, createBackup, restoreBackup, deleteBackup, selectBackups, selectTenantLoading, selectCreatingBackup, selectRestoringBackup } from '../../store/tenant';

export const TenantBackupsPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const backups = useSelector(selectBackups);
    const loading = useSelector(selectTenantLoading);
    const creatingBackup = useSelector(selectCreatingBackup);
    const restoringBackup = useSelector(selectRestoringBackup);
    const [restoringBackupId, setRestoringBackupId] = useState(null);
    const [deletingBackupId, setDeletingBackupId] = useState(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchBackups(id));
        }
    }, [dispatch, id]);

    const handleCreateBackup = async (data) => {
        await dispatch(createBackup({ tenantId: id, backupType: data.backup_type }));
    };

    const handleRestoreBackup = async () => {
        if (restoringBackupId) {
            await dispatch(restoreBackup({ tenantId: id, backupId: restoringBackupId }));
            setRestoringBackupId(null);
        }
    };

    const handleDeleteBackup = async () => {
        if (deletingBackupId) {
            await dispatch(deleteBackup({ tenantId: id, backupId: deletingBackupId }));
            setDeletingBackupId(null);
        }
    };

    const handleDownloadBackup = async (backupId) => {
        // Implement download logic
        console.log('Download backup', backupId);
    };

    const latestBackup = backups?.[0];

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Backups</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage tenant backups</p>
                </div>
                <BackupCreateButton onCreate={handleCreateBackup} isLoading={creatingBackup} />
            </div>

            {latestBackup && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">💾</span>
                        <div>
                            <p className="font-medium text-blue-800">Latest Backup</p>
                            <p className="text-sm text-blue-600">
                                {new Date(latestBackup.created_at).toLocaleString()} • {latestBackup.file_size_mb} MB
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <BackupListTable
                backups={backups}
                onRestore={(id) => setRestoringBackupId(id)}
                onDelete={(id) => setDeletingBackupId(id)}
                onDownload={handleDownloadBackup}
                loading={loading}
            />

            <BackupRestoreModal
                isOpen={!!restoringBackupId}
                onClose={() => setRestoringBackupId(null)}
                onConfirm={handleRestoreBackup}
                backup={backups?.find(b => b.id === restoringBackupId)}
                isLoading={restoringBackup}
            />

            <BackupDeleteModal
                isOpen={!!deletingBackupId}
                onClose={() => setDeletingBackupId(null)}
                onConfirm={handleDeleteBackup}
                backupDate={backups?.find(b => b.id === deletingBackupId)?.created_at}
            />
        </div>
    );
};