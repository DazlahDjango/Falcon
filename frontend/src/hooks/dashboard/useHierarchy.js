import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { hierarchyService } from '../../services/dashboard/hierarchy.service';
import { showToast } from '../../store/ui/slices/uiSlice';

export const useHierarchy = () => {
  const dispatch = useDispatch();
  const [team, setTeam] = useState([]);
  const [teamAggregate, setTeamAggregate] = useState(null);
  const [orgTree, setOrgTree] = useState(null);
  const [reportingChain, setReportingChain] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drillDownLoading, setDrillDownLoading] = useState(false);

  const fetchTeam = useCallback(async (userId = null, includeSelf = false) => {
    setLoading(true);
    try {
      const response = await hierarchyService.getTeam(userId, includeSelf);
      if (response?.success) {
        setTeam(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch team', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchTeamAggregate = useCallback(async (userId = null) => {
    setLoading(true);
    try {
      const response = await hierarchyService.getTeamAggregate(userId);
      if (response?.success) {
        setTeamAggregate(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch team aggregate', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const drillDown = useCallback(async (targetUserId) => {
    if (!targetUserId) return null;
    setDrillDownLoading(true);
    try {
      const response = await hierarchyService.drillDown(targetUserId);
      if (response?.success) {
        setSelectedUser(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to drill down', type: 'error' }));
      return null;
    } finally {
      setDrillDownLoading(false);
    }
  }, [dispatch]);

  const fetchOrgTree = useCallback(async (rootUserId = null) => {
    setLoading(true);
    try {
      const response = await hierarchyService.getOrgTree(rootUserId);
      if (response?.success) {
        setOrgTree(response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch organization tree', type: 'error' }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const fetchReportingChain = useCallback(async (userId = null, includeSelf = false) => {
    setLoading(true);
    try {
      const response = await hierarchyService.getReportingChain(userId, includeSelf);
      if (response?.success) {
        setReportingChain(response.data.chain || response.data);
        return response.data;
      }
    } catch (err) {
      dispatch(showToast({ message: err.message || 'Failed to fetch reporting chain', type: 'error' }));
      return [];
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const clearSelectedUser = useCallback(() => {
    setSelectedUser(null);
  }, []);

  const refreshHierarchy = useCallback(async (userId = null) => {
    await Promise.all([
      fetchTeam(userId),
      fetchTeamAggregate(userId),
      fetchOrgTree(),
      fetchReportingChain(userId)
    ]);
  }, [fetchTeam, fetchTeamAggregate, fetchOrgTree, fetchReportingChain]);

  return {
    team,
    teamAggregate,
    orgTree,
    reportingChain,
    selectedUser,
    loading,
    drillDownLoading,
    fetchTeam,
    fetchTeamAggregate,
    drillDown,
    fetchOrgTree,
    fetchReportingChain,
    setSelectedUser,
    clearSelectedUser,
    refreshHierarchy
  };
};