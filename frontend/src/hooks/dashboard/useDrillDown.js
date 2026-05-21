// frontend/src/hooks/dashboard/useDrillDown.js

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { hierarchyService } from '../../services/dashboard';
import { DASHBOARD_QUERY_KEYS } from '../../config/constants/dashboardApiConstants';

export const useDrillDown = (initialUserId = null) => {
  const queryClient = useQueryClient();
  
  // State
  const [currentUserId, setCurrentUserId] = useState(initialUserId);
  const [drillHistory, setDrillHistory] = useState([]);
  const [drillDepth, setDrillDepth] = useState(0);
  
  // Query: Current User Data
  const {
    data: currentUserData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.HIERARCHY, 'user', currentUserId],
    queryFn: () => hierarchyService.getUserDetails(currentUserId),
    enabled: !!currentUserId,
    staleTime: 5 * 60 * 1000,
  });
  
  // Query: Team Members of Current User
  const {
    data: teamMembers,
    isLoading: teamLoading,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.HIERARCHY, 'team', currentUserId],
    queryFn: () => hierarchyService.getTeamMembers(currentUserId),
    enabled: !!currentUserId,
    staleTime: 5 * 60 * 1000,
  });
  
  // Query: Reporting Chain
  const {
    data: reportingChain,
    isLoading: chainLoading,
  } = useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.HIERARCHY, 'chain', currentUserId],
    queryFn: () => hierarchyService.getReportingChain(currentUserId),
    enabled: !!currentUserId,
    staleTime: 10 * 60 * 1000,
  });
  
  // Drill down to a specific user
  const drillDown = useCallback(async (userId, onDrillComplete) => {
    if (!userId) return;
    
    // Save current user to history before drilling down
    if (currentUserId) {
      setDrillHistory(prev => [...prev, {
        userId: currentUserId,
        name: currentUserData?.data?.name,
        role: currentUserData?.data?.role,
        timestamp: new Date().toISOString(),
      }]);
      setDrillDepth(prev => prev + 1);
    }
    
    setCurrentUserId(userId);
    
    // Invalidate and refetch data for new user
    await queryClient.invalidateQueries([DASHBOARD_QUERY_KEYS.HIERARCHY]);
    await refetch();
    await refetchTeam();
    
    if (onDrillComplete) onDrillComplete(userId);
  }, [currentUserId, currentUserData, queryClient, refetch, refetchTeam]);
  
  // Go back to previous user in history
  const goBack = useCallback(async (onBackComplete) => {
    if (drillHistory.length === 0) return;
    
    const previousUser = drillHistory[drillHistory.length - 1];
    setDrillHistory(prev => prev.slice(0, -1));
    setDrillDepth(prev => prev - 1);
    setCurrentUserId(previousUser.userId);
    
    // Invalidate and refetch data for previous user
    await queryClient.invalidateQueries([DASHBOARD_QUERY_KEYS.HIERARCHY]);
    await refetch();
    await refetchTeam();
    
    if (onBackComplete) onBackComplete(previousUser.userId);
  }, [drillHistory, queryClient, refetch, refetchTeam]);
  
  // Reset to root (clear drill history)
  const resetToRoot = useCallback(async (rootUserId, onResetComplete) => {
    setDrillHistory([]);
    setDrillDepth(0);
    setCurrentUserId(rootUserId || null);
    
    if (rootUserId) {
      await queryClient.invalidateQueries([DASHBOARD_QUERY_KEYS.HIERARCHY]);
      await refetch();
      await refetchTeam();
    }
    
    if (onResetComplete) onResetComplete();
  }, [queryClient, refetch, refetchTeam]);
  
  // Clear drill history
  const clearHistory = useCallback(() => {
    setDrillHistory([]);
    setDrillDepth(0);
  }, []);
  
  // Check if can drill up (has history)
  const canGoBack = drillHistory.length > 0;
  
  // Check if can drill down to a user (user has reports)
  const canDrillDownTo = useCallback((userId, userRole) => {
    return userRole === 'manager' || userRole === 'supervisor' || userRole === 'department_head';
  }, []);
  
  return {
    // Data
    currentUser: currentUserData?.data || currentUserData,
    teamMembers: teamMembers?.data || teamMembers,
    reportingChain: reportingChain?.data || reportingChain,
    drillHistory,
    drillDepth,
    
    // Loading States
    isLoading,
    teamLoading,
    chainLoading,
    
    // Error
    error,
    
    // Actions
    drillDown,
    goBack,
    resetToRoot,
    clearHistory,
    
    // Flags
    canGoBack,
    canDrillDownTo,
  };
};

export default useDrillDown;