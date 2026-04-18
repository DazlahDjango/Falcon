import { useSelector, useDispatch } from 'react-redux';
import {
  fetchDomains,
  createDomain,
  verifyDomain,
  deleteDomain,
  clearDomains,
} from '../../store/organisation/slice/domainSlice';

export const useDomains = () => {
  const dispatch = useDispatch();
  const { domains, loading, error } = useSelector(
    (state) => state.domains
  );

  const getDomains = () => {
    dispatch(fetchDomains());
  };

  const addDomain = (data) => {
    return dispatch(createDomain(data)).unwrap();
  };

  const verify = (id) => {
    return dispatch(verifyDomain(id)).unwrap();
  };

  const removeDomain = (id) => {
    return dispatch(deleteDomain(id)).unwrap();
  };

  const clear = () => {
    dispatch(clearDomains());
  };

  return {
    domains,
    loading,
    error,
    getDomains,
    addDomain,
    verifyDomain: verify,
    removeDomain,
    clearDomains: clear,
  };
};