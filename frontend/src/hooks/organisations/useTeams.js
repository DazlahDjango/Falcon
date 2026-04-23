import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  clearTeams,
} from '../../store/organisations/slice/teamSlice';

export const useTeams = () => {
  const dispatch = useDispatch();
  const { teams, total, loading, error } = useSelector(
    (state) => state.teams
  );

  const getTeams = (params = {}) => {
    dispatch(fetchTeams(params));
  };

  const addTeam = (data) => {
    return dispatch(createTeam(data)).unwrap();
  };

  const editTeam = (id, data) => {
    return dispatch(updateTeam({ id, data })).unwrap();
  };

  const removeTeam = (id) => {
    return dispatch(deleteTeam(id)).unwrap();
  };

  const clear = () => {
    dispatch(clearTeams());
  };

  return {
    teams,
    total,
    loading,
    error,
    getTeams,
    addTeam,
    editTeam,
    removeTeam,
    clearTeams: clear,
  };
};