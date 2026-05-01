import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationService } from '../../services/structure/location.service';
import { STRUCTURE_QUERY_KEYS } from '../../config/constants/structureConstants';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useLocations = (filters = {}) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.LOCATIONS, filters],
    queryFn: () => locationService.list(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useLocation = (id) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.LOCATIONS, id],
    queryFn: () => locationService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLocationByCode = (code) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.LOCATIONS, code, 'byCode'],
    queryFn: () => locationService.getByCode(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLocationsByCountry = (country) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.LOCATIONS, 'country', country],
    queryFn: () => locationService.getByCountry(country),
    enabled: !!country,
    staleTime: 10 * 60 * 1000,
  });
};

export const useHeadquarters = () => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.LOCATIONS, 'headquarters'],
    queryFn: () => locationService.getHeadquarters(),
    staleTime: 10 * 60 * 1000,
  });
};

export const useLocationMutations = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const createLocation = useMutation({
    mutationFn: (data) => locationService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.LOCATIONS]);
      dispatch(showToast({ message: 'Location created successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to create location', type: 'error' }));
      throw error;
    },
  });
  const updateLocation = useMutation({
    mutationFn: ({ id, data }) => locationService.update(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.LOCATIONS, variables.id]);
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.LOCATIONS]);
      dispatch(showToast({ message: 'Location updated successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to update location', type: 'error' }));
      throw error;
    },
  });
  const deleteLocation = useMutation({
    mutationFn: (id) => locationService.delete(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.LOCATIONS]);
      dispatch(showToast({ message: 'Location deleted successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to delete location', type: 'error' }));
      throw error;
    },
  });
  const updateOccupancy = useMutation({
    mutationFn: ({ id, currentOccupancy }) => locationService.updateOccupancy(id, currentOccupancy),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries([STRUCTURE_QUERY_KEYS.LOCATIONS, variables.id]);
      dispatch(showToast({ message: 'Occupancy updated successfully', type: 'success' }));
      return response;
    },
    onError: (error) => {
      dispatch(showToast({ message: error.message || 'Failed to update occupancy', type: 'error' }));
      throw error;
    },
  });
  return {
    createLocation,
    updateLocation,
    deleteLocation,
    updateOccupancy,
    isCreating: createLocation.isLoading,
    isUpdating: updateLocation.isLoading,
    isDeleting: deleteLocation.isLoading,
    isUpdatingOccupancy: updateOccupancy.isLoading,
  };
};

export const useLocationTree = (includeInactive = false) => {
  return useQuery({
    queryKey: [STRUCTURE_QUERY_KEYS.LOCATIONS, 'tree', { includeInactive }],
    queryFn: () => locationService.getTree(includeInactive),
    staleTime: 5 * 60 * 1000,
  });
};