import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectEmploymentsItems, selectEmploymentsLoading } from '../../store/structure';
import { fetchEmployments } from '../../store/structure/slice/employmentSlice';
import { selectUsers, selectUsersLoading } from '../../store/accounts';
import { fetchUsers } from '../../store/accounts/slice/userSlice';

export const useEmployees = () => {
  const dispatch = useDispatch();
  const rawUsers = useSelector(selectUsers);
  const users = Array.isArray(rawUsers) ? rawUsers : (rawUsers?.results || []);
  const usersLoading = useSelector(selectUsersLoading);
  
  const rawEmployments = useSelector(selectEmploymentsItems);
  const employments = Array.isArray(rawEmployments) ? rawEmployments : (rawEmployments?.items || rawEmployments?.results || []);
  const employmentsLoading = useSelector(selectEmploymentsLoading);

  useEffect(() => {
    if (!users.length) {
      dispatch(fetchUsers({ pageSize: 200 }));
    }
    if (!employments.length) {
      dispatch(fetchEmployments({ filters: { is_current: 'true', is_active: 'true' } }));
    }
  }, [dispatch, users.length, employments.length]);

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
