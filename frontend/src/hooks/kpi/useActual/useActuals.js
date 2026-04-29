import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { actualService } from '../../../services/kpi';
import useToast from '../useToast';
const ACTUALS_QUERY_KEY = 'actuals';

const useActuals = (filters = {}) => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [ACTUALS_QUERY_KEY, filters],
        queryFn: () => actualService.getActuals(filters),
        staleTime: 60 * 1000,
    });
    const createMutation = useMutation({
        mutationFn: (data) => actualService.createActual(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACTUALS_QUERY_KEY] });
            toast.success('Actual created successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to create actual');
        }
    });
    const getSubmissionRate = () => {
        if (!data?.results) return 0;
        const total = data.count;
        const submitted = data.results.filter(a => a.status !== 'DRAFT').length;
        return total > 0 ? (submitted / total) * 100 : 0;
    };
    const getValidationRate = () => {
        if (!data?.results) return 0;
        const total = data.results.filter(a => a.status !== 'DRAFT').length;
        const validated = data.results.filter(a => a.status === 'APPROVED' || a.status === 'REJECTED').length;
        return total > 0 ? (validated / total) * 100 : 0;
    };
    return {
        actuals: data?.results || [],
        pagination: {
            count: data?.count || 0,
            next: data?.next,
            previous: data?.previous
        },
        isLoading,
        error,
        refetch,
        createActual: createMutation.mutate,
        isCreating: createMutation.isPending,
        getSubmissionRate,
        getValidationRate
    };
};
export default useActuals;