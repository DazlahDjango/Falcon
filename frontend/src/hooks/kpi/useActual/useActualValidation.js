import { useMutation, useQueryClient } from '@tanstack/react-query';
import { actualService } from '../../../services/kpi';
import validationService from '../../../services/kpi';
import useToast from '../useToast';

const useActualValidation = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const approveMutation = useMutation({
        mutationFn: ({ id, comment }) => actualService.approveActual(id, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actuals'] });
            queryClient.invalidateQueries({ queryKey: ['validations'] });
            toast.success('Entry approved successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to approve entry');
        }
    });
    const rejectMutation = useMutation({
        mutationFn: ({ id, reasonId, comment }) => actualService.rejectActual(id, reasonId, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actuals'] });
            queryClient.invalidateQueries({ queryKey: ['validations'] });
            toast.success('Entry rejected');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to reject entry');
        }
    });
    const escalateMutation = useMutation({
        mutationFn: ({ id, reason }) => validationService.createEscalation(id, null, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['escalations'] });
            toast.success('Escalation created');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to escalate');
        }
    });
    const batchApproveMutation = useMutation({
        mutationFn: ({ ids, comment }) => validationService.batchApprove(ids, comment),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['actuals'] });
            queryClient.invalidateQueries({ queryKey: ['validations'] });
            toast.success('Batch approval completed');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Batch approval failed');
        }
    });
    return {
        approveEntry: approveMutation.mutate,
        isApproving: approveMutation.isPending,
        rejectEntry: rejectMutation.mutate,
        isRejecting: rejectMutation.isPending,
        escalateEntry: escalateMutation.mutate,
        isEscalating: escalateMutation.isPending,
        batchApprove: batchApproveMutation.mutate,
        isBatchApproving: batchApproveMutation.isPending
    };
};
export default useActualValidation;