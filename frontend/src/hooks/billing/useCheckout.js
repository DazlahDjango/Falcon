import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    initializeSubscriptionCheckout, initializeOneTimeCheckout, verifyCheckout,
    setCurrentCheckout, clearCurrentCheckout, setRedirecting, clearError,
    saveCheckoutSession, restoreCheckoutSession,
} from '../../store/billing/slices/checkoutSlice';
import {
    selectCurrentCheckout, selectVerificationResult, selectCheckoutLoading,
    selectCheckoutError, selectCheckoutRedirecting, selectAuthorizationUrl,
    selectCheckoutReference, selectIsCheckoutVerified,
} from '../../store/billing/selectors';

export const useCheckout = () => {
    const dispatch = useDispatch();
    const currentCheckout = useSelector(selectCurrentCheckout);
    const verificationResult = useSelector(selectVerificationResult);
    const loading = useSelector(selectCheckoutLoading);
    const error = useSelector(selectCheckoutError);
    const redirecting = useSelector(selectCheckoutRedirecting);
    const authorizationUrl = useSelector(selectAuthorizationUrl);
    const reference = useSelector(selectCheckoutReference);
    const isVerified = useSelector(selectIsCheckoutVerified);

    const initSubscription = useCallback((params) => dispatch(initializeSubscriptionCheckout(params)), [dispatch]);
    const initOneTime = useCallback((params) => dispatch(initializeOneTimeCheckout(params)), [dispatch]);
    const verify = useCallback((ref) => dispatch(verifyCheckout(ref)), [dispatch]);
    const setCheckout = useCallback((checkout) => dispatch(setCurrentCheckout(checkout)), [dispatch]);
    const clear = useCallback(() => dispatch(clearCurrentCheckout()), [dispatch]);
    const setRedirect = useCallback((status) => dispatch(setRedirecting(status)), [dispatch]);
    const clearCheckoutError = useCallback(() => dispatch(clearError()), [dispatch]);
    const saveSession = useCallback((session) => dispatch(saveCheckoutSession(session)), [dispatch]);
    const restoreSession = useCallback((session) => dispatch(restoreCheckoutSession(session)), [dispatch]);
    const redirectToPaystack = useCallback(() => { if (authorizationUrl) window.location.href = authorizationUrl; }, [authorizationUrl]);
    const openPaystackTab = useCallback(() => { if (authorizationUrl) window.open(authorizationUrl, '_blank'); }, [authorizationUrl]);

    return {
        currentCheckout, verificationResult, loading, error, redirecting,
        authorizationUrl, reference, isVerified,
        initSubscription, initOneTime, verify, setCheckout, clear, setRedirect,
        clearCheckoutError, saveSession, restoreSession, redirectToPaystack, openPaystackTab,
    };
};

export default useCheckout;