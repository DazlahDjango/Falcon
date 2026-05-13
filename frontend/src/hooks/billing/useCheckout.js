import { useMutation } from '@tanstack/react-query';
import { checkoutService } from '../../services/billing/checkout.service';
import { showToast } from '../../store/ui/slices/uiSlice';
import { useDispatch } from 'react-redux';

export const useCheckout = () => {
    const dispatch = useDispatch();
    return useMutation({
        mutationFn: (data) => checkoutService.createCheckoutSession(data),
        onSuccess: (response) => {
            const { checkout_url } = response.data;
            if (checkout_url) {
                checkoutService.redirectToCheckout(checkout_url);
            }
        },
        onError: (error) => {
            dispatch(showToast({ 
                message: error.message || 'Failed to create checkout session', 
                type: 'error' 
            }));
        },
    });
};
export const useCheckoutSession = (sessionId) => {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (!sessionId) return;
        const fetchSession = async () => {
            try {
                setIsLoading(true);
                const response = await checkoutService.getCheckoutSession(sessionId);
                setSession(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSession();
    }, [sessionId]);
    return { session, isLoading, error };
};