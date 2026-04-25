import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kpiService } from "../../../services/kpi";
import useToast from '../useToast';
const KPIS_QUERY_KEY = 'kpis';

const useKPIs = (filters = {}) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [KPIS_QUERY_KEY, filters],
        queryFn: () => kpiService.getKPIs(filters),
        staleTime: 5 * 60 * 1000,
    });
    const createMutation = useMutation({
        mutationFn: (data) => kpiService.createKPI(data),
        onSuccess: (newKpi) => {
            queryClient.invalidateQueries({ queryKey: [KPIS_QUERY_KEY] });
            toast.success('KPI created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to create KPI');
        }
    });
    const bulkDeleteMutation = useMutation({
        mutationFn: (ids) => Promise.all(ids.map(id => kpiService.deleteKPI(id))),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [KPIS_QUERY_KEY] });
            toast.success('KPIs deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to delete KPIs');
        }
    });
    return {
        kpis: data?.results || [],
        pagination: {
            count: data?.count || 0,
            next: data?.next,
            previous: data?.previous,
            currentPage: filters.page || 1,
            pageSize: filters.page_size || 20
        },
        isLoading,
        error,
        refetch,
        createKPI: createMutation.mutate,
        isCreating: createMutation.isPending,
        bulkDeleteKPIs: bulkDeleteMutation.mutate,
        isBulkDeleting: bulkDeleteMutation.isPending
    };
};
export default useKPIs;