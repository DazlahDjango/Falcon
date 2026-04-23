import { useSelector, useDispatch } from 'react-redux';
import {
  fetchDepartmentTree,
  moveDepartment,
  clearCurrentDepartment,
} from '../../store/organisations/slice/departmentSlice';

export const useDepartmentHierarchy = () => {
  const dispatch = useDispatch();
  const { departmentTree, loading, error } = useSelector(
    (state) => state.departments
  );

  const getTree = () => {
    return dispatch(fetchDepartmentTree()).unwrap();
  };

  const reorderDepartment = (id, newParentId) => {
    return dispatch(moveDepartment({ id, newParentId })).unwrap();
  };

  const clear = () => {
    dispatch(clearCurrentDepartment());
  };

  return {
    departmentTree,
    loading,
    error,
    getTree,
    reorderDepartment,
    clear,
  };
};
