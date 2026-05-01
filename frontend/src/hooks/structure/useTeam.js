import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../../services/structure/team.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useTeam = (id, options = {}) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.TEAM, id],
    queryFn: () => teamService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

export const useTeamByCode = (code) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.TEAM, code, 'byCode'],
    queryFn: () => teamService.getByCode(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTeamMutations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const createTeam = useMutation({
    mutationFn: (data) => teamService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.TEAMS]);
      dispatch(showToast({ message: 'Team created successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to create team', type: 'error' }));
      throw error;
    },
  });
  const updateTeam = useMutation({
    mutationFn: ({ id, data }) => teamService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.TEAM, variables.id]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.TEAMS]);
      dispatch(showToast({ message: 'Team updated successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to update team', type: 'error' }));
      throw error;
    },
  });
  const deleteTeam = useMutation({
    mutationFn: (id) => teamService.delete(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.TEAMS]);
      queryClient.removeQueries([STRUCTURE_QUERY_KEYS.TEAM, id]);
      dispatch(showToast({ message: 'Team deleted successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to delete team', type: 'error' }));
      throw error;
    },
  });
  const addMember = useMutation({
    mutationFn: ({ id, userId }) => teamService.addMember(id, userId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.TEAM, variables.id]);
      dispatch(showToast({ message: 'Member added successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to add member', type: 'error' }));
      throw error;
    },
  });
  const removeMember = useMutation({
    mutationFn: ({ id, userId }) => teamService.removeMember(id, userId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.TEAM, variables.id]);
      dispatch(showToast({ message: 'Member removed successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to remove member', type: 'error' }));
      throw error;
    },
  });
  return {
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    isCreating: createTeam.isLoading,
    isUpdating: updateTeam.isLoading,
    isDeleting: deleteTeam.isLoading,
    isAddingMember: addMember.isLoading,
    isRemovingMember: removeMember.isLoading,
  };
};

export const useTeamMembers = (id) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.TEAM, id, 'members'],
    queryFn: () => teamService.getMembers(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });
};