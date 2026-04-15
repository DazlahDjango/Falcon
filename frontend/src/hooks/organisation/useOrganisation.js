import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCurrentOrganisation,
  updateOrganisation,
  uploadOrganisationLogo,
  clearCurrentOrganisation,
} from '../../store/organisation/slice/organisationSlice';

export const useOrganisation = () => {
  const dispatch = useDispatch();
  const { currentOrganisation: organisation, loading, error } = useSelector(
    (state) => state.organisation
  );

  const getOrganisation = () => {
    return dispatch(fetchCurrentOrganisation()).unwrap();
  };

  const updateOrg = (data) => {
    return dispatch(updateOrganisation({ id: organisation?.id, data })).unwrap();
  };

  const updateLogo = (file) => {
    return dispatch(uploadOrganisationLogo(file)).unwrap();
  };

  const clearOrg = () => {
    dispatch(clearCurrentOrganisation());
  };

  return {
    organisation,
    loading,
    error,
    getOrganisation,
    updateOrganisation: updateOrg,
    updateLogo,
    clearOrganisation: clearOrg,
  };
};