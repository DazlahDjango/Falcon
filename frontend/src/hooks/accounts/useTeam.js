import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTeamMembers,
    fetchTeamMemberById,
    fetchReportingChain,
    fetchMyReportingChain,
    clearSelectedMember,
    clearError,
    resetTeam,
    selectTeam,
} from '../../store/accounts/slice/teamSlice';

export const useTeam = () => {
    const dispatch = useDispatch();
    const teamState = useSelector(selectTeam);

    // ========== Data Fetching ==========

    const loadTeamMembers = useCallback(async () => {
        return await dispatch(fetchTeamMembers()).unwrap();
    }, [dispatch]);

    const loadTeamMemberById = useCallback(async (userId) => {
        return await dispatch(fetchTeamMemberById(userId)).unwrap();
    }, [dispatch]);

    const loadReportingChain = useCallback(async (userId) => {
        return await dispatch(fetchReportingChain(userId)).unwrap();
    }, [dispatch]);

    const loadMyReportingChain = useCallback(async () => {
        return await dispatch(fetchMyReportingChain()).unwrap();
    }, [dispatch]);

    // ========== Utilities ==========

    const clearSelectedTeamMember = useCallback(() => {
        dispatch(clearSelectedMember());
    }, [dispatch]);

    const clearTeamError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const resetTeamState = useCallback(() => {
        dispatch(resetTeam());
    }, [dispatch]);

    // ========== Computed Values ==========

    const getDirectReports = () => {
        return teamState.teamMembers.filter(member => member.manager_id === teamState.selectedMember?.id);
    };

    const getTeamHierarchy = (userId = null) => {
        const members = teamState.teamMembers;
        const buildTree = (parentId = null) => {
            return members
                .filter(m => m.manager_id === parentId)
                .map(m => ({
                    ...m,
                    children: buildTree(m.id)
                }));
        };
        return buildTree(userId);
    };

    const getTeamStats = () => {
        const members = teamState.teamMembers;
        return {
            total: members.length,
            active: members.filter(m => m.is_active).length,
            verified: members.filter(m => m.is_verified).length,
            mfaEnabled: members.filter(m => m.mfa_enabled).length,
            roles: members.reduce((acc, m) => {
                acc[m.role] = (acc[m.role] || 0) + 1;
                return acc;
            }, {}),
        };
    };

    // ========== Load on Mount ==========

    useEffect(() => {
        loadTeamMembers();
    }, [loadTeamMembers]);

    // ========== Return ==========

    return {
        // State
        teamMembers: teamState.teamMembers,
        selectedMember: teamState.selectedMember,
        reportingChain: teamState.reportingChain,
        isLoading: teamState.isLoading,
        error: teamState.error,

        // Actions
        loadTeamMembers,
        loadTeamMemberById,
        loadReportingChain,
        loadMyReportingChain,
        clearSelectedTeamMember,
        clearTeamError,
        resetTeamState,

        // Computed Values
        getDirectReports,
        getTeamHierarchy,
        getTeamStats,
    };
};