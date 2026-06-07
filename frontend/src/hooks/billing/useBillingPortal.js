import { useCallback, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPortalAccess, fetchPortalOverview } from '../../store/billing/slices/billingPortalSlice';
import { selectPortalAccess, selectPortalOverview, selectPortalLoading, selectPortalError } from '../../store/billing/selectors';

export const useBillingPortal = () => {
    const dispatch = useDispatch();
    const [redirecting, setRedirecting] = useState(false);
    const portalAccess = useSelector(selectPortalAccess);
    const portalOverview = useSelector(selectPortalOverview);
    const loading = useSelector(selectPortalLoading);
    const error = useSelector(selectPortalError);
    const hasFetchedOverview = useRef(false);

    const getAccess = useCallback((returnUrl = null) => dispatch(fetchPortalAccess(returnUrl)), [dispatch]);
    const getOverview = useCallback(() => {
        if (!hasFetchedOverview.current) {
            hasFetchedOverview.current = true;
            return dispatch(fetchPortalOverview());
        }
    }, [dispatch]);
    const redirectToPortal = useCallback(async (returnUrl = null) => {
        setRedirecting(true);
        try {
            const result = await dispatch(fetchPortalAccess(returnUrl)).unwrap();
            if (result?.portal_url) window.location.href = result.portal_url;
            return true;
        } catch { return false; } finally { setRedirecting(false); }
    }, [dispatch]);
    const openPortalTab = useCallback(async (returnUrl = null) => {
        const result = await dispatch(fetchPortalAccess(returnUrl)).unwrap();
        if (result?.portal_url) { window.open(result.portal_url, '_blank'); return true; }
        return false;
    }, [dispatch]);

    return {
        portalAccess, portalOverview, loading, error, redirecting,
        getAccess, getOverview, redirectToPortal, openPortalTab,
    };
};

export default useBillingPortal;