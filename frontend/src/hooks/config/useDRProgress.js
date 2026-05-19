import { useConfigWebSocket } from './useConfigWebSocket';
import { useState } from 'react';

export const useDRProgress = (executionId) => {
  const [progress, setProgress] = useState({
    status: 'initiated',
    progressPercent: 0,
    completedSteps: 0,
    totalSteps: 0,
    currentStep: null,
    steps: [],
    rtoAchievedMinutes: null,
    rpoAchievedMinutes: null,
    startedAt: null
  });

  const handleMessage = (data) => {
    if (data.type === 'dr_progress' || data.type === 'dr_progress_update') {
      setProgress({
        status: data.status,
        progressPercent: data.progress_percent || data.progressPercent || 0,
        completedSteps: data.completed_steps || data.completedSteps || 0,
        totalSteps: data.total_steps || data.totalSteps || 0,
        currentStep: data.current_step || data.currentStep,
        steps: data.steps || [],
        rtoAchievedMinutes: data.rto_achieved_minutes || data.rtoAchievedMinutes,
        rpoAchievedMinutes: data.rpo_achieved_minutes || data.rpoAchievedMinutes,
        startedAt: data.started_at || data.startedAt
      });
    }
  };

  const { isConnected } = useConfigWebSocket('dr', executionId, handleMessage);

  return { progress, isConnected, isSuccess: progress.status === 'success', isFailed: progress.status === 'failed' };
};