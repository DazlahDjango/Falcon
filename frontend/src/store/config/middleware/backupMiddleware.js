export const backupMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  if (action.type === 'backup/triggerBackup/fulfilled') {
    console.log('[BackupMiddleware] Backup triggered successfully:', action.payload);
    const { dispatch } = store;
    setTimeout(() => {
      dispatch({ type: 'backup/fetchBackupJobs' });
    }, 1000);
  }
  if (action.type === 'backup/restoreBackup/fulfilled') {
    console.log('[BackupMiddleware] Restore completed:', action.payload);
  }
  if (action.type === 'backup/verifyBackup/fulfilled') {
    console.log('[BackupMiddleware] Backup verified:', action.payload);
  }
  return result;
};