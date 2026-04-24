import { useSelector, useDispatch } from 'react-redux';
import {
  fetchPositions,
  createPosition,
  updatePosition,
  deletePosition,
  clearPositions,
} from '../../store/organisations/slice/positionSlice';

export const usePositions = () => {
  const dispatch = useDispatch();
  const { positions, total, loading, error } = useSelector(
    (state) => state.positions
  );

  const getPositions = (params = {}) => {
    dispatch(fetchPositions(params));
  };

  const addPosition = (data) => {
    return dispatch(createPosition(data)).unwrap();
  };

  const editPosition = (id, data) => {
    return dispatch(updatePosition({ id, data })).unwrap();
  };

  const removePosition = (id) => {
    return dispatch(deletePosition(id)).unwrap();
  };

  const clear = () => {
    dispatch(clearPositions());
  };

  return {
    positions,
    total,
    loading,
    error,
    getPositions,
    addPosition,
    editPosition,
    removePosition,
    clearPositions: clear,
  };
};