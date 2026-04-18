import { useSelector, useDispatch } from 'react-redux';
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  clearDepartments,
} from '../../store/organisation/slice/departmentSlice';

export const useDepartments = () => {
  const dispatch = useDispatch();
  const { departments, total, loading, error } = useSelector(
    (state) => state.departments
  );

  const getDepartments = (params = {}) => {
    dispatch(fetchDepartments(params));
  };

  const addDepartment = (data) => {
    return dispatch(createDepartment(data)).unwrap();
  };

  const editDepartment = (id, data) => {
    return dispatch(updateDepartment({ id, data })).unwrap();
  };

  const removeDepartment = (id) => {
    return dispatch(deleteDepartment(id)).unwrap();
  };

  const clear = () => {
    dispatch(clearDepartments());
  };

  return {
    departments,
    total,
    loading,
    error,
    getDepartments,
    addDepartment,
    editDepartment,
    removeDepartment,
    clearDepartments: clear,
  };
};