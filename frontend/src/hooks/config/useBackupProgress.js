import { useConfigWebSocket } from './useConfigWebSocket';
import { useState, useEffect } from 'react';

export const useBackupProgress = (backupJobId) => {
  const [progress, setProgress] = useState({
    status: 'pending',
    progressPercent: 0,
    completedItems: 0,
    totalItems: 0,
    currentItem: null,
    sizeBytes: null,
    startedAt: null,
    durationSeconds: null
  });

  const handleMessage = (data) => {
    if (data.type === 'backup_progress' || data.type === 'progress_update') {
      setProgress({
        status: data.status,
        progressPercent: data.progress_percent || data.progressPercent || 0,
        completedItems: data.completed_items || data.completedItems || 0,
        totalItems: data.total_items || data.totalItems || 0,
        currentItem: data.current_item || data.currentItem,
        sizeBytes: data.size_bytes || data.sizeBytes,
        startedAt: data.started_at || data.startedAt,
        durationSeconds: data.duration_seconds || data.durationSeconds
      });
    }
  };

  const { isConnected, lastMessage } = useConfigWebSocket('backup', backupJobId, handleMessage);

  useEffect(() => {
    if (lastMessage && lastMessage.status === 'completed') {
      const interval = setInterval(() => {
        setProgress(prev => ({ ...prev, isComplete: true }));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [lastMessage]);

  return { progress, isConnected, isComplete: progress.status === 'completed', isFailed: progress.status === 'failed' };
};