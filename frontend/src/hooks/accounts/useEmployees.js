import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectEmployments, selectEmploymentsLoading } from '../../store/structure';
import { fetchEmployments } from '../../store/structure/slice/employmentSlice';
import { selectUsersTotal, selectUsersLoading } from '../../store/accounts';
import { fetchUsers } from '../../store/accounts/slice/userSlice';

export const useEmployees = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsersTotal) || [];
  const usersLoading = useSelector(selectUsersLoading);
  
  const employments = useSelector(selectEmployments) || [];
  const employmentsLoading = useSelector(selectEmploymentsLoading);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchEmployments({ filters: { is_current: 'true', is_active: 'true' } }));
  }, [dispatch]);

  const loading = usersLoading || employmentsLoading;

  // Merge users with their current employment to get position and salary info
  const data = users.map(user => {
    const emp = employments.find(e => e.user_id === user.id || e.user_id === user.email);
    return {
      ...user,
      id: user.id,
      full_name: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      email: user.email,
      position: emp?.position || user.position || null,
      salary: emp?.salary || user.salary || null,
    };
  });

  return { data, loading };
};

export default useEmployees;
