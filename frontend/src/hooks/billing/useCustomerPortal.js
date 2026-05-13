import { useMutation } from '@tanstack/react-query';
import { customerPortalService } from '../../services/billing/customerPortal.service';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useCustomerPortal = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (returnUrl) => customerPortalService.createPortalSession(returnUrl),
        onSuccess: (response) => {
            const { portal_url } = response.data;
            if (portal_url) {
                customerPortalService.redirectToPortal(portal_url);
            }
        },
        onError: (error) => {
            dispatch(showToast({ 
                message: error.message || 'Failed to open customer portal', 
                type: 'error' 
            }));
        },
    });
};
export const useCustomerPortalNewTab = () => {
    const dispatch = useDispatch();
    const openPortal = useMutation({
        mutationFn: (returnUrl) => customerPortalService.createPortalSession(returnUrl),
        onSuccess: (response) => {
            const { portal_url } = response.data;
            if (portal_url) {
                customerPortalService.openPortalInNewTab(portal_url);
            }
        },
        onError: (error) => {
            dispatch(showToast({ 
                message: error.message || 'Failed to open customer portal', 
                type: 'error' 
            }));
        },
    });
    return { openPortal };
};