import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kpiService } from "../../../services/kpi";
import useToast from '../useToast';
const KPI_QUERY_KEY = 'kpi';

const useKPI = (id) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data: kpi, isLoading, error } = useQuery({
        queryKey: [KPI_QUERY_KEY, id],
        queryFn: () => kpiService.getKPI(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
    const updateMutation = useMutation({
        mutationFn: (data) => kpiService.updateKPI(id, data),
        onSuccess: (updateKpi) => {
            queryClient.setQueryData([KPI_QUERY_KEY, id], updateKpi);
            queryClient.invalidateQueries({ queryKey: [KPI_QUERY_KEY] });
            toast.success('KPI updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to update KPI');
        }
    });
    const deleteMutation = useMutation({
        mutationFn: kpiService.deleteKPI(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KPI_QUERY_KEY] });
            toast.success('KPI deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to delete KPI');
        }
    });
    const activateMutation = useMutation({
        mutationFn: kpiService.activateKPI(id),
        onSuccess: (activateKpi) => {
            queryClient.setQueryData([KPI_QUERY_KEY, id], activateKpi);
            toast.success('KPI activated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to activate KPI');
        }
    });
    const deactivateMutation = useMutation({
        mutationFn: (reason) => kpiService.deactivateKPI(id, reason),
        onSuccess: (deactivatedKpi) => {
            queryClient.setQueryData([KPI_QUERY_KEY, id], deactivatedKpi);
            toast.success('KPI deactivated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to deactivate KPI');
        }
    });
    const validateMutation = useMutation({
        mutationFn: () => kpiService.validateKPI(id),
        onSuccess: (result) => {
            if (!result.is_valid) {
                toast.warning('KPI validation found issues');
            } else {
                toast.success('KPI validation passed');
            }
            return result;
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Validation failed');
        }
    });
    return {
        kpi,
        isLoading,
        error,
        updateKPI: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        deleteKPI: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        activateKPI: activateMutation.mutate,
        isActivating: activateMutation.isPending,
        deactivateKPI: deactivateMutation.mutate,
        isDeactivating: deactivateMutation.isPending,
        validateKPI: validateMutation.mutate,
        isValidating: validateMutation.isPending
    };
};
export default useKPI;